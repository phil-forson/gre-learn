import { WordListItem } from "@/features/vocabulary/components/WordListItem";
import { listVocabulary } from "@/features/vocabulary/services/vocabulary-service";
import { LibraryFilters } from "@/features/vocabulary/components/LibraryFilters";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    favorites?: string;
    status?: string;
    page?: string;
  }>;
};

export default async function LibraryPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const result = await listVocabulary({
    query: params.q,
    sort: (params.sort as "alpha" | "newest" | "oldest") || "newest",
    favoritesOnly: params.favorites === "1",
    status: params.status,
    page,
    pageSize: 20,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          Library
        </h1>
        <p className="mt-1 text-[var(--ink-muted)]">
          {result.total} word{result.total === 1 ? "" : "s"}
        </p>
      </div>

      <LibraryFilters
        query={params.q ?? ""}
        sort={(params.sort as "alpha" | "newest" | "oldest") || "newest"}
        favorites={params.favorites === "1"}
        status={params.status ?? ""}
      />

      {result.items.length ? (
        <ul className="space-y-3">
          {result.items.map((entry) => (
            <WordListItem key={entry.id} entry={entry} />
          ))}
        </ul>
      ) : (
        <p className="text-[var(--ink-muted)]">No matching words.</p>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between font-[family-name:var(--font-ui)] text-sm">
          {page > 1 ? (
            <a
              href={`/library?${new URLSearchParams({
                ...(params.q ? { q: params.q } : {}),
                sort: params.sort ?? "newest",
                ...(params.favorites === "1" ? { favorites: "1" } : {}),
                ...(params.status ? { status: params.status } : {}),
                page: String(page - 1),
              }).toString()}`}
              className="underline"
            >
              Previous
            </a>
          ) : (
            <span />
          )}
          <span>
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <a
              href={`/library?${new URLSearchParams({
                ...(params.q ? { q: params.q } : {}),
                sort: params.sort ?? "newest",
                ...(params.favorites === "1" ? { favorites: "1" } : {}),
                ...(params.status ? { status: params.status } : {}),
                page: String(page + 1),
              }).toString()}`}
              className="underline"
            >
              Next
            </a>
          ) : (
            <span />
          )}
        </div>
      ) : null}
    </div>
  );
}
