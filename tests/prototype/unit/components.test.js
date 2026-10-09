// Constitution IV: component names match the future React components (plan.md › Components).
import { describe, expect, it } from "vitest";
import { listFiles, parseHtml } from "./files.js";

export const COMPONENTS = [
  "Button", "IconButton", "TextField", "TextArea", "Select", "Toggle", "RadioGroup", "Card", "Dialog",
  "Toast", "EmptyState", "ErrorState", "Skeleton", "AccessDenied", "AppShell", "LanguageSwitcher",
  "ImfaheAcknowledgement", "ChatMessage", "ChatComposer", "SourceCitation", "CitationSheet",
  "NoSourceNotice", "AIDisclosure", "MessageAllowance", "LimitReachedBanner", "GuidedModeIndicator",
  "FileUploadItem", "DocumentRow", "FragmentItem", "ClassCode", "FlagControl", "QuizQuestion",
  "ProgressByTopic", "ThemeSwitcher",
  // Revision 2026-10-06 (T115, plan.md › Components)
  "TeacherCorrection", "ValidationStatus", "AdaptedBadge", "AdaptationSheet", "DecisionReason", "ErrorTypeTag",
  "ErrorTypeList", "MasteryLevel", "ProgressTimeline", "TopicList", "TopicAssignmentRow"
];

describe("data-component names", () => {
  it("are all known components", () => {
    const unknown = [];
    for (const file of listFiles(".html")) {
      parseHtml(file)
        .querySelectorAll("[data-component]")
        .forEach((el) => {
          const name = el.getAttribute("data-component");
          if (!COMPONENTS.includes(name)) unknown.push(`${file}: ${name}`);
        });
    }
    expect(unknown).toEqual([]);
  });
});
