import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { ROLE_LABELS } from "@/lib/constants";
import { TargetRole } from "@prisma/client";

interface Snapshot {
  name: string | null;
  targetRole: string;
  targetRoleTitle: string | null;
  careerGoal: string | null;
  targetCompanies: string[];
  dayCount: number;
  readiness: number | null;
  tasksDone: number;
  tasksTotal: number;
  deliverableCount: number;
  deliverables: { title: string; type: string; aiScore: number | null }[];
  skillScores: Record<string, number>;
  skillHistory: Record<string, { before: number; now: number; delta: number }>;
  companies: { name: string; logo: string; score: number; status: string; statusColor: string }[];
  sessions: number;
  avgInterviewScore: number | null;
  generatedAt: string;
}

const DIM_LABELS: Record<string, string> = {
  resume_quality:"Resume Quality", ats_score:"ATS Score", ownership_language:"Ownership Language",
  impact_writing:"Impact Writing", interview_confidence:"Interview Confidence", system_design:"System Design",
  business_thinking:"Business Thinking", leadership:"Leadership", communication:"Communication",
  ai_knowledge:"AI Knowledge", problem_solving:"Problem Solving",
};

const TYPE_LABELS: Record<string, string> = {
  resume_bullets:"Resume Bullets", linkedin_summary:"LinkedIn Summary", star_story:"STAR Story",
  portfolio_project:"Portfolio Project", interview_answers:"Interview Answers",
  case_study:"Case Study", flashcard_deck:"Flashcard Deck", project_doc:"Project Doc",
};

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.round((score / max) * 100);
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ height: 6, background: "#e5e7eb", borderRadius: 9999, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 9999 }} />
    </div>
  );
}

interface Props { params: Promise<{ token: string }> }

export default async function PortfolioExportPage({ params }: Props) {
  const { token } = await params;
  const record = await db.portfolioExport.findUnique({ where: { token } });
  if (!record) notFound();

  const s = record.snapshot as unknown as Snapshot;
  const roleLabel = ROLE_LABELS[s.targetRole as TargetRole] ?? s.targetRole.replace(/_/g, " ");
  const generated = format(new Date(s.generatedAt), "MMMM d, yyyy");

  const improvements = Object.entries(s.skillHistory)
    .sort(([, a], [, b]) => b.delta - a.delta);

  const topCompany = s.companies[0];

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 1.5cm; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; color: #111827; }
      `}</style>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem", minHeight: "100vh" }}>

        {/* Action bar */}
        <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 24 }}>
          <button
            onClick={() => window.print()}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #d1d5db", background: "white", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#374151" }}
          >
            ↓ Download PDF
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); }}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #d1d5db", background: "white", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#374151" }}
          >
            Copy link
          </button>
        </div>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", borderRadius: 16, padding: "2rem", color: "white", marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.75, marginBottom: 8 }}>
            90-Day Career Transformation Report
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>{s.name ?? "Career Portfolio"}</h1>
          <p style={{ fontSize: 16, opacity: 0.85, marginBottom: s.careerGoal ? 12 : 0 }}>
            {s.targetRoleTitle ?? roleLabel}
            {s.targetCompanies[0] ? ` · Targeting ${s.targetCompanies.slice(0, 2).join(", ")}` : ""}
          </p>
          {s.careerGoal && (
            <p style={{ fontSize: 14, opacity: 0.7, fontStyle: "italic" }}>"{s.careerGoal}"</p>
          )}
        </div>

        {/* AI Summary */}
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", marginBottom: 8 }}>
            Transformation Summary
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#374151" }}>{record.aiSummary}</p>
        </div>

        {/* At a glance */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Days Active",        value: s.dayCount                                    },
            { label: "Tasks Completed",    value: `${s.tasksDone}/${s.tasksTotal}`              },
            { label: "Deliverables Built", value: s.deliverableCount                            },
            { label: "Readiness Score",    value: s.readiness !== null ? `${s.readiness}%` : "—" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1rem", textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: "#4f46e5" }}>{stat.value}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Skill transformation */}
        {improvements.length > 0 && (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", marginBottom: 16 }}>
              Skill Transformation
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {improvements.map(([dim, { before, now, delta }]) => (
                <div key={dim}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{DIM_LABELS[dim] ?? dim}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>+{delta} pts</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#9ca3af", width: 20 }}>{before}</span>
                    <div style={{ flex: 1, position: "relative" }}>
                      <div style={{ height: 6, background: "#e5e7eb", borderRadius: 9999 }}>
                        <div style={{ height: "100%", width: `${before}%`, background: "#d1d5db", borderRadius: 9999 }} />
                      </div>
                      <div style={{ height: 6, background: "#e5e7eb", borderRadius: 9999, marginTop: 3 }}>
                        <div style={{ height: "100%", width: `${now}%`, background: now >= 70 ? "#10b981" : now >= 40 ? "#f59e0b" : "#ef4444", borderRadius: 9999 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: now >= 70 ? "#10b981" : now >= 40 ? "#f59e0b" : "#ef4444", width: 20 }}>{now}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two column: company readiness + interview */}
        <div style={{ display: "grid", gridTemplateColumns: s.sessions > 0 ? "1fr 1fr" : "1fr", gap: 16, marginBottom: 20 }}>
          {/* Company readiness */}
          {s.companies.length > 0 && (
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.5rem" }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", marginBottom: 12 }}>
                Company Readiness
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {s.companies.slice(0, 6).map(c => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ height: 28, width: 28, borderRadius: 6, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>
                      {c.logo}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: c.score >= 65 ? "#10b981" : c.score >= 45 ? "#f59e0b" : "#ef4444" }}>{c.score}%</span>
                      </div>
                      <ScoreBar score={c.score} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interview performance */}
          {s.sessions > 0 && (
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.5rem" }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", marginBottom: 12 }}>
                Interview Performance
              </p>
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <p style={{ fontSize: 48, fontWeight: 900, color: s.avgInterviewScore && s.avgInterviewScore >= 70 ? "#10b981" : "#f59e0b" }}>
                  {s.avgInterviewScore ?? "—"}
                  <span style={{ fontSize: 18, color: "#9ca3af", fontWeight: 400 }}>/100</span>
                </p>
                <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>avg across {s.sessions} session{s.sessions !== 1 ? "s" : ""}</p>
              </div>
            </div>
          )}
        </div>

        {/* Deliverables */}
        {s.deliverables.length > 0 && (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", marginBottom: 12 }}>
              Career Assets Built ({s.deliverableCount})
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {s.deliverables.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</p>
                    <p style={{ fontSize: 10, color: "#9ca3af" }}>{TYPE_LABELS[d.type] ?? d.type}</p>
                  </div>
                  {d.aiScore !== null && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: d.aiScore >= 70 ? "#10b981" : "#f59e0b", marginLeft: 8, flexShrink: 0 }}>{d.aiScore}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "1.5rem 0", borderTop: "1px solid #e5e7eb", marginTop: 8 }}>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>
            Generated {generated} · Built with{" "}
            <a href="https://ninetydays.ai" style={{ color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>NinetyDays</a>
            {" "}— AI-powered career transformation
          </p>
        </div>
      </div>
    </>
  );
}
