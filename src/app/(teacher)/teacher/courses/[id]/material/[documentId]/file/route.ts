import { NextResponse } from "next/server";

import { getFileUrl } from "@/lib/api/documents";

/** Opens the original file through the API's short-lived signed link (002 US3 AS4). */
export async function GET(_: Request, { params }: { params: Promise<{ id: string; documentId: string }> }) {
  const { id, documentId } = await params;
  const result = await getFileUrl({ course_id: id, document_id: documentId });
  if (!result.ok) return NextResponse.json({ code: result.code }, { status: result.status || 503 });
  return NextResponse.redirect(result.data.url);
}
