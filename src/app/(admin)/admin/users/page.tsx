import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LinkButton } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ListFooter } from "@/components/ListFooter";
import { ListToolbar } from "@/components/ListToolbar";
import { NoMatches } from "@/components/NoMatches";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { listUsers } from "@/lib/api/admin";
import type { Schemas } from "@/lib/api/client";
import { apiQuery, listState } from "@/lib/list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.users");
  return { title: t("pageTitle") };
}

const SORTS = ["recent", "name"] as const;
const ROLES = ["admin", "teacher", "student"] as const;
const STATUSES = ["active", "disabled"] as const;

const pick = <T extends string>(value: string | string[] | undefined, allowed: readonly T[]) =>
  allowed.find((item) => item === value);

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const list = listState(params, SORTS);
  const role = pick(params.role, ROLES);
  const status = pick(params.status, STATUSES);
  const t = await getTranslations("admin.users");
  const tl = await getTranslations("common.list");
  const users = await listUsers({ ...apiQuery(list, SORTS), role, status }, list.shown);
  const narrowed = Boolean(list.q || role || status);

  const statusBadge = (user: Schemas["AdminUser"]) =>
    user.status === "active" ? (
      <StatusBadge tone="success" icon="check" label={t("status.active")} />
    ) : (
      <StatusBadge tone="neutral" icon="lock" label={t("status.disabled")} />
    );
  // Pseudonymous students have no email; their code is their name (001 FR-043).
  const contact = (user: Schemas["AdminUser"]) => user.email ?? "—";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("title")}
        lead={t("lead")}
        actions={
          <>
            <LinkButton href="/admin/students/new" variant="secondary" icon="plus">
              {t("createStudents")}
            </LinkButton>
            <LinkButton href="/admin/teachers/new" icon="plus">
              {t("create")}
            </LinkButton>
          </>
        }
      />
      {!users.ok ? (
        <ErrorState code={users.code} />
      ) : users.data.total <= 1 && !narrowed ? (
        <EmptyState icon="users" title={t("emptyTitle")} body={t("emptyBody")} />
      ) : (
        <>
          <ListToolbar
            searchLabel={t("search")}
            filters={[
              {
                name: "role",
                label: t("filterRole"),
                options: [{ value: "", label: t("allRoles") }, ...ROLES.map((value) => ({ value, label: t(`roleFilter.${value}`) }))]
              },
              {
                name: "status",
                label: t("filterStatus"),
                options: [{ value: "", label: t("allStatuses") }, ...STATUSES.map((value) => ({ value, label: t(`status.${value}`) }))]
              }
            ]}
            sorts={SORTS.map((value) => ({ value, label: tl(`sorts.${value}`) }))}
          />
          {users.data.items.length === 0 ? (
            <NoMatches q={list.q} />
          ) : (
            <div className="rounded-xl border border-border bg-surface-raised p-4 sm:p-6">
              <table className="hidden w-full border-collapse text-sm md:table">
                <caption className="sr-only">{t("tableCaption")}</caption>
                <thead>
                  <tr className="border-b border-border">
                    {(["colName", "colRole", "colEmail", "colStatus"] as const).map((col) => (
                      <th key={col} scope="col" className="pb-2 pr-4 text-left text-sm font-semibold text-fg-muted">
                        {t(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.data.items.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-b-0">
                      <th scope="row" className="py-4 pr-4 text-left font-semibold text-fg">
                        {user.display_name}
                      </th>
                      <td className="py-4 pr-4 text-fg">{t(`role.${user.role}`)}</td>
                      <td className="py-4 pr-4 break-all text-fg-muted">{contact(user)}</td>
                      <td className="py-4">{statusBadge(user)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul aria-label={t("tableCaption")} className="flex flex-col divide-y divide-border md:hidden">
                {users.data.items.map((user) => (
                  <li key={user.id} className="flex flex-col gap-1 py-4">
                    <p className="font-semibold text-fg">{user.display_name}</p>
                    <p className="text-sm text-fg">{t(`role.${user.role}`)}</p>
                    <p className="text-sm break-all text-fg-muted">{contact(user)}</p>
                    <span className="mt-1">{statusBadge(user)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {users.data.items.length > 0 && (
            <ListFooter path="/admin/users" params={params} shown={list.shown} total={users.data.total} />
          )}
        </>
      )}
    </div>
  );
}
