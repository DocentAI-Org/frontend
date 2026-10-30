import "server-only";

import { type Schemas, request } from "./client";

type Path = { course_id: string; document_id: string };

export const listDocuments = (course_id: string) =>
  request((api) =>
    api.GET("/v1/teacher/courses/{course_id}/documents", {
      params: { path: { course_id }, query: { limit: 100, offset: 0 } }
    })
  );

export const getDocument = (path: Path) =>
  request((api) => api.GET("/v1/teacher/courses/{course_id}/documents/{document_id}", { params: { path } }));

export const uploadDocument = (course_id: string, file: File) =>
  request((api) =>
    api.POST("/v1/teacher/courses/{course_id}/documents", {
      params: { path: { course_id } },
      body: { file: file as unknown as string },
      bodySerializer: () => {
        const form = new FormData();
        form.append("file", file, file.name);
        return form;
      }
    })
  );

export const validateDocument = (path: Path) =>
  request((api) => api.POST("/v1/teacher/courses/{course_id}/documents/{document_id}/validate", { params: { path } }));

export const excludeDocument = (path: Path) =>
  request((api) => api.POST("/v1/teacher/courses/{course_id}/documents/{document_id}/exclude", { params: { path } }));

export const deleteDocument = (path: Path) =>
  request((api) => api.DELETE("/v1/teacher/courses/{course_id}/documents/{document_id}", { params: { path } }));

export const getFileUrl = (path: Path) =>
  request((api) => api.GET("/v1/teacher/courses/{course_id}/documents/{document_id}/file-url", { params: { path } }));

/** Every fragment of a document (pages of 100), so search covers the whole document. */
export async function listAllFragments(path: Path) {
  const items: Schemas["Fragment"][] = [];
  for (let offset = 0; ; offset += 100) {
    const result = await request((api) =>
      api.GET("/v1/teacher/courses/{course_id}/documents/{document_id}/fragments", {
        params: { path, query: { limit: 100, offset } }
      })
    );
    if (!result.ok) return result;
    items.push(...result.data.items);
    if (items.length >= result.data.total || result.data.items.length === 0) return { ok: true as const, data: items };
  }
}

export const setFragmentExcluded = (path: Path & { fragment_id: string }, excluded: boolean) =>
  request((api) =>
    api.PATCH("/v1/teacher/courses/{course_id}/documents/{document_id}/fragments/{fragment_id}", {
      params: { path },
      body: { excluded }
    })
  );
