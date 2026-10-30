import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { JoinScreen } from "../../student/join/JoinScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.join");
  return { title: t("pageTitle") };
}

/** The invitation link (`/join/<code>`): the code comes filled in (002 FR-009). */
export default async function InvitationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <JoinScreen code={decodeURIComponent(code)} />;
}
