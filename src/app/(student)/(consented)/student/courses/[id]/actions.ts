"use server";

import { acknowledgeDisclosure } from "@/lib/api/courses";
import { createConversation, retryMessage, sendMessage } from "@/lib/api/chat";
import type { Schemas } from "@/lib/api/client";

export type ChatResult =
  | { ok: true; conversationId: string; exchange: Schemas["TutorExchange"] }
  | { ok: false; conversationId: string | null; code: string; details?: Record<string, unknown> | null };

export async function acknowledgeAction(courseId: string): Promise<boolean> {
  return (await acknowledgeDisclosure(courseId)).ok;
}

/** Sends a question, opening the conversation on the first one. */
export async function sendAction(
  courseId: string,
  conversationId: string | null,
  text: string,
  requestSolution: boolean
): Promise<ChatResult> {
  let id = conversationId;
  if (!id) {
    const created = await createConversation(courseId);
    if (!created.ok) return { ok: false, conversationId: null, code: created.code };
    id = created.data.id;
  }
  const result = await sendMessage(courseId, id, text, requestSolution);
  return result.ok
    ? { ok: true, conversationId: id, exchange: result.data }
    : { ok: false, conversationId: id, code: result.code, details: result.details };
}

export async function retryAction(courseId: string, conversationId: string, messageId: string): Promise<ChatResult> {
  const result = await retryMessage(courseId, conversationId, messageId);
  return result.ok
    ? { ok: true, conversationId, exchange: result.data }
    : { ok: false, conversationId, code: result.code, details: result.details };
}
