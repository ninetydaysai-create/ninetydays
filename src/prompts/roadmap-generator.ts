import { TargetRole } from "@prisma/client";
import { GapReportResult } from "@/types/gaps";
import { GitHubSignal } from "@/lib/github-signal";

interface ResumeSignal {
  overallScore: number;
  skillsFound: string[];
  techYears: Record<string, number>; // { React: 3, Java: 8, ... }
  starStoriesCount: number;
  impactScore: number;
  projectComplexity: number;
}

export interface PlanningContext {
  hoursPerWeek: number;
  targetTimeline: string;     // "3_months" | "6_months" | "12_months"
  targetCompanyType: string;  // "faang" | "funded_startup" | "any_product"
  learningStyle: string;      // "projects" | "courses" | "docs" | "mix"
  targetReason: string;       // "growth" | "passion" | "culture" | "relocation"
  yearsExperience?: number;
  currentRole?: string;
}

function classifySignalDepth(
  gapLabel: string,
  resumeText: string,
  techYears: Record<string, number>,
  skillsFound: string[]
): "ABSENT" | "WEAK" | "MODERATE" {
  const label = gapLabel.toLowerCase();
  const text = resumeText.toLowerCase();

  const techMatch = Object.entries(techYears).find(([tech]) =>
    label.includes(tech.toLowerCase()) || tech.toLowerCase().includes(label.split(" ")[0])
  );
  if (techMatch && techMatch[1] >= 2) return "MODERATE";

  const inSkills = skillsFound.some(
    (s) => s.toLowerCase().includes(label.split(" ")[0]) || label.includes(s.toLowerCase())
  );

  const mentionCount = (text.match(new RegExp(label.split(" ")[0], "g")) ?? []).length;
  const hasProjectContext =
    text.includes("built") || text.includes("developed") || text.includes("deployed") || text.includes("implemented");

  if (inSkills && mentionCount >= 3 && hasProjectContext) return "MODERATE";
  if (inSkills || mentionCount >= 1) return "WEAK";
  return "ABSENT";
}

function timelineInstructions(timeline: string, hoursPerWeek: number): string {
  if (timeline === "3_months") {
    return `URGENCY: HIGH — candidate wants a job in 3 months (12 weeks). Ruthlessly prioritize. Focus only on tasks with impactScore ≥ 7. Cut nice-to-have topics. Every week must close a CRITICAL gap or build an interview-ready deliverable. No luxury of breadth — go deep on what matters most.`;
  }
  if (timeline === "6_months") {
    return `URGENCY: MEDIUM — candidate has 6 months. This 12-week plan covers the first sprint. Build a solid foundation and 2-3 portfolio projects. Include both depth and some breadth. Phase 3 has room for polish and multiple mock interviews.`;
  }
  return `URGENCY: LOW — candidate has 12 months. This 12-week plan is sprint 1 of 4. Prioritize deep understanding over speed. Include stretch goals and advanced topics. Build the strongest possible foundation — the candidate has time to go deep.`;
}

function companyTypeInstructions(companyType: string): string {
  if (companyType === "faang") {
    return `TARGET COMPANY: FAANG / Big Tech (Google, Meta, Apple, Amazon, Microsoft).
MANDATORY inclusions every week:
- LeetCode practice: minimum 3 problems/week, mix of Medium and Hard, focused on trees, graphs, DP, arrays
- System design: at least 1 full system design session per week from Week 3 onwards
- Behavioral prep: STAR story for each leadership principle
These are non-negotiable. FAANG screens are 50% DS&A + 50% system design at senior levels.`;
  }
  if (companyType === "funded_startup") {
    return `TARGET COMPANY: Series B+ Startup (funded product companies).
Focus on: shipping speed, full-stack ownership, metrics-driven development, product intuition.
Include: end-to-end feature builds, architecture decision records, infra basics (Docker, CI/CD), product sense exercises.
Less emphasis on: puzzle-style algorithmic problems — do Easy/Medium LeetCode but not Hard grinding.
More emphasis on: "show me what you can build" — strong GitHub portfolio matters more than whiteboard performance.`;
  }
  return `TARGET COMPANY: Any product company (balanced approach).
Balance between: algorithmic interview prep (LeetCode Medium), system design, and portfolio projects.
Include both coding practice and real deliverables each week.`;
}

function learningStyleInstructions(style: string): string {
  if (style === "projects") {
    return `LEARNING STYLE: Build-first. Candidate learns by doing. Every task must produce a code artifact or running system. Minimize reading-only tasks. Reference project-based tutorials and GitHub examples over video lectures. Default to "build X" over "watch video about X".`;
  }
  if (style === "courses") {
    return `LEARNING STYLE: Structured learner. Candidate prefers watching video courses before building. Include structured course recommendations (Coursera, Udemy, YouTube playlists) as the primary learning path, followed by a small project to apply knowledge. Reference specific course names and chapter numbers where possible.`;
  }
  if (style === "docs") {
    return `LEARNING STYLE: Deep reader. Candidate prefers official documentation, technical blogs, and books. Recommend official docs, engineering blogs (Google AI, Meta Engineering, Netflix Tech), and books (DDIA, CLRS) as primary references. Build exercises reinforce the reading.`;
  }
  return `LEARNING STYLE: Mixed. Balance structured resources (courses/docs) with hands-on project tasks. Each week should include both a learning resource and a build deliverable.`;
}

function reasonContext(reason: string): string {
  const map: Record<string, string> = {
    growth:     "Candidate is motivated by career growth and higher TC. Frame task descriptions in terms of career impact and progression.",
    passion:    "Candidate wants to own and build products, not deliver for clients. Emphasize ownership language, product thinking, and builder mindset in task descriptions.",
    culture:    "Candidate is escaping low-ownership, politics-heavy environment. Highlight tasks that demonstrate technical leadership, initiative, and engineering craft.",
    relocation: "Candidate may be targeting specific job markets. Include remote-friendly company types and cross-timezone collaboration considerations in project ideas.",
  };
  return map[reason] ?? "";
}

function githubSignalSection(signal: GitHubSignal | null): string {
  if (!signal) return "";
  const repoList = signal.topRepos
    .map((r) => `    • ${r.name} (${r.stars}⭐, ${r.language}): ${r.description || "no description"}`)
    .join("\n");
  return `
GITHUB PROFILE SIGNAL:
- Username: ${signal.username}
- Own public repos: ${signal.publicRepos}
- Languages used: ${signal.topLanguages.slice(0, 6).join(", ")}
- Top repos:
${repoList}

INSTRUCTION: Reference specific repo names and domains in task descriptions where relevant.
Example: instead of "Build a REST API" → "Add authentication and rate limiting to your ${signal.topRepos[0]?.name ?? "existing"} project".
`;
}

export function buildRoadmapPrompt(
  gapReport: GapReportResult,
  targetRole: TargetRole,
  planning: PlanningContext,
  resumeText?: string,
  resumeSignal?: ResumeSignal,
  githubSignal?: GitHubSignal | null
): string {
  const roleLabel = targetRole.replace(/_/g, " ");
  const { hoursPerWeek, targetTimeline, targetCompanyType, learningStyle, targetReason, yearsExperience, currentRole } = planning;

  const yoe = yearsExperience ?? null;
  const seniorityLabel = yoe == null ? null : yoe >= 10 ? "Staff/Principal" : yoe >= 7 ? "Senior" : yoe >= 4 ? "Mid-level" : "Junior";
  const senioritySection = yoe != null ? `\nSENIORITY CONTEXT — ${yoe} years experience (${seniorityLabel}):
${yoe >= 7
  ? `- This is a senior engineer. Do NOT include beginner tasks (tutorial videos, basic syntax exercises).
- Week tasks should be at senior level: architecture decisions, system design docs, leading code reviews, writing RFCs.
- The "gap" isn't knowledge — it's demonstrable product ownership and quantified impact stories.
- Phase 1 should reframe the narrative (resume bullets, LinkedIn, story crafting), not teach basics.`
  : yoe >= 4
  ? `- Mid-level engineer. Some foundational tasks are OK but focus on product ownership and building real things.
- Prioritize: build portfolio projects that demonstrate impact, write strong STAR stories, practice system design.`
  : `- Early career engineer. Foundational tasks + guided projects are appropriate.
- Build real projects from scratch, focus on demonstrating initiative and learning velocity.`}` : "";

  const currentRoleContext = currentRole ? `\nCURRENT ROLE: ${currentRole} — frame the transition narrative from THIS role to ${roleLabel}. Week 1–2 must address the "from delivery/service work to product ownership" shift explicitly if relevant.` : "";

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

  return `You are a senior engineering career coach building a PERSONALIZED 12-week transition plan. This is NOT a generic template — every week and every task must be calibrated to this specific candidate's actual starting point, goals, and constraints.

TARGET ROLE: ${roleLabel} at a top product company
AVAILABLE TIME: ${hoursPerWeek} hours/week
${currentRoleContext}${senioritySection}

---

CANDIDATE CONTEXT:
${timelineInstructions(targetTimeline, hoursPerWeek)}

${companyTypeInstructions(targetCompanyType)}

${learningStyleInstructions(learningStyle)}

MOTIVATION: ${reasonContext(targetReason)}

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
${githubSignalSection(githubSignal ?? null)}
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

4. PHASE STRUCTURE — derive from gap distribution and timeline urgency:
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

GAP LABELS (exact strings — use these for gapLabel in tasks):
${[...gapReport.skillGaps, ...gapReport.projectGaps, ...gapReport.storyGaps]
  .map((g) => `  "${g.label}"`)
  .join("\n")}

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
      "impactScore": <1-10>,
      "gapLabel": "<exact label from the GAP LABELS list above, or omit if this task doesn't directly close a gap>"
    }
  ]
}

Each week: 3-5 tasks. Return ONLY the JSON object. No markdown. No explanation outside the JSON.`;
}
