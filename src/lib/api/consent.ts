import "server-only";

import { request } from "./client";

export const getConsent = () => request((api) => api.GET("/v1/student/consent"));
export const giveConsent = () => request((api) => api.POST("/v1/student/consent"));
export const revokeConsent = () => request((api) => api.DELETE("/v1/student/consent"));
export const getConsentHistory = () => request((api) => api.GET("/v1/student/consent/history"));
