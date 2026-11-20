"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { type SignInState, signIn } from "@/app/actions/session";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";

type Account = { role: "teacher" | "student" | "admin"; email: string };

/** The demo deployment's sample accounts, each with a button that signs in with it. */
export function DemoAccounts({ accounts, password }: { accounts: Account[]; password: string }) {
  const t = useTranslations("common.demo");
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});
  return (
    <section
      aria-labelledby="demo-title"
      className="flex flex-col gap-4 rounded-xl border border-info-200 bg-info-50 p-6"
      data-component="DemoAccounts"
    >
      <div className="flex flex-col gap-1">
        <h2 id="demo-title" className="text-lg font-semibold text-fg">
          {t("title")}
        </h2>
        <p className="text-sm text-fg">{t("lead")}</p>
      </div>
      {state.error && <Alert tone="danger">{t("failed")}</Alert>}
      <ul className="flex flex-col gap-2">
        {accounts.map((account) => (
          <li key={account.email}>
            <form action={action} className="flex flex-wrap items-center justify-between gap-2">
              <input type="hidden" name="identifier" value={account.email} />
              <input type="hidden" name="password" value={password} />
              <span className="font-mono text-sm break-all text-fg">{account.email}</span>
              <Button type="submit" variant="secondary" disabled={pending}>
                {t("signInAs", { role: t(`roles.${account.role}`) })}
              </Button>
            </form>
          </li>
        ))}
      </ul>
      <p className="text-sm text-fg">
        {t.rich("password", { password, code: (chunks) => <code className="font-mono font-semibold">{chunks}</code> })}
      </p>
    </section>
  );
}
