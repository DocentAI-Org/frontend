"use client";

import { useTranslations } from "next-intl";
import { type KeyboardEvent, type PointerEvent, useEffect, useId, useLayoutEffect, useRef, useState, useTransition } from "react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Icon } from "@/components/Icon";

import { deleteTopicAction, reorderTopicsAction } from "./actions";
import { RenameTopic } from "./TopicForms";

type Topic = { id: string; name: string; assignment_count: number };

/** Pixels the pointer moves before a press on the handle becomes a drag (below it, a click). */
const DRAG_START = 4;

const MENU_ROW =
  "flex min-h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:text-fg-muted";

/**
 * The course's topics in order, sorted by dragging a row's handle (mouse or touch). The same
 * handle moves the row with ↑/↓, and pressing it without dragging opens "Move up / down", so
 * no drag is ever required (WCAG 2.5.7). Each move is saved at once and announced.
 */
export function SortableTopics({ courseId, topics, label }: { courseId: string; topics: Topic[]; label: string }) {
  const t = useTranslations();
  const ids = useId();
  const [order, setOrder] = useState(topics);
  // The row being dragged and how far it is drawn from its place in the list, so it follows the pointer.
  const [drag, setDrag] = useState<{ id: string; offset: number } | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [, startTransition] = useTransition();
  const list = useRef<HTMLOListElement>(null);
  const rows = useRef(new Map<string, HTMLLIElement>());
  // Each row's place in the list at the last render, to slide the rows that a move displaces.
  const tops = useRef(new Map<string, number>());
  const dropped = useRef<{ id: string; offset: number } | null>(null);
  /** `grab`: where in the row the pointer took it. */
  const press = useRef<{ id: string; y: number; grab: number; moved: boolean; start: Topic[] } | null>(null);

  // A list from the server (after adding, renaming or deleting) wins over the local one. Moves
  // are not refreshed from the server: the local order is already what was saved.
  const [seen, setSeen] = useState(topics);
  if (topics !== seen) {
    setSeen(topics);
    setOrder(topics);
  }

  useEffect(() => {
    if (!menu) return;
    const close = (event: MouseEvent) => {
      if (!(event.target as Element).closest(`[data-topic-menu="${menu}"]`)) setMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  // The displaced rows slide to their new place, and a dropped row settles into its own.
  useLayoutEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rows.current.forEach((row, id) => {
      const before = tops.current.get(id);
      tops.current.set(id, row.offsetTop);
      if (still) return;
      if (dropped.current?.id === id) {
        row.animate([{ transform: `translateY(${dropped.current.offset}px) scale(1.02)` }, { transform: "none" }], {
          duration: 180,
          easing: "cubic-bezier(0.2, 0, 0, 1)"
        });
      } else if (before !== undefined && before !== row.offsetTop && id !== drag?.id) {
        row.animate([{ transform: `translateY(${before - row.offsetTop}px)` }, { transform: "none" }], {
          duration: 180,
          easing: "cubic-bezier(0.2, 0, 0, 1)"
        });
      }
    });
    dropped.current = null;
  });

  const save = (next: Topic[], moved: Topic, before = order) => {
    setOrder(next);
    setMenu(null);
    setStatus(t("teacher.topics.movedTo", { name: moved.name, position: next.indexOf(moved) + 1 }));
    startTransition(async () => {
      const result = await reorderTopicsAction(courseId, next.map((topic) => topic.id));
      if (!result.ok) {
        setOrder(before);
        setStatus(t("teacher.topics.moveFailed"));
      }
    });
  };

  const moveBy = (topic: Topic, step: number) => {
    const from = order.indexOf(topic);
    const to = from + step;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    next.splice(from, 1);
    next.splice(to, 0, topic);
    save(next, topic);
  };

  /** Where a row's place in the list starts, in viewport coordinates (ignoring transforms). */
  const listTop = () => {
    const box = list.current?.getBoundingClientRect();
    return (box?.top ?? 0) + (list.current?.clientTop ?? 0);
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>, topic: Topic) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const grab = event.clientY - listTop() - (rows.current.get(topic.id)?.offsetTop ?? 0);
    press.current = { id: topic.id, y: event.clientY, grab, moved: false, start: order };
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>, topic: Topic) => {
    const current = press.current;
    const row = rows.current.get(topic.id);
    if (!current || current.id !== topic.id || !row) return;
    if (!current.moved && Math.abs(event.clientY - current.y) < DRAG_START) return;
    current.moved = true;
    setMenu(null);
    // The dragged row's top, in the list's coordinates; it goes before the rows whose middle it passed.
    const top = event.clientY - listTop() - current.grab;
    const others = order.filter((x) => x !== topic);
    const to = others.filter((x) => {
      const other = rows.current.get(x.id);
      return other && other.offsetTop + other.offsetHeight / 2 < top + row.offsetHeight / 2;
    }).length;
    const from = order.indexOf(topic);
    // Its place once moved: where the row it displaces starts (up) or ends (down).
    let place = row.offsetTop;
    if (to < from) place = rows.current.get(order[to].id)?.offsetTop ?? place;
    if (to > from) {
      const last = rows.current.get(order[to].id);
      if (last) place = last.offsetTop + last.offsetHeight - row.offsetHeight;
    }
    if (to !== from) setOrder([...others.slice(0, to), topic, ...others.slice(to)]);
    setDrag({ id: topic.id, offset: top - place });
  };

  const onPointerUp = (topic: Topic) => {
    const current = press.current;
    press.current = null;
    if (drag) dropped.current = drag;
    setDrag(null);
    if (!current) return;
    if (!current.moved) {
      setMenu(menu === topic.id ? null : topic.id);
      return;
    }
    if (order.some((x, i) => x !== current.start[i])) save(order, topic, current.start);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, topic: Topic) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      moveBy(topic, event.key === "ArrowUp" ? -1 : 1);
    } else if (event.key === "Escape") {
      setMenu(null);
    }
  };

  return (
    <>
      <p id={`${ids}-help`} className="text-sm text-fg-muted">
        {t("teacher.topics.handleHelp")}
      </p>
      <p role="status" className="sr-only">
        {status}
      </p>
      <ol
        ref={list}
        aria-label={label}
        className={`relative flex flex-col ${drag ? "select-none" : ""} divide-y divide-border rounded-xl border border-border bg-surface-raised px-2 sm:px-4`}
      >
        {order.map((topic, index) => (
          <li
            key={topic.id}
            ref={(element) => {
              if (element) rows.current.set(topic.id, element);
              else rows.current.delete(topic.id);
            }}
            style={drag?.id === topic.id ? { transform: `translateY(${drag.offset}px) scale(1.02)` } : undefined}
            className={`flex flex-col gap-2 py-3 sm:flex-row sm:items-center ${
              drag?.id === topic.id ? "relative z-10 -mx-2 rounded-lg bg-surface-raised px-2 shadow-xl ring-1 ring-border sm:-mx-3 sm:px-3" : ""
            }`}
            data-topic-row
          >
            <div className="flex flex-1 items-center gap-2">
              <div className="relative" data-topic-menu={topic.id}>
                <button
                  type="button"
                  aria-label={t("teacher.topics.handle", { name: topic.name })}
                  aria-describedby={`${ids}-help`}
                  aria-expanded={menu === topic.id}
                  onPointerDown={(event) => onPointerDown(event, topic)}
                  onPointerMove={(event) => onPointerMove(event, topic)}
                  onPointerUp={() => onPointerUp(topic)}
                  onPointerCancel={() => {
                    press.current = null;
                    setDrag(null);
                  }}
                  onKeyDown={(event) => onKeyDown(event, topic)}
                  className="flex size-9 cursor-grab touch-none items-center justify-center rounded-md text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:cursor-grabbing"
                >
                  <Icon name="grip-vertical" className="size-5 shrink-0" />
                </button>
                {menu === topic.id && (
                  <div className="absolute left-0 z-20 mt-1 flex w-44 flex-col gap-1 rounded-lg border border-border bg-surface-raised p-2 shadow-lg">
                    <button type="button" className={MENU_ROW} disabled={index === 0} onClick={() => moveBy(topic, -1)}>
                      <Icon name="chevron-right" className="size-4 shrink-0 -rotate-90" />
                      <span>{t("teacher.topics.up")}</span>
                    </button>
                    <button type="button" className={MENU_ROW} disabled={index === order.length - 1} onClick={() => moveBy(topic, 1)}>
                      <Icon name="chevron-right" className="size-4 shrink-0 rotate-90" />
                      <span>{t("teacher.topics.down")}</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="w-6 text-right text-sm font-semibold text-fg-muted tabular-nums">{index + 1}</span>
              <div>
                <p className="font-medium text-fg">{topic.name}</p>
                <p className="text-sm text-fg-muted tabular-nums">{t("teacher.topics.sections", { count: topic.assignment_count })}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <RenameTopic courseId={courseId} topicId={topic.id} name={topic.name} />
              <ConfirmDialog
                trigger={t("teacher.topics.delete")}
                triggerVariant="ghost"
                title={t("teacher.topics.deleteTitle", { name: topic.name })}
                body={t("teacher.topics.deleteBody", { count: topic.assignment_count })}
                confirmLabel={t("teacher.topics.deleteConfirm")}
                cancelLabel={t("common.actions.cancel")}
                confirmVariant="danger"
                action={deleteTopicAction}
                fields={{ course_id: courseId, topic_id: topic.id }}
              />
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
