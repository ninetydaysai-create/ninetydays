import { TargetRole } from "@prisma/client";
import { GapReportResult } from "@/types/gaps";
import { GitHubSignal } from "@/lib/github-signal";
import { detectServiceCompanyEmployer } from "./service-company";

interface ResumeSignal {
  overallScore: number;
  skillsFound: string[];
  techYears: Record<string, number>; // { React: 3, Java: 8, ... }
  starStoriesCount: number;
  impactScore: number;
  projectComplexity: number;
  signalDepthMap?: Record<string, string>; // per-skill depth from resume analysis
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
  skillsFound: string[],
  signalDepthMap?: Record<string, string>,
): "ABSENT" | "WEAK" | "MODERATE" {
  const label = gapLabel.toLowerCase();

  // Check stored signal depth map first — more accurate than text heuristics
  if (signalDepthMap) {
    const match = Object.entries(signalDepthMap).find(([skill]) => {
      const s = skill.toLowerCase();
      return s === label || label.includes(s) || s.includes(label.split(" ")[0]);
    });
    if (match) {
      const depth = match[1];
      if (depth === "STRONG" || depth === "MODERATE") return "MODERATE";
      if (depth === "WEAK") return "WEAK";
    }
  }

  const text = resumeText.toLowerCase();
  const keyword = label.split(" ")[0].toLowerCase();

  const techMatch = Object.entries(techYears).find(([tech]) =>
    label.includes(tech.toLowerCase()) || tech.toLowerCase().includes(keyword)
  );
  if (techMatch && techMatch[1] >= 2) return "MODERATE";

  const inSkills = skillsFound.some(
    (s) => s.toLowerCase().includes(keyword) || label.includes(s.toLowerCase())
  );

  // Check for keyword co-occurring with project-action verbs in nearby lines (±2 lines)
  const lines = text.split("\n");
  const projectVerbs = /built|developed|deployed|implemented|designed|shipped|created/;
  let hasNearbyProjectContext = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(keyword)) {
      const window = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3));
      if (window.some((l) => projectVerbs.test(l))) {
        hasNearbyProjectContext = true;
        break;
      }
    }
  }

  const mentionCount = (text.match(new RegExp(keyword, "g")) ?? []).length;
  if (inSkills && mentionCount >= 2 && hasNearbyProjectContext) return "MODERATE";
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

INSTRUCTION: Reference specific repo names in task descriptions.
Example: instead of "Build a REST API" → "Add rate limiting and auth to your ${signal.topRepos[0]?.name ?? "existing"} project".
`;
}

const MAX_RESUME_CHARS = 15_000;

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

  // Extract concrete anchors from the candidate's actual data for use in format examples
  const topTech = resumeSignal
    ? Object.entries(resumeSignal.techYears).sort(([, a], [, b]) => b - a)
    : [];
  const topTechName = topTech[0]?.[0] ?? "their primary language";
  const topTechYears = topTech[0]?.[1] ?? yoe ?? "X";
  const companyName = currentRole && currentRole.includes(" at ")
    ? currentRole.split(" at ").pop()!
    : "their current company";
  const firstGapLabel = gapReport.skillGaps[0]?.label ?? gapReport.projectGaps[0]?.label ?? "their top gap";
  const firstCriticalGap = [...gapReport.skillGaps, ...gapReport.projectGaps, ...gapReport.storyGaps]
    .find(g => g.severity === "critical")?.label ?? firstGapLabel;

  const senioritySection = yoe != null ? `\nSENIORITY CONTEXT — ${yoe} years experience (${seniorityLabel}):
${yoe >= 7
  ? `- This is a senior engineer. Do NOT include beginner tasks (tutorial videos, basic syntax exercises, "learn X from scratch").
- Every task must be at senior level: architecture decisions, system design docs, writing RFCs, reframing ownership narrative.
- The gap isn't knowledge — it's demonstrable product ownership and quantified impact stories.
- Phase 1 must reframe the narrative (resume rewrites, LinkedIn, story crafting), NOT teach fundamentals.`
  : yoe >= 4
  ? `- Mid-level engineer. Some foundational tasks are OK but focus on product ownership and building real things.
- Prioritize: portfolio projects that demonstrate impact, strong STAR stories, system design practice.`
  : `- Early career engineer. Foundational tasks + guided projects are appropriate.
- Build real projects from scratch, demonstrate initiative and learning velocity.`}` : "";

  const currentRoleContext = currentRole
    ? `\nCURRENT ROLE: ${currentRole} — the transition narrative goes FROM this specific role TO ${roleLabel}. Week 1–2 must explicitly address what changes when moving from ${companyName} to a product company.`
    : "";

  const safeResumeText = resumeText && resumeText.length > MAX_RESUME_CHARS
    ? resumeText.slice(0, MAX_RESUME_CHARS) + "\n[truncated]"
    : resumeText;

  // Build signal depth map for all gaps
  const signalMap: Record<string, string> = {};
  if (safeResumeText && resumeSignal) {
    [...gapReport.skillGaps, ...gapReport.projectGaps, ...gapReport.storyGaps].forEach((gap) => {
      signalMap[gap.label] = classifySignalDepth(
        gap.label,
        safeResumeText,
        resumeSignal.techYears,
        resumeSignal.skillsFound,
        resumeSignal.signalDepthMap,
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

  const hasServiceCompanyPattern = safeResumeText
    ? detectServiceCompanyEmployer(safeResumeText)
    : false;

  return `You are a senior engineering career coach building a PERSONALIZED 12-week transition plan for one specific candidate. This is NOT a template. Every week theme, task description, and deliverable must be written as if you know this person's resume by heart — naming their actual companies, projects, technologies, and gaps. Generic output is not acceptable.

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
${hasServiceCompanyPattern ? "- ⚠️ SERVICE COMPANY BACKGROUND DETECTED: delivery/outsourcing patterns found. Must address product ownership gap explicitly in Weeks 1-2." : ""}

RESUME (full text — read every line. Name specific projects, companies, and technologies from this resume in your tasks):
${safeResumeText ?? "Not available"}
${githubSignalSection(githubSignal ?? null)}
---

GAP ANALYSIS WITH SIGNAL DEPTH (starting point for each gap area):
- ABSENT: not mentioned at all → candidate needs conceptual intro before building
- WEAK: listed as a skill but no project evidence → skip tutorials, assign a project immediately
- MODERATE: some evidence but not production-depth → skip beginner content, extend/deepen existing work

SKILL GAPS:
${formatGapsWithDepth(gapReport.skillGaps)}

PROJECT GAPS:
${formatGapsWithDepth(gapReport.projectGaps)}

STORY GAPS:
${formatGapsWithDepth(gapReport.storyGaps)}

---

⚠️ CONCRETE PERSONALIZATION — MANDATORY RULES FOR EVERY OUTPUT FIELD:

RULE 1 — WEEK THEME must name this candidate's specific technology, project, or transition:
❌ REJECTED: "System Design Fundamentals"
❌ REJECTED: "Python & ML Foundations"
❌ REJECTED: "Backend Development"
✅ REQUIRED: "Design your ${companyName} experience at scale — write the system design doc that was never written"
✅ REQUIRED: "Close the ${firstCriticalGap} gap: build the project your ${topTechName} experience is missing"
✅ REQUIRED: "Reframe ${topTechYears} years of ${topTechName} work into ownership language for ${roleLabel} screens"

RULE 2 — DELIVERABLE must be a specific artifact using their actual stack:
❌ REJECTED: "A design document"
❌ REJECTED: "Completed LeetCode practice"
✅ REQUIRED: "A GitHub-committed system design doc for a [specific feature from their resume] scaled to 10M users"
✅ REQUIRED: "Three rewritten resume bullets from your ${companyName} tenure, each with a measurable outcome"

RULE 3 — TASK DESCRIPTION must use this EXACT format, with each section grounded in their resume:

CONTEXT: <1 sentence starting with their actual role/company/tech — why this task matters GIVEN their specific background>
ACTION: <exactly what to do — name their existing projects, technologies, and companies. Never say "build a project from scratch" if they already have relevant work — say "extend/add to [their actual project]">
SUCCESS CRITERIA: <concrete, measurable artifact — name the technology, repo, or doc. Never vague outcomes like "understand X better">

Examples using THIS candidate's background:
❌ BAD — could apply to anyone:
  CONTEXT: System design is important for software engineers.
  ACTION: Study system design concepts and practice designing systems.
  SUCCESS CRITERIA: Feel comfortable with system design questions.

✅ GOOD — specific to this person:
  CONTEXT: Your ${topTechYears} years of ${topTechName} at ${companyName} show strong implementation skill but zero evidence of architecture decisions — ${roleLabel} interviewers ask this in the first round.
  ACTION: Take the most complex feature you built at ${companyName} and write the design doc that should have existed — data model, API contract, how you'd handle 10x load, what you'd do differently now.
  SUCCESS CRITERIA: A markdown design doc committed to GitHub covering: schema diagram, 3 API endpoints with request/response, caching strategy, and one failure mode + mitigation.

RULE 4 — SIGNAL DEPTH DETERMINES STARTING POINT:
- ABSENT → include conceptual foundation then build. Never skip explanation for ABSENT gaps.
- WEAK → skip tutorials entirely. Assign a real project on Day 1 of the week. They know the concept.
- MODERATE → skip beginner projects. Extend existing work to production depth. Reference their actual code.

RULE 5 — SERVICE COMPANY REFRAMING (if applicable):
${hasServiceCompanyPattern
  ? `Week 1–2 MUST include: Take 3 specific bullets from their resume that use delivery language ("worked on", "contributed to", "part of the team") and rewrite each as ownership language ("designed and built X that achieved Y"). This is the #1 rejection cause and must come first.`
  : "Not applicable for this candidate."}

RULE 6 — PHASE STRUCTURE:
- Phase 1 (Weeks 1–4): Close every CRITICAL+ABSENT gap. If service company background, start with narrative reframing.
- Phase 2 (Weeks 5–8): Close CRITICAL+WEAK and all MAJOR gaps. Build 2–3 real portfolio projects.
- Phase 3 (Weeks 9–12): Mock interviews, application polish, behavioral story practice.

  CRITICAL gaps MUST have a task in Weeks 1–4. MAJOR gaps MUST be covered by Week 8.
  If task slots run out, remove MINOR tasks first. Never leave a CRITICAL gap without coverage.

RULE 7 — whyItMatters must be interview-specific:
Must say exactly why this task matters for a ${roleLabel} interview — what the interviewer asks, what happens without it.
❌ REJECTED: "This skill is important for product engineers."
✅ REQUIRED: "Without this, when asked about [specific thing from their resume], you'll be unable to go deeper than tool names — the interviewer ends the screen."

---

GAP LABELS (exact strings — use these for gapLabel in tasks):
${[...gapReport.skillGaps, ...gapReport.projectGaps, ...gapReport.storyGaps]
  .map((g) => `  "${g.label}"`)
  .join("\n")}

---

Return a JSON object: { "applyReadyAt": <week 1-12 when candidate should start applying>, "weeks": [ ... ] }

applyReadyAt guidance:
- FAANG: Week 10+ (needs DS&A depth + system design practice)
- Funded startup: Week 6-8 (portfolio matters more)
- Any company: Week 8-10 (balanced)
- Adjust based on critical gap count and severity

Each week must follow this exact shape:
{
  "weekNumber": <1-12>,
  "theme": "<RULE 1 — specific to THIS candidate, names their tech/company/project>",
  "estimatedHours": <integer, max ${hoursPerWeek}>,
  "deliverable": "<RULE 2 — one concrete artifact with specific tech/doc/repo name>",
  "tasks": [
    {
      "label": "<specific task name that names their tech or project>",
      "description": "<RULE 3 — CONTEXT / ACTION / SUCCESS CRITERIA format, every line references their resume>",
      "whyItMatters": "<RULE 7 — interview-specific reason, not generic career advice>",
      "resourceUrls": ["<real free URL — docs, YouTube, GitHub, HuggingFace, papers>"],
      "hours": <integer>,
      "impactScore": <1-10: 9-10=closes CRITICAL gap, 7-8=closes MAJOR gap, 5-6=MINOR polish, 1-4=optional>,
      "gapLabel": "<exact label from GAP LABELS above, or omit if no direct gap mapping>"
    }
  ]
}

3-5 tasks per week. Return ONLY the JSON object. No markdown. No text outside the JSON.

FINAL CHECK before returning: read every theme, deliverable, and task CONTEXT sentence. If any of them could have been written for a different person's resume without changing a word — rewrite it to name this candidate's specific background.`;
}
