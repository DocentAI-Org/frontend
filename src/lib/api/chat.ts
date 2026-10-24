import "server-only";

import { request } from "./client";

export const getAllowance = () => request((api) => api.GET("/v1/student/allowance"));
