import type { Schemas } from "@/lib/api/client";

/** What the key form keeps between attempts; never the key itself (backend specs/019). */
export type CredentialState = {
  error?: string;
  labelError?: boolean;
  keyError?: boolean;
  urlError?: boolean;
  values?: { provider: string; label: string; base_url: string };
  /** Bumped on success so the form clears. */
  created?: number;
};

type Provider = Schemas["CredentialCreate"]["provider"];
const PROVIDERS: Provider[] = ["openai", "anthropic", "openai_compatible"];

/** The form's fields as a request body, or the fields to fix. */
export function credentialFromForm(
  form: FormData
): { body: Schemas["CredentialCreate"]; values: NonNullable<CredentialState["values"]> } | { state: CredentialState } {
  const provider = PROVIDERS.find((p) => p === form.get("provider")) ?? "openai";
  const label = String(form.get("label") ?? "").trim();
  const base_url = String(form.get("base_url") ?? "").trim();
  const api_key = String(form.get("api_key") ?? "").trim();
  const values = { provider, label, base_url };
  const labelError = !label;
  const keyError = api_key.length < 8;
  const urlError = provider === "openai_compatible" && !/^https?:\/\/\S+$/.test(base_url);
  if (labelError || keyError || urlError) return { state: { labelError, keyError, urlError, values } };
  return { body: { provider, label, api_key, base_url: provider === "openai_compatible" ? base_url : null }, values };
}
