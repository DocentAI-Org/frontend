"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Alert } from "@/components/Alert";
import { Button, LinkButton, type ButtonVariant } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { errorMessageKey } from "@/lib/api/errors";
import { routes } from "@/lib/routes";

import { startQuizAction } from "./actions";

/**
 * Starts a quiz (008 US2 AS1, AS4). Without approved questions it turns into the empty state
 * (AS5); without consent it sends the student to give it, as the tutor does.
 */
export function StartQuiz({
  courseId,
  topicId,
  label,
  icon = "sparkles",
  variant = "primary"
}: {
  courseId: string;
  topicId?: string;
  label: string;
  icon?: string;
  variant?: ButtonVariant;
}) {
  const t = useTranslations("student.quiz");
  const tAll = useTranslations();
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (code === "no_questions") {
    return (
      <EmptyState
        icon="lightbulb"
        title={t("emptyTitle")}
        body={t("emptyBody")}
        action={
          <LinkButton href={routes.studentCourse(courseId)} icon="message-circle">
            {t("askTutor")}
          </LinkButton>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant={variant}
        icon={icon}
        pending={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await startQuizAction(courseId, topicId);
            // Only reached on failure: success opens the quiz.
            if (result.code === "consent_required") router.push("/student/consent");
            else setCode(result.code);
          })
        }
      >
        {label}
      </Button>
      {code && <Alert tone="danger">{tAll(errorMessageKey(code))}</Alert>}
    </div>
  );
}
