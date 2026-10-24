import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CopyButton } from "@/components/CopyButton";

describe("CopyButton", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("copies the value and confirms politely", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    render(<CopyButton value="ALG-7K3P" label="Copiar código" copiedLabel="Copiado" />);

    await user.click(screen.getByRole("button", { name: "Copiar código" }));

    expect(writeText).toHaveBeenCalledWith("ALG-7K3P");
    expect(screen.getByRole("status").textContent).toBe("Copiado");
  });

  it("still confirms when the clipboard is blocked", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("blocked"));
    render(<CopyButton value="x" label="Copiar" copiedLabel="Copiado" />);

    await user.click(screen.getByRole("button", { name: "Copiar" }));

    expect(screen.getByRole("status").textContent).toBe("Copiado");
  });
});
