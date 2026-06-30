import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { FolderOpen, Map } from "lucide-react";
import { DeliverableCard, type DeliverableData } from "@/components/shared/DeliverableCard";
import { DeliverableType } from "@prisma/client";

const TYPE_LABELS: Record<DeliverableType, string> = {
  resume_bullets:    "Resume Bullets",
  linkedin_summary:  "LinkedIn Summary",
  star_story:        "STAR Story",
  portfolio_project: "Portfolio Project",
  interview_answers: "Interview Answers",
  case_study:        "Case Study",
  flashcard_deck:    "Flashcard Deck",
  project_doc:       "Project Doc",
};

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function DeliverablesPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { type: typeParam } = await searchParams;
  const activeType = typeParam as DeliverableType | undefined;

  const [allDeliverables, filtered] = await Promise.all([
    // All — for type counts and filter tabs
    db.deliverable.findMany({
      where: { userId },
      select: { type: true },
    }),
    // Filtered — full data for cards
    db.deliverable.findMany({
      where: { userId, ...(activeType ? { type: activeType } : {}) },
      include: { task: { select: { label: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Build type counts for filter tabs
  const typeCounts = allDeliverables.reduce<Record<string, number>>((acc, d) => {
    acc[d.type] = (acc[d.type] ?? 0) + 1;
    return acc;
  }, {});

  const presentTypes = Object.keys(typeCounts) as DeliverableType[];

  // Stats
  const totalCount = allDeliverables.length;
  const scoredItems = filtered.filter((d) => d.aiScore !== null);
  const avgScore = scoredItems.length
    ? Math.round(scoredItems.reduce((sum, d) => sum + d.aiScore!, 0) / scoredItems.length)
    : null;

  // Serialize for client components
  const cards: DeliverableData[] = filtered.map((d) => ({
    id:          d.id,
    type:        d.type as DeliverableType,
    title:       d.title,
    content:     d.content as Record<string, unknown>,
    aiScore:     d.aiScore,
    aiFeedback:  d.aiFeedback as DeliverableData["aiFeedback"],
    isPublished: d.isPublished,
    createdAt:   d.createdAt.toISOString(),
    taskLabel:   d.task?.label ?? null,
  }));

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Deliverables</h1>
        <p className="text-slate-400 text-base mt-1">
          Career assets you&apos;ve built — your proof of progress.
        </p>
      </div>

      {totalCount === 0 ? (
        /* ── Empty state ── */
        <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-5">
            <FolderOpen className="h-7 w-7 text-orange-400" />
          </div>
          <p className="text-lg font-bold text-white mb-1">No deliverables yet</p>
          <p className="text-slate-400 text-base mb-6 max-w-sm mx-auto">
            Complete task steps on your roadmap to generate your first career asset — resume bullets, STAR stories, case studies, and more.
          </p>
          <Link href="/roadmap">
            <button className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors">
              <Map className="h-4 w-4" />
              Go to roadmap
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-[#161820] rounded-2xl border border-white/10 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Assets</p>
              <p className="text-3xl font-black text-white">{totalCount}</p>
            </div>
            {avgScore !== null && (
              <div className="bg-[#161820] rounded-2xl border border-white/10 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Avg AI Score</p>
                <p className={`text-3xl font-black tabular-nums ${avgScore >= 70 ? "text-emerald-400" : avgScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
                  {avgScore}
                  <span className="text-base font-semibold text-slate-500">/100</span>
                </p>
              </div>
            )}
            <div className="bg-[#161820] rounded-2xl border border-white/10 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Types</p>
              <p className="text-3xl font-black text-white">{presentTypes.length}</p>
            </div>
          </div>

          {/* Type filter tabs */}
          {presentTypes.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              <Link href="/deliverables">
                <button className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                  !activeType
                    ? "bg-white/10 text-white border-white/20"
                    : "bg-white/[0.04] text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200"
                }`}>
                  All <span className="text-slate-500 ml-1">{totalCount}</span>
                </button>
              </Link>
              {presentTypes.map((t) => (
                <Link key={t} href={`/deliverables?type=${t}`}>
                  <button className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                    activeType === t
                      ? "bg-white/10 text-white border-white/20"
                      : "bg-white/[0.04] text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200"
                  }`}>
                    {TYPE_LABELS[t]} <span className="text-slate-500 ml-1">{typeCounts[t]}</span>
                  </button>
                </Link>
              ))}
            </div>
          )}

          {/* Cards grid */}
          {cards.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No {activeType ? TYPE_LABELS[activeType] : ""} deliverables yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((d) => (
                <DeliverableCard key={d.id} deliverable={d} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
