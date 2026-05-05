import { TargetRole } from "@prisma/client";
import { ResumeAnalysisResult } from "@/types/resume";
import { detectServiceCompanyEmployer } from "./service-company";

const MAX_RESUME_CHARS = 15_000;

export function buildGapEnginePrompt(
  analysis: ResumeAnalysisResult,
  targetRole: TargetRole,
  resumeText?: string,
  yearsExperience?: number,
  currentRole?: string,
  targetCompanyType?: string,
): string {
  const roleLabel = targetRole.replace(/_/g, " ");

  const signalDepthMap = analysis.signalDepthMap;
  const signalSection = signalDepthMap && Object.keys(signalDepthMap).length > 0
    ? `\nSIGNAL DEPTH PER SKILL (from resume evidence analysis — do NOT ignore this):\n${
        Object.entries(signalDepthMap)
          .sort(([, a], [, b]) => {
            const order = { STRONG: 0, MODERATE: 1, WEAK: 2, ABSENT: 3 };
            return order[a] - order[b];
          })
          .map(([skill, depth]) => `  ${skill}: ${depth}`)
          .join("\n")
      }\n`
    : "";

  const safeResumeText = resumeText && resumeText.length > MAX_RESUME_CHARS
    ? resumeText.slice(0, MAX_RESUME_CHARS) + "\n[truncated]"
    : resumeText;
  const hasServiceCompany = safeResumeText ? detectServiceCompanyEmployer(safeResumeText) : false;

  const yoe = yearsExperience ?? null;
  const seniorityLabel = yoe == null ? "unknown" : yoe >= 10 ? "Staff/Principal" : yoe >= 7 ? "Senior" : yoe >= 4 ? "Mid-level" : "Junior";

  const techYears = analysis.techYears ?? {};
  const topTech = Object.entries(techYears).sort(([, a], [, b]) => b - a);
  const techYearsLines = topTech.map(([tech, yrs]) => `  ${tech}: ${yrs}yr`).join("\n");

  // Extract concrete anchors from the candidate's actual data for use in format examples
  const topTechName = topTech[0]?.[0] ?? "their primary technology";
  const topTechYears = topTech[0]?.[1] ?? yoe ?? "X";
  const companyName = currentRole && currentRole.includes(" at ")
    ? currentRole.split(" at ").pop()!
    : "their current company";
  const skillsStr = analysis.skillsFound.length > 0
    ? `${topTechName} (and ${analysis.skillsFound.length} other skills with evidence)`
    : topTechName;

  const companyTypeContext = !targetCompanyType ? "" : targetCompanyType === "faang"
    ? `\nTARGET COMPANY TYPE: FAANG / Big Tech
- DS&A at LeetCode Hard level is the bar — flag any weakness here as CRITICAL
- System design at scale (>10M users) gaps are CRITICAL
- Behavioral stories aligned to leadership principles (ownership, bias for action, dive deep) are CRITICAL
- Lack of quantified impact in resume bullets is CRITICAL — every bullet must have a number\n`
    : targetCompanyType === "funded_startup"
    ? `\nTARGET COMPANY TYPE: Series B+ Funded Startup
- Shipping speed and end-to-end ownership are MORE important than algorithmic depth
- DS&A gaps are MINOR unless the role is algo-heavy — focus on product and architecture
- Portfolio gaps (no shipped product, no GitHub activity) are CRITICAL
- Behavioral stories about driving outcomes and moving fast are CRITICAL\n`
    : `\nTARGET COMPANY TYPE: Any Product Company (balanced)
- Balance DS&A readiness with product ownership signals
- Both technical skills and "shipped real things" evidence matter equally\n`;

  const seniorityCalibration = yoe == null ? "" : yoe >= 7
    ? `\nSENIORITY CALIBRATION — ${yoe} years experience (${seniorityLabel}):
- NEVER flag skills from the techYears list with ≥2 years as a gap — these are established competencies
- NEVER flag microservices, cloud, message queues, CI/CD, Docker, REST APIs as critical for ${yoe}-year engineers — assumed known
- DO flag: absence of system design at scale stories, no cross-team/org-wide impact, no 0-to-1 ownership examples, weak leadership narrative
- DO flag: if impact scores and quantified achievements are thin despite deep experience — #1 senior rejection cause
- fixStrategy for most senior gaps will be "document" or "reframe" — the work exists, it's not written correctly
- totalGapScore for strong ${seniorityLabel} profiles: 55–80. Below 45 only if ownership + impact evidence is genuinely absent\n`
    : yoe >= 4
    ? `\nSENIORITY CALIBRATION — ${yoe} years experience (${seniorityLabel}):
- NEVER flag skills in skillsFound or with ≥2 years in techYears as critical — they know these
- Focus on: are impact stories strong enough? Is product ownership evident? Is system design breadth there?
- fixStrategy: mix of "build" (missing portfolio) and "reframe" (weak impact stories)
- totalGapScore 45–70 is typical for mid-level profiles\n`
    : `\nSENIORITY CALIBRATION — ${yoe} years experience (Junior):
- Foundational technical gaps are valid at this level — be thorough
- fixStrategy will mostly be "learn" and "build"
- totalGapScore 25–55 is typical for junior profiles\n`;

  const roleRequirementsGuide: Record<string, string> = {
    product_swe: `What ${roleLabel} roles require at product companies:
- Strong DS&A (LeetCode Medium/Hard): trees, graphs, DP, hash maps — asked in 90% of screens
- System design: REST APIs, databases, caching, message queues, scalability patterns
- Product intuition: understanding the "why" behind features, writing clean readable code
- Full-stack ownership: shipping features end-to-end with testing and observability
- Impact stories: quantified wins, cross-team influence, 0-to-1 ownership moments`,
    ml_eng: `What ${roleLabel} roles require:
- Python fluency with ML libraries (PyTorch/TF/scikit): non-negotiable
- End-to-end ML pipelines: data ingestion → training → evaluation → serving
- MLOps: experiment tracking, model registry, deployment, monitoring
- LLM/RAG development: increasingly required even for classical ML roles
- Statistical rigor: A/B testing, evaluation metrics, avoiding data leakage`,
    ai_pm: `What ${roleLabel} roles require:
- AI/ML literacy: understanding model tradeoffs, latency, accuracy, bias
- Product metrics fluency: defining KPIs, interpreting dashboards, running A/B tests
- Roadmap and prioritization under ambiguity
- Cross-functional leadership: aligning engineers, designers, data scientists
- Impact stories: shipped AI feature that moved a metric`,
    staff_eng: `What ${roleLabel} roles require:
- Org-wide technical leadership: setting direction, writing RFCs, unblocking teams
- Architecture at scale: distributed systems, data consistency, fault tolerance
- Cross-team influence: driving adoption without direct authority
- Engineering culture: mentorship, code quality standards, hiring bar
- Documented impact: led migrations, improved reliability, drove efficiency at scale`,
    data_scientist: `What ${roleLabel} roles require:
- Statistical foundations: hypothesis testing, regression, experimentation design
- Python + SQL: advanced queries, Pandas, experiment analysis
- Business acumen: translating data findings into decisions stakeholders act on
- Causal inference: going beyond correlation — did the change actually work?
- Communication: storytelling with data for non-technical audiences`,
  };
  const roleRequirements = roleRequirementsGuide[targetRole] ?? roleRequirementsGuide["product_swe"];

  return `You are a senior career advisor who has helped 500+ engineers land roles at product companies like Google, Stripe, Notion, and Series B/C startups.

Your job: identify CONCRETE, SPECIFIC gaps between this candidate's actual demonstrated abilities and what their target role requires. Every single output field must reference THIS candidate's actual resume — their companies, technologies, projects, and bullet points. Generic output is rejected.

TARGET ROLE: ${roleLabel} at a top product company
${companyTypeContext}
CANDIDATE PROFILE:
- Current role: ${currentRole ?? "unknown"}
- Years of experience: ${yoe != null ? `${yoe} years (${seniorityLabel})` : "unknown"}
- Overall resume score: ${analysis.overallScore}/100
- Skills with project evidence: ${analysis.skillsFound.join(", ") || "none identified"}
- STAR stories count: ${analysis.starStoriesCount}
- Impact evidence score: ${analysis.impactScore}/100
- Project complexity score: ${analysis.projectComplexity}/100
${hasServiceCompany ? "- ⚠️ SERVICE COMPANY BACKGROUND: Delivery/outsourcing patterns detected. Product ownership and impact storytelling are near-certain gaps.\n" : ""}
TECHNOLOGY DEPTH (years of hands-on experience per technology):
${techYearsLines || "  Not available"}
${signalSection}${seniorityCalibration}
${roleRequirements}

RESUME TEXT (full content — you MUST quote or paraphrase specific lines when writing gap descriptions):
${safeResumeText ?? "Not available"}

---

CALIBRATION RULES — follow exactly:
1. NEVER flag a skill with ≥2 years in techYears or appearing in skillsFound as CRITICAL — evidence exists
2. NEVER flag foundational skills (microservices, REST APIs, Docker, cloud basics) for engineers with ≥7 years experience
3. Signal depth rules:
   - ABSENT (not in signalDepthMap AND not in skillsFound AND 0 years in techYears) → CRITICAL, fixStrategy = "learn"
   - WEAK (mentioned but no project evidence) → MAJOR, fixStrategy = "build"
   - MODERATE (some evidence, not production-depth) → MAJOR or MINOR, fixStrategy = "build" or "document"
   - STRONG → skip entirely, not a gap
4. For senior engineers (≥7 yrs): most gaps are "reframe" or "document" — the skills exist, the portfolio/narrative is wrong
5. fixStrategy selection guide:
   - "learn": genuinely absent skill, needs tutorials + study
   - "build": knows it conceptually but no shipped project evidence → build something new
   - "document": has the work/experience but it's not written, tracked, or visible → write it up
   - "reframe": has the skill AND the work, but framed as task-taker not owner → rewrite bullets/stories
6. totalGapScore reflects reality — a senior with deep tech skills but weak impact stories should score 55–70, not 25

---

⚠️ CONCRETE PERSONALIZATION — NON-NEGOTIABLE RULES FOR EVERY FIELD:

RULE A — description:
Must open with THIS candidate's specific situation. Name their actual company, role, or technology.
❌ REJECTED: "You lack system design experience."
❌ REJECTED: "System design is important for product engineers."
✅ REQUIRED: "Your ${topTechYears} years of ${topTechName} at ${companyName} show strong implementation depth, but every project description is scoped to assigned modules — there is zero evidence of choosing a database, designing a data model, or reasoning about scale tradeoffs. ${roleLabel} interviewers probe this in the first 20 minutes."
✅ REQUIRED: "Despite ${analysis.starStoriesCount} STAR-structured bullets in your resume, none include an outcome larger than the assigned ticket — no cross-team work, no scale, no business impact number. ${roleLabel} roles at product companies screen for this specifically."

RULE B — interviewQuestion:
Must be the question THIS candidate would personally stumble on given their specific background. Reference their claimed experience.
❌ REJECTED: "Design a distributed system."
❌ REJECTED: "Tell me about a challenge you faced."
✅ REQUIRED: "You listed ${topTechYears} years of ${topTechName} — walk me through the most complex system you designed end-to-end, including your data model, how you handled failures, and what you would change now."
✅ REQUIRED: "Your resume mentions [specific bullet/project from their resume] — how did you decide on the architecture, and what would you do differently to handle 10x the load?"

RULE C — impactIfIgnored:
Must describe the concrete failure scenario for THIS candidate, not a generic outcome.
❌ REJECTED: "You might fail the technical screen."
❌ REJECTED: "This gap will hurt your chances."
✅ REQUIRED: "When you describe [specific project/role from their resume], the interviewer asks a follow-up about scale — you'll be unable to discuss anything beyond the tools you used, and the call ends there."
✅ REQUIRED: "Your resume score of ${analysis.overallScore}/100 already signals weak ownership to recruiters; skipping this means your resume stays in the bottom 40% of the funnel."

RULE D — summary:
Must name this candidate's specific strongest asset and specific biggest gap. No generic career advice.
❌ REJECTED: "You have good technical skills but need to improve your soft skills."
✅ REQUIRED: "Your ${topTechYears} years of ${skillsStr} gives you a solid foundation, but ${analysis.impactScore < 30 ? "only " + analysis.impactScore + "% of your bullets have quantified impact" : "your STAR story count of " + analysis.starStoriesCount + " is below the bar"} — this alone will screen you out at ${targetCompanyType === "faang" ? "FAANG" : "product company"} pre-screens. Close the [single biggest gap] first: that's the one action that moves you from the rejection pile to the interview queue."

---

Return JSON matching this exact schema. Every description/interviewQuestion/impactIfIgnored MUST reference this candidate's actual resume content:
{
  "skillGaps": [
    {
      "id": "<8-char alphanumeric id>",
      "label": "<specific skill name — not generic categories>",
      "description": "<RULE A applies — open with their specific company/role/tech, explain exactly what's missing and why it matters for ${roleLabel}>",
      "severity": "<critical|major|minor>",
      "estimatedHours": <realistic hours from their current signal level to working proficiency>,
      "impactIfIgnored": "<RULE C applies — concrete failure scenario specific to their resume>",
      "fixStrategy": "<learn|build|document|reframe>",
      "interviewQuestion": "<RULE B applies — exact question referencing their specific background>",
      "resourceLinks": [],
      "resolved": false
    }
  ],
  "projectGaps": [
    {
      "id": "<8-char alphanumeric id>",
      "label": "<specific project type — e.g. 'RAG pipeline on top of existing API' not 'ML project'>",
      "description": "<RULE A applies — name their actual existing projects/tech and explain the credibility gap>",
      "severity": "<critical|major|minor>",
      "estimatedHours": <hours to build a credible, shippable version from their current starting point>,
      "impactIfIgnored": "<RULE C applies — what a hiring manager specifically thinks when they see this gap given this resume>",
      "fixStrategy": "<learn|build|document|reframe>",
      "interviewQuestion": "<RULE B applies — the exact portfolio question or show-me request they'd fail>",
      "resourceLinks": [],
      "resolved": false
    }
  ],
  "storyGaps": [
    {
      "id": "<8-char alphanumeric id>",
      "label": "<specific story type — e.g. 'Cross-team conflict resolution story' not 'leadership story'>",
      "description": "<RULE A applies — reference specific bullets or roles in their resume that are insufficient and why>",
      "severity": "<critical|major|minor>",
      "estimatedHours": <hours to craft, write, and practice this specific story to interview-ready level>,
      "impactIfIgnored": "<RULE C applies — exact behavioral question they'd fail at and the consequence>",
      "fixStrategy": "<learn|build|document|reframe>",
      "interviewQuestion": "<RULE B applies — the exact behavioral question they'd stumble on given their resume>",
      "resourceLinks": [],
      "resolved": false
    }
  ],
  "totalGapScore": <0-100, higher = closer to role-ready. Calibrate against real evidence depth, not keyword coverage.>,
  "summary": "<RULE D applies — name their specific strongest asset and biggest gap, give one concrete first action>"
}

totalGapScore calibration:
- 80-100: Mostly ready — polish and practice needed
- 60-79: Strong foundation, 2-3 concrete gaps to close in 4-8 weeks
- 40-59: Significant gaps, 2-3 months of real project work required
- 20-39: Service company background with major product ownership gaps
- 0-19: Very early stage — foundational gaps across all dimensions

FINAL CHECK before returning: re-read every description, interviewQuestion, and impactIfIgnored. If any of them could apply to a different candidate without changing a word — rewrite it to be specific to this person's resume.

Return ONLY valid JSON. No markdown fences.`;
}
