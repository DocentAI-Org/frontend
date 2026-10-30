import { HttpError, type Route, noContent } from "../http.ts";
import { type Assignment, type S, type State, type Topic, id } from "../state.ts";
import { courseDocument } from "./documents.ts";
import { ownedCourse } from "./courses.ts";

function topicView(state: State, topic: Topic): S["Topic"] {
  return {
    id: topic.id,
    name: topic.name,
    position: topic.position,
    assignment_count: state.assignments.filter((a) => a.topic_id === topic.id).length
  };
}

function courseTopics(state: State, courseId: string) {
  return state.topics.filter((t) => t.course_id === courseId).sort((a, b) => a.position - b.position);
}

function validName(state: State, courseId: string, value: unknown, except?: string): string {
  const name = typeof value === "string" ? value.trim() : "";
  if (!name || name.length > 60) throw new HttpError(422, "validation_error", { fields: [{ loc: ["body", "name"] }] });
  if (courseTopics(state, courseId).some((t) => t.id !== except && t.name.toLowerCase() === name.toLowerCase())) {
    throw new HttpError(409, "topic_name_taken");
  }
  return name;
}

function ownTopic(state: State, courseId: string, topicId: string): Topic {
  const topic = state.topics.find((t) => t.id === topicId && t.course_id === courseId);
  if (!topic) throw new HttpError(404, "not_found");
  return topic;
}

function assignmentView(state: State, a: Assignment): S["TopicAssignment"] {
  return {
    id: a.id,
    topic_id: a.topic_id,
    topic_name: state.topics.find((t) => t.id === a.topic_id)!.name,
    document_id: a.document_id,
    document_name: state.documents.find((d) => d.id === a.document_id)!.file_name,
    section: a.section,
    status: a.status
  };
}

const BASE = "/v1/teacher/courses/{course_id}";

export const topicRoutes: Route[] = [
  { method: "GET", path: `${BASE}/topics`, handler: (ctx) => courseTopics(ctx.state, ownedCourse(ctx).id).map((t) => topicView(ctx.state, t)) },
  {
    method: "POST",
    path: `${BASE}/topics`,
    status: 201,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const name = validName(ctx.state, course.id, (ctx.body as S["TopicCreate"]).name);
      const topic = { id: id(), course_id: course.id, name, position: courseTopics(ctx.state, course.id).length + 1 };
      ctx.state.topics.push(topic);
      return topicView(ctx.state, topic);
    }
  },
  {
    method: "PUT",
    path: `${BASE}/topics/order`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const ids = (ctx.body as S["TopicOrder"]).topic_ids;
      const current = courseTopics(ctx.state, course.id);
      if (ids.length !== current.length || !current.every((t) => ids.includes(t.id))) throw new HttpError(422, "validation_error");
      ids.forEach((topicId, index) => (ownTopic(ctx.state, course.id, topicId).position = index + 1));
      return courseTopics(ctx.state, course.id).map((t) => topicView(ctx.state, t));
    }
  },
  {
    method: "PATCH",
    path: `${BASE}/topics/{topic_id}`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const topic = ownTopic(ctx.state, course.id, ctx.params.topic_id);
      topic.name = validName(ctx.state, course.id, (ctx.body as S["TopicUpdate"]).name, topic.id);
      return topicView(ctx.state, topic);
    }
  },
  {
    method: "DELETE",
    path: `${BASE}/topics/{topic_id}`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const topic = ownTopic(ctx.state, course.id, ctx.params.topic_id);
      ctx.state.topics = ctx.state.topics.filter((t) => t !== topic);
      ctx.state.assignments = ctx.state.assignments.filter((a) => a.topic_id !== topic.id);
      courseTopics(ctx.state, course.id).forEach((t, i) => (t.position = i + 1));
      return noContent();
    }
  },
  {
    method: "GET",
    path: `${BASE}/topic-assignments`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      if (ctx.state.faults.has("assignments_fail")) throw new HttpError(503, "api_unreachable");
      const status = ctx.url.searchParams.get("status");
      return ctx.state.assignments
        .filter((a) => a.course_id === course.id && (!status || a.status === status))
        .map((a) => assignmentView(ctx.state, a));
    }
  },
  {
    method: "POST",
    path: `${BASE}/topic-assignments`,
    status: 201,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const body = ctx.body as S["TopicAssignmentCreate"];
      ownTopic(ctx.state, course.id, body.topic_id);
      courseDocument(ctx.state, course.id, body.document_id);
      const section = body.section ?? null;
      if (ctx.state.assignments.some((a) => a.topic_id === body.topic_id && a.document_id === body.document_id && a.section === section)) {
        throw new HttpError(409, "conflict");
      }
      const assignment: Assignment = { id: id(), course_id: course.id, topic_id: body.topic_id, document_id: body.document_id, section, status: "confirmed" };
      ctx.state.assignments.push(assignment);
      return assignmentView(ctx.state, assignment);
    }
  },
  {
    method: "PATCH",
    path: `${BASE}/topic-assignments/{assignment_id}`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const assignment = ctx.state.assignments.find((a) => a.id === ctx.params.assignment_id && a.course_id === course.id);
      if (!assignment) throw new HttpError(404, "not_found");
      const body = ctx.body as S["TopicAssignmentUpdate"];
      if (body.topic_id) assignment.topic_id = ownTopic(ctx.state, course.id, body.topic_id).id;
      assignment.status = "confirmed";
      return assignmentView(ctx.state, assignment);
    }
  },
  {
    method: "DELETE",
    path: `${BASE}/topic-assignments/{assignment_id}`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const before = ctx.state.assignments.length;
      ctx.state.assignments = ctx.state.assignments.filter((a) => !(a.id === ctx.params.assignment_id && a.course_id === course.id));
      if (ctx.state.assignments.length === before) throw new HttpError(404, "not_found");
      return noContent();
    }
  },
  {
    method: "GET",
    path: `${BASE}/unassigned-material`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const confirmed = ctx.state.assignments.filter((a) => a.course_id === course.id && a.status === "confirmed");
      return ctx.state.documents
        .filter((d) => d.course_id === course.id && d.validation_status === "validated")
        .filter((d) => !confirmed.some((a) => a.document_id === d.id && a.section === null))
        .map((d) => ({
          document_id: d.id,
          document_name: d.file_name,
          sections: [...new Set(ctx.state.fragments.filter((f) => f.document_id === d.id).map((f) => f.section))].filter(
            (section) => !confirmed.some((a) => a.document_id === d.id && a.section === section)
          )
        }));
    }
  }
];

/** Test helper: a system suggestion, as the API may create after processing (FR-073). */
topicRoutes.push({
  method: "POST",
  path: "/__test/suggestion",
  handler: (ctx) => {
    const { topic_name, section } = ctx.body as { topic_name: string; section: string };
    const topic = ctx.state.topics.find((t) => t.name === topic_name);
    const fragment = ctx.state.fragments.find((f) => f.section === section);
    if (!topic || !fragment) throw new HttpError(404, "not_found");
    ctx.state.assignments.push({ id: id(), course_id: topic.course_id, topic_id: topic.id, document_id: fragment.document_id, section, status: "suggested" });
    return { ok: true };
  }
});
