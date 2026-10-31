import { getFormatter, getTranslations } from "next-intl/server";

import { AdaptationNote } from "@/components/AdaptationNote";
import { CitationNotes } from "@/components/CitationNotes";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Icon } from "@/components/Icon";
import { MathText } from "@/components/MathText";
import type { Schemas } from "@/lib/api/client";

import { removeFlagAction } from "./actions";
import { FlagDialog } from "./FlagDialog";

/** A tutor answer or exercise feedback as the teacher reviews it: flag, correction, sources. */
export async function ReviewedAnswer({
  courseId,
  target,
  path,
  text,
  kind,
  citations,
  flag,
  adaptation
}: {
  courseId: string;
  target: { kind: "message" | "submission"; id: string };
  path: string;
  text: string;
  kind: "answer" | "hint" | "no_source";
  citations: Schemas["Citation"][];
  flag: Schemas["TeacherFlag"] | null;
  /** Why it was adapted, with the error type's name (014 US2). */
  adaptation?: { basis: Schemas["Adaptation"]; typeName: string } | null;
}) {
  const t = await getTranslations();
  const format = await getFormatter();
  return (
    <div className="grid gap-x-6 lg:grid-cols-12" data-component="ChatMessage" data-variant={`tutor-${kind}`}>
      <div className={`min-w-0 rounded-lg px-4 py-4 lg:col-span-9 ${kind === "no_source" ? "border border-info-200 bg-info-50" : "bg-surface"}`}>
        <p className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-fg-muted">
          <span>{t("student.chat.tutorName")}</span>
          <abbr title={t("student.chat.aiTagLabel")} className="rounded-sm border border-info-300 px-1 text-xs font-bold text-info-800 no-underline">
            {t("student.chat.aiTag")}
          </abbr>
          {kind === "no_source" && <span className="text-info-800">{t("teacher.conversations.noSource")}</span>}
          {flag && (
            <span className="inline-flex items-center gap-1 rounded-sm border border-teacher-300 bg-teacher-50 px-2 py-0.5 text-xs font-semibold text-teacher-800">
              <Icon name="flag" />
              <span>{flag.category === "incorrect" ? t("teacher.flags.flaggedIncorrect") : t("teacher.flags.flaggedImprove")}</span>
            </span>
          )}
        </p>
        <p className={`font-serif text-lg ${flag ? "text-fg-muted line-through decoration-teacher-600 decoration-1" : "text-fg"}`}><MathText text={text} /></p>
        {adaptation && <AdaptationNote adaptation={adaptation.basis} typeName={adaptation.typeName} audience="teacher" />}
        <div className="mt-2 flex flex-wrap gap-2">
          <FlagDialog key={flag?.updated_at ?? "new"} courseId={courseId} target={target} path={path} answer={text} existing={flag} />
          {flag && (
            <ConfirmDialog
              trigger={t("common.correction.remove")}
              triggerVariant="ghost"
              title={t("teacher.flags.removeTitle")}
              body={t("teacher.flags.removeBody")}
              confirmLabel={t("teacher.flags.removeConfirm")}
              cancelLabel={t("common.actions.cancel")}
              confirmVariant="danger"
              action={removeFlagAction}
              fields={{ course_id: courseId, kind: target.kind, target_id: target.id, path }}
            />
          )}
        </div>
      </div>
      <aside className="mt-2 flex flex-col gap-2 lg:col-span-3 lg:mt-0" aria-label={t("student.chat.sources")}>
        {flag && (
          <div className="flex flex-col gap-1 border-l-2 border-margin bg-surface pl-4" data-component="TeacherCorrection" data-variant="teacher">
            <p className="flex items-center gap-2 text-sm font-semibold text-teacher-700">
              <Icon name="graduation-cap" />
              <span>{t("common.correction.reviewed")}</span>
            </p>
            <p className="text-xs text-fg-muted tabular-nums">
              {t("common.correction.date", { date: format.dateTime(new Date(flag.updated_at), { dateStyle: "long" }) })}
            </p>
            <p className="mt-1 font-serif text-fg"><MathText text={flag.correction} /></p>
          </div>
        )}
        <CitationNotes citations={citations} />
      </aside>
    </div>
  );
}
