"use client";

import { useState } from "react";

import { Button } from "./Button";

/** Copies `value` and confirms with a polite status message. */
export function CopyButton({ value, label, copiedLabel }: { value: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        icon="copy"
        className="min-h-9 shrink-0 whitespace-nowrap"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
          } catch {
            // Clipboard can be blocked; the value stays visible to copy by hand.
          }
          setCopied(true);
        }}
      >
        {label}
      </Button>
      <span role="status" className="text-sm font-semibold text-success-800">
        {copied ? copiedLabel : ""}
      </span>
    </span>
  );
}
