import { TargetRole } from "@prisma/client";
import { GapReportResult } from "@/types/gaps";

interface ResumeSignal {
  overallScore: number;
  skillsFound: string[];
  techYears: Record<string, number>; // { Python: 4, React: 2 }
  starStoriesCount: number;
  impactScore: number;
  projectComplexity: number;
}

// Classify each gap's evidence depth from what's in the resume
function classifySignalDepth(
  gapLabel: string,
  resumeText: string,
  techYears: Record<string, number>,
  skillsFound: string[]
): "ABSENT" | "WEAK" | "MODERATE" {
  const label = gapLabel.toLowerCase();
  const text = resumeText.toLowerCase();

  // Check techYears first — has actual years of evidence
  const techMatch = Object.entries(techYears).find(([tech]) =>
    label.includes(tech.toLowerCase()) || tech.toLowerCase().includes(label.split(" ")[0])
  );
  if (techMatch && techMatch[1] >= 2) return "MODERATE";

  // Check if skill appears in skillsFound
  const inSkills = skillsFound.some(
    (s) => s.toLowerCase().includes(label.split(" ")[0]) || label.includes(s.toLowerCase())
  );

  // Check if it appears in resume text with project context
  const mentionCount = (text.match(new RegExp(label.split(" ")[0], "g")) ?? []).length;
  const hasProjectContext =
    text.includes("built") || text.includes("developed") || text.includes("deployed") || text.includes("implemented");

  if (inSkills && mentionCount >= 3 && hasProjectContext) return "MODERATE";
  if (inSkills || mentionCount >= 1) return "WEAK";
  return "ABSENT";
}

export function buildRoadmapPrompt(
  gapReport: GapReportResult,
  targetRole: TargetRole,
  hoursPerWeek: number,
  resumeText?: string,
  resumeSignal?: ResumeSignal
): string {
  const roleLabel = targetRole.replace(/_/g, " ");

  // Build signal depth map for all gaps
  const signalMap: Record<string, string> = {};
  if (resumeText && resumeSignal) {
    [...gapReport.skillGaps, ...gapReport.projectGaps, ...gapReport.storyGaps].forEach((gap) => {
      signalMap[gap.label] = classifySignalDepth(
        gap.label,
        resumeText,
        resumeSignal.techYears,
        resumeSignal.skillsFound
      );
    });
  }

  const formatGapsWithDepth = (gaps: GapReportResult["skillGaps"]) =>
    gaps
      .map((g) => {
        const depth = signalMap[g.label] ?? "ABSENT";
        return `  - [${g.severity.toUpperCase()}] [${depth}] ${g.label}: ${g.description}`;
      })
      .join("\n");

  const techYearsStr = resumeSignal
    ? Object.entries(resumeSignal.techYears)
        .sort((a, b) => b[1] - a[1])
        .map(([tech, yrs]) => `${tech} (${yrs}yr)`)
        .join(", ")
    : "unknown";

  const hasServiceCompanyPattern =
    resumeText &&
    /tcs|infosys|wipro|accenture|cognizant|capgemini|hcl|tech mahindra/i.test(resumeText);

  return `You are a senior engineering career coach building a PERSONALIZED 12-week transition plan. This is NOT a generic template — every week and every task must be calibrated to this specific candidate's actual starting point.

TARGET ROLE: ${roleLabel} at a top product company
AVAILABLE TIME: ${hoursPerWeek} hours/week

---

CANDIDATE SIGNAL (what the resume actually shows):
- Resume quality score: ${resumeSignal?.overallScore ?? "unknown"}/100
- Technologies with evidence: ${techYearsStr}
- STAR stories written: ${resumeSignal?.starStoriesCount ?? "unknown"}
- Impact evidence quality: ${resumeSignal?.impactScore ?? "unknown"}/100
- Project complexity score: ${resumeSignal?.projectComplexity ?? "unknown"}/100
${hasServiceCompanyPattern ? "- ⚠️ SERVICE COMPANY BACKGROUND DETECTED: Resume shows delivery/outsourcing patterns. Must address product ownership gap explicitly." : ""}

RESUME EXCERPT (actual candidate content — use this to personalize tasks):
${resumeText ? resumeText.slice(0, 3000) : "Not available"}

---

GAP ANALYSIS WITH SIGNAL DEPTH:

Each gap is tagged with signal depth from the resume:
- ABSENT: Not mentioned at all — start from fundamentals
- WEAK: Listed as skill or buzzword but no project evidence — skip basics, go straight to building
- MODERATE: Has some evidence but not production-depth — extend/deepen existing work

SKILL GAPS:
${formatGapsWithDepth(gapReport.skillGaps)}

PROJECT GAPS:
${formatGapsWithDepth(gapReport.projectGaps)}

STORY GAPS:
${formatGapsWithDepth(gapReport.storyGaps)}

---

CALIBRATION RULES — follow these strictly:

1. SIGNAL DEPTH DETERMINES STARTING POINT:
   - ABSENT → include conceptual intro + hands-on build (can't assume anything)
   - WEAK → skip tutorials, start with a project immediately (they know the syntax)
   - MODERATE → skip beginner projects, go straight to production-level extension
   Do NOT assign "learn Python basics" to someone with Python (4yr) in their profile.

2. REFERENCE ACTUAL RESUME CONTENT:
   Where possible, reference the candidate's existing projects by name or domain and suggest extending them.
   Example: If resume shows FastAPI work → "Add an LLM endpoint to your existing API service" not "Build an API from scratch".

3. SERVICE COMPANY REFRAMING (if detected):
   ${hasServiceCompanyPattern
     ? `Week 1-2 MUST include: Rewrite 3 resume bullets from delivery language to ownership language. Convert "worked on X" to "designed and built X that achieved Y". This is mandatory — it's the #1 rejection cause.`
     : "Not applicable."}

4. PHASE STRUCTURE — derive from gap distribution, not a template:
   - Phase 1 (Weeks 1-4): Close CRITICAL+ABSENT gaps. Build foundations the candidate actually lacks.
   - Phase 2 (Weeks 5-8): Close CRITICAL+WEAK and MAJOR gaps. Build 2-3 real portfolio projects.
   - Phase 3 (Weeks 9-12): Polish + practice. Mock interviews, applications, story refinement.

5. WEEK THEMES must be specific to THIS candidate:
   ❌ "Python & ML Foundations" (generic)
   ✅ "Build your first RAG pipeline on top of your existing FastAPI service" (specific)

6. TASKS must have concrete deliverables:
   Every task ends with something that exists: a GitHub repo, a deployed endpoint, a written story, a system design doc.

7. IMPACT SCORE calibration:
   - 9-10: Directly closes a CRITICAL gap
   - 7-8: Closes MAJOR gap or directly improves interview performance
   - 5-6: Portfolio polish or MINOR gap
   - 1-4: Supporting/optional task

---

Return a JSON object: { "weeks": [ ... ] }

Each week:
{
  "weekNumber": <1-12>,
  "theme": "<specific, personalized theme — NOT generic>",
  "estimatedHours": <max ${hoursPerWeek}>,
  "deliverable": "<one concrete artifact they must produce to mark this week done>",
  "tasks": [
    {
      "label": "<specific task name>",
      "description": "<exactly what to do — reference their background where possible>",
      "whyItMatters": "<one sentence: why this closes a real gap, cite interview data if possible>",
      "resourceUrls": ["<real free URL — docs, YouTube, GitHub, HuggingFace, papers>"],
      "hours": <integer>,
      "impactScore": <1-10>
    }
  ]
}

Each week: 3-5 tasks. Return ONLY the JSON object. No markdown. No explanation outside the JSON.`;
}
