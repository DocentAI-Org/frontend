import { NextResponse } from "next/server";

import { uploadDocument } from "@/lib/api/documents";

/**
 * Upload endpoint for the material page. A route handler (not a Server Action) so the browser
 * can report upload progress (001 US2 AS2); the API call still goes through src/lib/api.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, code: "validation_error" }, { status: 422 });
  }
  const result = await uploadDocument(id, file);
  return NextResponse.json(result, { status: result.ok ? 202 : result.status || 503 });
}
