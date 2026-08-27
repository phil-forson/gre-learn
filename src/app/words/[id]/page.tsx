import Link from "next/link";
import { notFound } from "next/navigation";
import { WordDetailCard } from "@/features/vocabulary/components/WordDetailCard";
import { getVocabulary } from "@/features/vocabulary/services/vocabulary-service";
import { listWordGroups } from "@/features/vocabulary/services/word-group-service";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function WordPage({ params }: Props) {
  const { id } = await params;
  try {
    const [entry, groups] = await Promise.all([getVocabulary(id), listWordGroups()]);
    return (
      <div className="space-y-4">
        <Link
          href="/library"
          className="font-[family-name:var(--font-ui)] text-sm text-[var(--ink-muted)]"
        >
          ← Library
        </Link>
        <WordDetailCard entry={entry} groups={groups} />
      </div>
    );
  } catch {
    notFound();
  }
}
