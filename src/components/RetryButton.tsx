"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "./Button";

export function RetryButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button variant="secondary" icon="refresh-cw" pending={pending} onClick={() => startTransition(() => router.refresh())}>
      {label}
    </Button>
  );
}
