import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import { StatusPoller } from "@/components/StatusPoller";

describe("StatusPoller (spec FR-008)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    refresh.mockClear();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("refreshes periodically while something is processing", () => {
    render(<StatusPoller active interval={3000} />);
    vi.advanceTimersByTime(9000);
    expect(refresh).toHaveBeenCalledTimes(3);
  });

  it("does nothing when nothing is processing, and stops when it ends", () => {
    const { rerender } = render(<StatusPoller active={false} />);
    vi.advanceTimersByTime(9000);
    expect(refresh).not.toHaveBeenCalled();

    rerender(<StatusPoller active />);
    vi.advanceTimersByTime(3000);
    rerender(<StatusPoller active={false} />);
    vi.advanceTimersByTime(9000);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
