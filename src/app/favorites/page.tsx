import { WordListItem } from "@/features/vocabulary/components/WordListItem";
import { listVocabulary } from "@/features/vocabulary/services/vocabulary-service";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const result = await listVocabulary({
    favoritesOnly: true,
    sort: "alpha",
    pageSize: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          Favorites
        </h1>
        <p className="mt-1 text-[var(--ink-muted)]">
          {result.total} starred word{result.total === 1 ? "" : "s"}
        </p>
      </div>
      {result.items.length ? (
        <ul className="space-y-3">
          {result.items.map((entry) => (
            <WordListItem key={entry.id} entry={entry} />
          ))}
        </ul>
      ) : (
        <p className="text-[var(--ink-muted)]">
          Star words from their detail page to collect them here.
        </p>
      )}
    </div>
  );
}
