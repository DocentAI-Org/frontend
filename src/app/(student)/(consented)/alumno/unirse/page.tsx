import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { JoinScreen } from "./JoinScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.join");
  return { title: t("pageTitle") };
}

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ unido?: string }> }) {
  const { unido } = await searchParams;
  return <JoinScreen joinedCourseId={unido} />;
}
