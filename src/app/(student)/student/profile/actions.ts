"use server";

import { revalidatePath } from "next/cache";

import { revokeConsent } from "@/lib/api/consent";

export async function revokeConsentAction() {
  await revokeConsent();
  revalidatePath("/student/profile");
}
