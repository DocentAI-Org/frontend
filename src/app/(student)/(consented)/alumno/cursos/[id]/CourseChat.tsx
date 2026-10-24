import { getTranslations } from "next-intl/server";

import { AccessDenied, deniedReasonFor } from "@/components/AccessDenied";
import { ErrorState } from "@/components/ErrorState";
import { getAllowance, getConversation } from "@/lib/api/chat";
import { getStudentCourse } from "@/lib/api/courses";
import { getStudentTutorSettings } from "@/lib/api/tutor";

import { ChatScreen } from "./ChatScreen";

/** Loads everything the chat needs on the server; the conversation itself is interactive. */
export async function CourseChat({ courseId, conversationId }: { courseId: string; conversationId: string | null }) {
  const t = await getTranslations("student.chat");
  const [course, settings, allowance, conversation] = await Promise.all([
    getStudentCourse(courseId),
    getStudentTutorSettings(courseId),
    getAllowance(),
    conversationId ? getConversation(courseId, conversationId) : Promise.resolve(null)
  ]);
  if (!course.ok) {
    return course.status === 404 || course.status === 403 ? (
      <AccessDenied reason={deniedReasonFor(course.code)} home="/alumno/cursos" />
    ) : (
      <ErrorState code={course.code} />
    );
  }
  if (!settings.ok) return <ErrorState code={settings.code} />;
  if (!allowance.ok) return <ErrorState code={allowance.code} />;
  if (conversation && !conversation.ok) {
    return conversation.status === 404 ? <AccessDenied reason="not-found" home="/alumno/cursos" /> : <ErrorState code={conversation.code} />;
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 border-b-2 border-neutral-900 pb-4">
        <p className="text-sm text-fg-muted">{t("courseLabel")}</p>
        <h1 className="text-3xl font-semibold text-fg">{course.data.name}</h1>
        <p className="text-sm text-fg-muted">{t("teacherLine", { teacher: course.data.teacher_name })}</p>
      </div>
      <ChatScreen
        courseId={courseId}
        conversationId={conversationId}
        acknowledged={course.data.disclosure_acknowledged}
        settings={settings.data}
        initialAllowance={allowance.data}
        initialMessages={conversation?.ok ? conversation.data.messages : []}
      />
    </div>
  );
}
