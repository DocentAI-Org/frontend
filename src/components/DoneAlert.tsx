import { getTranslations } from "next-intl/server";

import { errorMessageKey } from "@/lib/api/errors";

import { Alert } from "./Alert";

/**
 * The outcome a form action sends back in `?done=`: a success message from `messages` (outcome to
 * message key), or the error it hit as `error:<code>`.
 */
export async function DoneAlert({ done, messages }: { done: string; messages: Record<string, string> }) {
  const t = await getTranslations();
  return (
    <>
      {done in messages && <Alert tone="success">{t(messages[done])}</Alert>}
      {done.startsWith("error:") && <Alert tone="danger">{t(errorMessageKey(done.slice("error:".length)))}</Alert>}
    </>
  );
}
