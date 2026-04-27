import { TargetRole } from "@prisma/client";
import { ResumeAnalysisResult } from "@/types/resume";
import { detectServiceCompanyEmployer } from "./service-company";

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

  const hasServiceCompany = resumeText ? detectServiceCompanyEmployer(resumeText) : false;

  const yoe = yearsExperience ?? null;
  const seniorityLabel = yoe == null ? "unknown" : yoe >= 10 ? "Staff/Principal" : yoe >= 7 ? "Senior" : yoe >= 4 ? "Mid-level" : "Junior";

  const techYears = analysis.techYears ?? {};
  const techYearsLines = Object.entries(techYears)
    .sort(([, a], [, b]) => b - a)
    .map(([tech, yrs]) => `  ${tech}: ${yrs}yr`)
    .join("\n");

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

Your job is to identify gaps between this candidate's actual demonstrated abilities and what their target role requires — calibrated against their real evidence, experience level, and target company type. NOT a generic gap list. Every gap must reference the candidate's actual background.

TARGET ROLE: ${roleLabel} at a top product company
${companyTypeContext}
CANDIDATE PROFILE:
- Current role: ${currentRole ?? "unknown"}
- Years of experience: ${yoe != null ? `${yoe} years (${seniorityLabel})` : "unknown"}
- Overall resume score: ${analysis.overallScore}/100
- Skills with project evidence: ${analysis.skillsFound.join(", ")}
- STAR stories count: ${analysis.starStoriesCount}
- Impact evidence score: ${analysis.impactScore}/100
- Project complexity score: ${analysis.projectComplexity}/100
${hasServiceCompany ? "- ⚠️ SERVICE COMPANY BACKGROUND: Delivery/outsourcing patterns detected. Product ownership and impact storytelling are near-certain gaps.\n" : ""}
TECHNOLOGY DEPTH (years of hands-on experience per technology):
${techYearsLines || "  Not available"}
${signalSection}${seniorityCalibration}
${roleRequirements}

RESUME TEXT (full content — reference this when describing gaps):
${resumeText ?? "Not available"}

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
   - "build": knows it conceptually but no shipped project evidence → build something
   - "document": has the work/experience but it's not written, tracked, or visible → write it up
   - "reframe": has the skill AND the work, but it's framed as task-taker not as owner → rewrite bullets/stories
6. interviewQuestion: write the EXACT question a ${roleLabel} interviewer asks that this candidate would currently stumble on. Be specific. e.g. "Walk me through how you'd design a system that handles 1M requests/second with < 100ms p99 latency" not "describe a challenge"
7. Gap descriptions must reference actual candidate content from the resume — e.g. "Despite ${yoe ?? "X"} years of Java, system design stories at scale are absent"
8. totalGapScore reflects reality — a senior with deep tech skills but weak impact stories should score 55–70, not 25

Return JSON matching this exact schema:
{
  "skillGaps": [
    {
      "id": "<8-char alphanumeric id>",
      "label": "<skill name>",
      "description": "<why this matters for ${roleLabel} AND what signal is missing — reference resume content>",
      "severity": "<critical|major|minor>",
      "estimatedHours": <realistic hours from current signal level to working proficiency>,
      "impactIfIgnored": "<one sentence: exactly what happens in their next interview if they skip this>",
      "fixStrategy": "<learn|build|document|reframe>",
      "interviewQuestion": "<the exact question they'd stumble on without fixing this gap>",
      "resourceLinks": [],
      "resolved": false
    }
  ],
  "projectGaps": [
    {
      "id": "<8-char alphanumeric id>",
      "label": "<project type>",
      "description": "<what building this signals to a ${roleLabel} hiring manager — specific credibility gap>",
      "severity": "<critical|major|minor>",
      "estimatedHours": <hours to build a credible, shippable version>,
      "impactIfIgnored": "<one sentence: what a recruiter thinks when they see this gap>",
      "fixStrategy": "<learn|build|document|reframe>",
      "interviewQuestion": "<the exact question or portfolio request they'd fail without this>",
      "resourceLinks": [],
      "resolved": false
    }
  ],
  "storyGaps": [
    {
      "id": "<8-char alphanumeric id>",
      "label": "<story type>",
      "description": "<why this story matters in ${roleLabel} interviews — and exactly why theirs is insufficient>",
      "severity": "<critical|major|minor>",
      "estimatedHours": <hours to craft, write, and practice to interview-ready level>,
      "impactIfIgnored": "<one sentence: what happens in the behavioral round without this story>",
      "fixStrategy": "<learn|build|document|reframe>",
      "interviewQuestion": "<the exact behavioral question they'd fail without this story>",
      "resourceLinks": [],
      "resolved": false
    }
  ],
  "totalGapScore": <0-100, higher = closer to role-ready. Base on evidence depth, not keyword coverage.>,
  "summary": "<2-3 sentences: honest current standing, the single biggest gap to close first, and the one action that would most move the needle>"
}

totalGapScore calibration:
- 80-100: Mostly ready — polish and practice needed
- 60-79: Strong foundation, 2-3 concrete gaps to close in 4-8 weeks
- 40-59: Significant gaps, 2-3 months of real project work required
- 20-39: Service company background with major product ownership gaps
- 0-19: Very early stage — foundational gaps across all dimensions

Return ONLY valid JSON. No markdown fences.`;
}
