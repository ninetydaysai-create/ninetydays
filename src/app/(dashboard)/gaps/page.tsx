import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Target, Clock, Zap, FileText, RefreshCw, AlertOctagon, MessageSquare, BookOpen, Hammer, FileEdit, RotateCcw } from "lucide-react";
import { GapItem, FixStrategy } from "@/types/gaps";
import GapGenerateButton from "./GapGenerateButton";
import { RegenerateGapButton } from "./RegenerateGapButton";

const fixStrategyMeta: Record<FixStrategy, { label: string; icon: React.ElementType; className: string }> = {
  learn:    { label: "Learn",    icon: BookOpen,  className: "bg-blue-50 text-blue-700 border-blue-200" },
  build:    { label: "Build",    icon: Hammer,    className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  document: { label: "Document", icon: FileEdit,  className: "bg-amber-50 text-amber-700 border-amber-200" },
  reframe:  { label: "Reframe",  icon: RotateCcw, className: "bg-purple-50 text-purple-700 border-purple-200" },
};

function severityDot(s: string) {
  if (s === "critical") return "bg-red-500";
  if (s === "major") return "bg-orange-500";
  return "bg-yellow-400";
}

function severityVariant(s: string): "destructive" | "default" | "secondary" {
  if (s === "critical") return "destructive";
  if (s === "major") return "default";
  return "secondary";
}

function GapSection({ title, gaps, icon: Icon }: { title: string; gaps: GapItem[]; icon: React.ElementType }) {
  if (!gaps.length) return null;
  const open = gaps.filter((g) => !g.resolved);
  const totalHours = open.reduce((s, g) => s + g.estimatedHours, 0);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Icon className="h-5 w-5 text-slate-400" />{title}
        </h2>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Clock className="h-3.5 w-3.5 text-slate-400" />~{totalHours}h to close
        </div>
      </div>
      <div className="space-y-3">
        {gaps.map((gap) => (
          <div key={gap.id} className={`bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-start gap-4 transition-opacity ${gap.resolved ? "opacity-40" : "hover:border-primary/40"}`}>
            <div className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${severityDot(gap.severity)}`} />
            {gap.resolved && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-1" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-slate-900">{gap.label}</span>
                <Badge variant={severityVariant(gap.severity)} className="text-xs capitalize">{gap.severity}</Badge>
                <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" /> ~{gap.estimatedHours}h</span>
                {gap.fixStrategy && (() => {
                  const meta = fixStrategyMeta[gap.fixStrategy];
                  const StratIcon = meta.icon;
                  return (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${meta.className}`}>
                      <StratIcon className="h-3 w-3" />{meta.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-base text-slate-700 leading-relaxed">{gap.description}</p>
              {gap.interviewQuestion && (
                <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
                  <span><span className="font-semibold text-slate-700">Interview question: </span>{gap.interviewQuestion}</span>
                </div>
              )}
              {gap.impactIfIgnored && (
                <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600 font-medium bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <AlertOctagon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{gap.impactIfIgnored}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function GapsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [report, latestAnalysis] = await Promise.all([
    db.gapReport.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
    db.resumeAnalysis.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, createdAt: true } }),
  ]);

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Gap Engine</h1>
          <p className="text-slate-300 mt-2 text-base">AI identifies every skill, project, and story gap between you and your target role.</p>
        </div>
        <Card className="text-center py-20">
          <CardContent className="space-y-5">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Target className="h-8 w-8 text-slate-400" />
            </div>
            {latestAnalysis ? (
              <>
                <div>
                  <p className="text-lg font-semibold">Resume analyzed — generate your gap report</p>
                  <p className="text-slate-300 mt-1">Your resume analysis is ready. Click below to generate your personalized gap report.</p>
                </div>
                <GapGenerateButton analysisId={latestAnalysis.id} />
              </>
            ) : (
              <>
                <div>
                  <p className="text-lg font-semibold">No gap report yet</p>
                  <p className="text-slate-300 mt-1">Upload and analyze your resume first — your gap report is generated automatically.</p>
                </div>
                <Link href="/resume">
                  <Button className="gap-2 h-11">
                    <FileText className="h-4 w-4" />Analyze my resume
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const skillGaps = (report.skillGaps as unknown) as GapItem[];
  const projectGaps = (report.projectGaps as unknown) as GapItem[];
  const storyGaps = (report.storyGaps as unknown) as GapItem[];
  const allGaps = [...skillGaps, ...projectGaps, ...storyGaps];
  const totalOpen = allGaps.filter((g) => !g.resolved).length;
  const totalResolved = allGaps.filter((g) => g.resolved).length;
  const totalHours = allGaps.filter((g) => !g.resolved).reduce((s, g) => s + g.estimatedHours, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold">Gap Engine</h1>
          <p className="text-slate-300 mt-2 text-base">{totalOpen} gaps remaining · ~{totalHours}h of work to close them</p>
        </div>
        <div className="text-center shrink-0">
          <div className="text-4xl md:text-6xl font-bold text-primary">{report.totalGapScore}</div>
          <div className="text-base text-slate-300 font-medium">readiness score</div>
        </div>
      </div>
      {report.summary && (
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1.5">AI Assessment</p>
          <p className="text-base text-slate-700 leading-relaxed">{report.summary}</p>
        </div>
      )}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium">Gaps closed</span>
            <span className="text-slate-300">{totalResolved} / {allGaps.length}</span>
          </div>
          <Progress value={allGaps.length ? (totalResolved / allGaps.length) * 100 : 0} className="h-2.5" />
        </CardContent>
      </Card>
      {latestAnalysis && report && new Date(latestAnalysis.createdAt) > new Date(report.createdAt) && (
        <div className="flex items-center justify-between gap-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4">
          <div className="flex items-start gap-3">
            <RefreshCw className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300 text-sm">New resume detected</p>
              <p className="text-amber-400 text-sm">You uploaded a new resume after your last gap analysis. Re-run to get updated gaps.</p>
            </div>
          </div>
          <RegenerateGapButton analysisId={latestAnalysis.id} />
        </div>
      )}
      <GapSection title="Skill Gaps" gaps={skillGaps} icon={Zap} />
      <GapSection title="Project Gaps" gaps={projectGaps} icon={ArrowRight} />
      <GapSection title="Story Gaps" gaps={storyGaps} icon={CheckCircle2} />
      <Link href="/roadmap">
        <Button className="w-full gap-2 h-12 text-base font-semibold">
          View your 90-day plan to close these gaps<ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
