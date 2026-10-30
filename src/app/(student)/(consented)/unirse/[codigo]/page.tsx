import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { JoinScreen } from "../../alumno/unirse/JoinScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.join");
  return { title: t("pageTitle") };
}

/** The invitation link the API returns (`/unirse/<code>`): the code comes filled in (FR-009). */
export default async function InvitationPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  return <JoinScreen code={decodeURIComponent(codigo)} />;
}
