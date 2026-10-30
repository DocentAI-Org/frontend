"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { createTopic, deleteTopic, renameTopic, reorderTopics } from "@/lib/api/topics";
import { routes } from "@/lib/routes";

function back(courseId: string, params: Record<string, string> = {}): never {
  const query = new URLSearchParams(params).toString();
  redirect(`${routes.teacherTopics(courseId)}${query ? `?${query}` : ""}` as Route);
}

export type TopicFormState = { error?: string; name?: string };

export async function addTopicAction(_: TopicFormState, form: FormData): Promise<TopicFormState> {
  const courseId = String(form.get("course_id"));
  const name = String(form.get("name") ?? "").trim();
  if (!name || name.length > 60) return { error: "validation_error", name };
  const result = await createTopic(courseId, name);
  if (!result.ok) return { error: result.code, name };
  back(courseId, { added: name });
}

export async function renameTopicAction(_: TopicFormState, form: FormData): Promise<TopicFormState> {
  const courseId = String(form.get("course_id"));
  const name = String(form.get("name") ?? "").trim();
  if (!name || name.length > 60) return { error: "validation_error", name };
  const result = await renameTopic(courseId, String(form.get("topic_id")), name);
  if (!result.ok) return { error: result.code, name };
  back(courseId);
}

export async function deleteTopicAction(form: FormData) {
  const courseId = String(form.get("course_id"));
  await deleteTopic(courseId, String(form.get("topic_id")));
  back(courseId);
}

export async function moveTopicAction(form: FormData) {
  const courseId = String(form.get("course_id"));
  const order = String(form.get("order")).split(",");
  const index = Number(form.get("index"));
  const target = form.get("direction") === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= order.length) back(courseId);
  [order[index], order[target]] = [order[target], order[index]];
  await reorderTopics(courseId, order);
  back(courseId, { moved: String(form.get("name")) });
}
