import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AccessDenied } from "@/components/AccessDenied";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common.errors");
  return { title: t("deniedPageTitle") };
}

export default function AccessDeniedPage() {
  return <AccessDenied />;
}
