import { HttpError, type Route, noContent, page } from "../http.ts";
import { type Doc, type Frag, type S, type State, id, now, state as store } from "../state.ts";
import { ownedCourse } from "./courses.ts";

const TYPES: Record<string, Doc["file_type"]> = { pdf: "pdf", docx: "docx", md: "markdown", markdown: "markdown" };
const MAX_BYTES = 20 * 1024 * 1024;
/** How long a document stays "processing", so the app's polling is exercised. */
const PROCESSING_MS = 1200;

function parseMultipart(contentType: string, body: Buffer): { name: string; data: Buffer } | null {
  const boundary = /boundary=(?:"([^"]+)"|([^;]+))/.exec(contentType);
  if (!boundary) return null;
  const marker = Buffer.from(`--${boundary[1] ?? boundary[2]}`);
  const start = body.indexOf(marker);
  const headerEnd = body.indexOf("\r\n\r\n", start);
  const next = body.indexOf(marker, headerEnd);
  if (start < 0 || headerEnd < 0 || next < 0) return null;
  const headers = body.subarray(start, headerEnd).toString();
  const name = /filename="([^"]*)"/.exec(headers)?.[1] ?? "documento";
  return { name, data: body.subarray(headerEnd + 4, next - 2) };
}

function markdownFragments(text: string): { section: string; text: string }[] {
  const out: { section: string; text: string }[] = [];
  let section = "Inicio";
  let lines: string[] = [];
  const flush = () => {
    const body = lines.join(" ").trim();
    if (body) out.push({ section, text: body });
    lines = [];
  };
  for (const line of text.split("\n")) {
    const heading = /^#{1,6}\s+(.+)$/.exec(line.trim());
    if (heading) {
      flush();
      section = heading[1].trim();
    } else if (line.trim()) {
      lines.push(line.trim());
    }
  }
  flush();
  return out;
}

function process(docId: string, data: Buffer) {
  setTimeout(() => {
    const current: State = store.current;
    const doc = current.documents.find((d) => d.id === docId);
    if (!doc) return;
    const isPdf = data.subarray(0, 4).toString() === "%PDF";
    const isZip = data.subarray(0, 2).toString() === "PK";
    if ((doc.file_type === "pdf" && !isPdf) || (doc.file_type === "docx" && !isZip)) {
      doc.processing_status = "error";
      doc.error_reason = "unsupported_format";
      return;
    }
    const sections = doc.file_type === "markdown" ? markdownFragments(data.toString("utf8")) : [];
    if (!sections.length) {
      doc.processing_status = "error";
      doc.error_reason = "no_readable_text";
      return;
    }
    sections.forEach((s, i) =>
      current.fragments.push({
        id: id(),
        document_id: doc.id,
        position: i + 1,
        section: s.section,
        location_label: `§ ${s.section}`,
        text: s.text,
        excluded: false
      })
    );
    doc.page_count = new Set(sections.map((s) => s.section)).size;
    doc.processing_status = "ready";
  }, PROCESSING_MS);
}

export function documentView(current: State, doc: Doc): S["Document"] {
  const fragments = current.fragments.filter((f) => f.document_id === doc.id);
  return {
    id: doc.id,
    file_name: doc.file_name,
    file_type: doc.file_type,
    size_bytes: doc.size_bytes,
    page_count: doc.page_count,
    processing_status: doc.processing_status,
    error_reason: doc.error_reason,
    validation_status: doc.validation_status,
    validated_by_name: doc.validated_by ? current.users.find((u) => u.id === doc.validated_by)!.display_name : null,
    validated_at: doc.validated_at,
    fragment_count: fragments.length,
    excluded_fragment_count: fragments.filter((f) => f.excluded).length,
    uploaded_at: doc.uploaded_at,
    topics: current.topics
      .filter((t) => current.assignments.some((a) => a.document_id === doc.id && a.topic_id === t.id && a.status === "confirmed"))
      .sort((a, b) => a.position - b.position)
      .map((t) => ({ id: t.id, name: t.name }))
  };
}

function fragmentView(f: Frag): S["Fragment"] {
  return { id: f.id, position: f.position, section: f.section, location_label: f.location_label, text: f.text, excluded: f.excluded };
}

export function courseDocument(current: State, courseId: string, docId: string): Doc {
  const doc = current.documents.find((d) => d.id === docId && d.course_id === courseId);
  if (!doc) throw new HttpError(404, "not_found");
  return doc;
}

function requireReady(doc: Doc) {
  if (doc.processing_status !== "ready") throw new HttpError(409, "document_not_ready");
}

const BASE = "/v1/teacher/courses/{course_id}/documents";

export const documentRoutes: Route[] = [
  {
    method: "POST",
    path: BASE,
    status: 202,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const file = parseMultipart(String(ctx.req.headers["content-type"] ?? ""), ctx.rawBody);
      if (!file) throw new HttpError(422, "validation_error");
      const type = TYPES[file.name.split(".").pop()?.toLowerCase() ?? ""];
      if (!type) throw new HttpError(415, "unsupported_file_type");
      if (file.data.length > MAX_BYTES) throw new HttpError(413, "file_too_large", { max_mb: 20 });
      const doc: Doc = {
        id: id(),
        course_id: course.id,
        file_name: file.name,
        file_type: type,
        size_bytes: file.data.length,
        page_count: null,
        processing_status: "processing",
        error_reason: null,
        validation_status: "pending_validation",
        validated_by: null,
        validated_at: null,
        uploaded_at: now()
      };
      ctx.state.documents.push(doc);
      process(doc.id, file.data);
      return documentView(ctx.state, doc);
    }
  },
  {
    method: "GET",
    path: BASE,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const docs = ctx.state.documents.filter((d) => d.course_id === course.id).reverse();
      return page(docs.map((d) => documentView(ctx.state, d)), ctx.url);
    }
  },
  {
    method: "GET",
    path: `${BASE}/{document_id}`,
    handler: (ctx) => documentView(ctx.state, courseDocument(ctx.state, ownedCourse(ctx).id, ctx.params.document_id))
  },
  {
    method: "DELETE",
    path: `${BASE}/{document_id}`,
    handler: (ctx) => {
      const doc = courseDocument(ctx.state, ownedCourse(ctx).id, ctx.params.document_id);
      ctx.state.documents = ctx.state.documents.filter((d) => d !== doc);
      ctx.state.fragments = ctx.state.fragments.filter((f) => f.document_id !== doc.id);
      return noContent();
    }
  },
  {
    method: "POST",
    path: `${BASE}/{document_id}/validate`,
    handler: (ctx) => {
      const doc = courseDocument(ctx.state, ownedCourse(ctx).id, ctx.params.document_id);
      requireReady(doc);
      doc.validation_status = "validated";
      doc.validated_by = ctx.user!.id;
      doc.validated_at = now();
      return documentView(ctx.state, doc);
    }
  },
  {
    method: "POST",
    path: `${BASE}/{document_id}/exclude`,
    handler: (ctx) => {
      const doc = courseDocument(ctx.state, ownedCourse(ctx).id, ctx.params.document_id);
      requireReady(doc);
      doc.validation_status = "excluded";
      return documentView(ctx.state, doc);
    }
  },
  {
    method: "GET",
    path: `${BASE}/{document_id}/fragments`,
    handler: (ctx) => {
      const doc = courseDocument(ctx.state, ownedCourse(ctx).id, ctx.params.document_id);
      return page(ctx.state.fragments.filter((f) => f.document_id === doc.id).map(fragmentView), ctx.url);
    }
  },
  {
    method: "PATCH",
    path: `${BASE}/{document_id}/fragments/{fragment_id}`,
    handler: (ctx) => {
      const doc = courseDocument(ctx.state, ownedCourse(ctx).id, ctx.params.document_id);
      const fragment = ctx.state.fragments.find((f) => f.id === ctx.params.fragment_id && f.document_id === doc.id);
      if (!fragment) throw new HttpError(404, "not_found");
      fragment.excluded = Boolean((ctx.body as S["FragmentUpdate"]).excluded);
      return fragmentView(fragment);
    }
  },
  {
    method: "GET",
    path: `${BASE}/{document_id}/file-url`,
    handler: (ctx) => {
      const doc = courseDocument(ctx.state, ownedCourse(ctx).id, ctx.params.document_id);
      return { url: `http://127.0.0.1:8010/__files/${doc.id}`, expires_at: new Date(Date.now() + 300_000).toISOString() };
    }
  }
];
