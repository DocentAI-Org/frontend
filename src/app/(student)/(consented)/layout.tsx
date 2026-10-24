import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ErrorState } from "@/components/ErrorState";
import { getConsent } from "@/lib/api/consent";
import { PATHNAME_HEADER } from "@/lib/request-path";

/**
 * Every student page except consent and profile needs current study consent (001 US7 AS4). The
 * API enforces it too (`consent_required`); this sends the student to give it first.
 */
export default async function ConsentedLayout({ children }: { children: React.ReactNode }) {
  const consent = await getConsent();
  if (!consent.ok) return <ErrorState code={consent.code} />;
  if (!consent.data.given) {
    const path = (await headers()).get(PATHNAME_HEADER) ?? "/alumno/cursos";
    redirect(`/alumno/consentimiento?next=${encodeURIComponent(path)}` as Route);
  }
  return children;
}
