import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { JoinScreen } from "./JoinScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.join");
  return { title: t("pageTitle") };
}

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ joined?: string }> }) {
  const { joined } = await searchParams;
  return <JoinScreen joinedCourseId={joined} />;
}
