"use client";

import { type KeyboardEvent, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { Icon } from "./Icon";

export type SelectOption = { value: string; label: string; lang?: string };

type SelectProps = {
  options: SelectOption[];
  /** Submitted with the form through a hidden input. */
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  /** For an external `<label htmlFor>`; do not wrap the Select in a label (clicks on the list would reopen it). */
  id?: string;
  /** Id of that visible label, which also names the list. Without one, pass aria-label. */
  labelId?: string;
  "aria-label"?: string;
  className?: string;
  /** "sm" is the compact trigger for menus and toolbars (32 px, small text). */
  size?: "md" | "sm";
};

const SIZES = {
  md: {
    trigger: "min-h-11 rounded-lg border-border-strong py-2 pr-10 pl-4 text-base",
    chevron: "right-3 size-5",
    option: "min-h-11 text-base"
  },
  sm: {
    trigger: "min-h-8 rounded-md border-border py-1 pr-8 pl-3 text-sm",
    chevron: "right-2 size-4",
    option: "min-h-9 text-sm"
  }
};

const TYPEAHEAD_MS = 500;

/** A printable key without Alt, Ctrl or Meta: it searches the options by their label. */
function isTypeahead(event: KeyboardEvent) {
  return event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey;
}

/**
 * Select (prototype › Forms): the WAI-ARIA select-only combobox. The list is drawn by the app, not by
 * the operating system, so it looks the same in every browser. Focus stays on the trigger and the
 * active option is announced through aria-activedescendant.
 */
export function Select({
  options,
  name,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  id,
  labelId,
  "aria-label": ariaLabel,
  className = "",
  size = "md"
}: SelectProps) {
  const sized = SIZES[size];
  const autoId = useId();
  const triggerId = id ?? `${autoId}-trigger`;
  const listId = `${autoId}-list`;
  const optionId = (index: number) => `${autoId}-option-${index}`;

  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value ?? "");
  const selected = value ?? internal;
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === selected)
  );

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selectedIndex);
  const [upward, setUpward] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: "", at: 0 });

  function show(index = selectedIndex) {
    if (disabled) return;
    setActive(index);
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    setOpen(false);
    if (!option || option.value === selected) return;
    if (value === undefined) setInternal(option.value);
    onValueChange?.(option.value);
  }

  // Opens upwards when the list does not fit below, e.g. in the sidebar footer.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !listRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const below = window.innerHeight - trigger.bottom;
    setUpward(below < listRef.current.offsetHeight + 8 && trigger.top > below);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.getElementById(optionId(active))?.scrollIntoView?.({ block: "nearest" });
    // optionId only depends on autoId, which never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active]);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  function findByText(key: string) {
    const now = Date.now();
    const state = typeahead.current;
    state.text = now - state.at > TYPEAHEAD_MS ? key : state.text + key;
    state.at = now;
    const text = state.text.toLocaleLowerCase();
    const start = open ? active : selectedIndex;
    const ordered = [...options.slice(start + 1), ...options.slice(0, start + 1)];
    const match = ordered.find((option) => option.label.toLocaleLowerCase().startsWith(text));
    return match ? options.indexOf(match) : -1;
  }

  const last = options.length - 1;

  // Closed: the keys that open the list, and the option each one opens it at.
  const openAt = new Map<string, number>([
    ["ArrowDown", selectedIndex],
    ["ArrowUp", selectedIndex],
    ["Enter", selectedIndex],
    [" ", selectedIndex],
    ["Home", 0],
    ["End", last]
  ]);

  // Open: what each key does. These keys prevent the default; Tab and type-ahead keep it.
  const whileOpen = new Map<string, (altKey: boolean) => void>([
    ["ArrowDown", () => setActive((index) => Math.min(index + 1, last))],
    ["ArrowUp", (altKey) => (altKey ? choose(active) : setActive((index) => Math.max(index - 1, 0)))],
    ["Home", () => setActive(0)],
    ["PageUp", () => setActive(0)],
    ["End", () => setActive(last)],
    ["PageDown", () => setActive(last)],
    ["Enter", () => choose(active)],
    [" ", () => choose(active)],
    ["Escape", () => setOpen(false)]
  ]);

  function onKeyDownClosed(event: KeyboardEvent<HTMLButtonElement>) {
    const index = openAt.get(event.key);
    if (index !== undefined) {
      event.preventDefault();
      show(index);
    } else if (isTypeahead(event)) {
      const match = findByText(event.key);
      if (match >= 0) show(match);
    }
  }

  function onKeyDownOpen(event: KeyboardEvent<HTMLButtonElement>) {
    const action = whileOpen.get(event.key);
    if (action) {
      event.preventDefault();
      action(event.altKey);
    } else if (event.key === "Tab") {
      choose(active);
    } else if (isTypeahead(event)) {
      const match = findByText(event.key);
      if (match >= 0) setActive(match);
    }
  }

  const current = options[selectedIndex];

  return (
    <div ref={rootRef} className={`relative ${className}`} data-component="Select">
      {name && <input type="hidden" name={name} value={selected} />}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(active) : undefined}
        disabled={disabled}
        onClick={(event) => {
          // Safari and iOS do not focus buttons on click; the keyboard and blur rely on it.
          event.currentTarget.focus();
          if (open) setOpen(false);
          else show();
        }}
        onKeyDown={open ? onKeyDownOpen : onKeyDownClosed}
        onBlur={() => setOpen(false)}
        className={`flex w-full items-center gap-2 border bg-surface-raised text-left text-fg ${sized.trigger} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-fg-muted`}
      >
        <span className="truncate" lang={current?.lang}>
          {current?.label}
        </span>
        <Icon
          name="chevron-right"
          className={`pointer-events-none absolute top-1/2 ${sized.chevron} -translate-y-1/2 text-fg-muted transition-transform motion-reduce:transition-none ${open ? "-rotate-90" : "rotate-90"}`}
        />
      </button>
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : labelId}
        hidden={!open}
        tabIndex={-1}
        // Keeps focus on the trigger while the pointer picks an option.
        onMouseDown={(event) => event.preventDefault()}
        className={`absolute right-0 left-0 z-50 max-h-64 min-w-max overflow-y-auto rounded-xl border border-border bg-surface-raised p-1 shadow-lg ${upward ? "bottom-full mb-1" : "top-full mt-1"}`}
      >
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;
          return (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={isSelected}
              lang={option.lang}
              onClick={() => choose(index)}
              onMouseMove={() => setActive(index)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 text-fg ${sized.option} ${index === active ? "bg-surface-sunken" : ""} ${isSelected ? "font-semibold" : ""}`}
            >
              <Icon name="check" className={`size-4 shrink-0 ${isSelected ? "" : "invisible"}`} />
              <span>{option.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
