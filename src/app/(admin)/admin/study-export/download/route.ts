import { NextResponse } from "next/server";

import { exportStudyData } from "@/lib/api/admin";

/**
 * Streams the study data ZIP with the admin's session (012 US1 AS2). On failure it goes back to
 * the page, which explains the error (AS3); the API rejects anyone but the admin (AS4).
 */
export async function GET(request: Request) {
  const courseId = new URL(request.url).searchParams.get("course_id") || undefined;
  const result = await exportStudyData(courseId);
  if (!result.ok) {
    const back = new URL("/admin/study-export", request.url);
    back.searchParams.set("error", result.code);
    return NextResponse.redirect(back, 303);
  }
  return new NextResponse(result.data, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": 'attachment; filename="docentai-study-export.zip"',
      "cache-control": "no-store"
    }
  });
}
