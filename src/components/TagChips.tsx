import { TAG_STYLES, type TagColor } from "@/lib/tag-colors";

/** A course's tags as small coloured chips (spec 016 US4). */
export function TagChips({ tags }: { tags: { id: string; name: string; color: TagColor }[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1" data-component="TagChips">
      {tags.map((tag) => (
        <li
          key={tag.id}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${TAG_STYLES[tag.color].chip}`}
        >
          <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${TAG_STYLES[tag.color].dot}`} />
          {tag.name}
        </li>
      ))}
    </ul>
  );
}
