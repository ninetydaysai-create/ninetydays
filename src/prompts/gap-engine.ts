import { TargetRole } from "@prisma/client";
import { ResumeAnalysisResult } from "@/types/resume";

export function buildGapEnginePrompt(
  analysis: ResumeAnalysisResult,
  targetRole: TargetRole,
  benchmark: {
    requiredSkills: string[];
    requiredProjects: string[];
    requiredStories: string[];
  },
  resumeText?: string,
  yearsExperience?: number,
  currentRole?: string,
  targetCompanyType?: string,
): string {
  const roleLabel = targetRole.replace(/_/g, " ");

  // Build signal depth section from signalDepthMap if available
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

  const hasServiceCompany = resumeText
    ? /tcs|infosys|wipro|accenture|cognizant|capgemini|hcl|tech mahindra/i.test(resumeText)
    : false;

  const yoe = yearsExperience ?? null;
  const seniorityLabel = yoe == null ? "unknown" : yoe >= 10 ? "Staff/Principal" : yoe >= 7 ? "Senior" : yoe >= 4 ? "Mid-level" : "Junior";

  // Build techYears context — show what's actually strong vs absent
  const techYears = analysis.techYears ?? {};
  const techYearsLines = Object.entries(techYears)
    .sort(([, a], [, b]) => b - a)
    .map(([tech, yrs]) => `  ${tech}: ${yrs}yr`)
    .join("\n");

  const companyTypeContext = !targetCompanyType ? "" : targetCompanyType === "faang"
    ? `\nTARGET COMPANY TYPE: FAANG / Big Tech
- DS&A gaps are CRITICAL — LeetCode Hard is the bar
- System design at scale (>10M users) gaps are CRITICAL
- Behavioral stories using Amazon/Google leadership principles are CRITICAL
- Product ownership patterns matter but less than algorithmic depth at this company type\n`
    : targetCompanyType === "funded_startup"
    ? `\nTARGET COMPANY TYPE: Series B+ Funded Startup
- Shipping speed and end-to-end ownership are MORE important than algorithmic depth
- DS&A gaps are MINOR unless the role requires it — focus on product and architecture
- "Can they build and ship?" is the primary screen — portfolio gaps are CRITICAL
- Behavioral stories about ownership, driving outcomes, and moving fast are CRITICAL\n`
    : `\nTARGET COMPANY TYPE: Any Product Company (balanced)
- Balance between DS&A readiness and product ownership signals
- Both coding skills and "product sense" stories matter equally\n`;

  const seniorityCalibration = yoe == null ? "" : yoe >= 7
    ? `\nSENIORITY CALIBRATION — ${yoe} years experience (${seniorityLabel}):
- NEVER flag skills from the techYears list with ≥2 years as a gap — these are established competencies
- NEVER flag microservices, cloud, message queues, CI/CD, Docker as critical for ${yoe}-year engineers — assumed
- DO flag: lack of system design at scale stories, no cross-team/org-wide impact evidence, no 0-to-1 ownership examples, weak leadership narrative
- DO flag: if impact scores and quantified achievements are thin despite experience — this is the #1 senior rejection cause
- totalGapScore for strong ${seniorityLabel} profiles: 55–80. Below 45 only if ownership + impact evidence is genuinely absent across all dimensions\n`
    : yoe >= 4
    ? `\nSENIORITY CALIBRATION — ${yoe} years experience (${seniorityLabel}):
- NEVER flag skills in skillsFound or with ≥2 years in techYears as critical — they know these
- Focus on: are impact stories strong enough? Is product ownership evident? Is system design breadth there?
- totalGapScore 45–70 is typical for mid-level profiles\n`
    : `\nSENIORITY CALIBRATION — ${yoe} years experience (Junior):
- Foundational technical gaps are valid at this level — be thorough
- totalGapScore 25–55 is typical for junior profiles\n`;

  return `You are a senior career advisor who has helped 500+ engineers land roles at product companies like Google, Stripe, Notion, and Series B/C startups.

Your job is to identify gaps between this candidate's actual demonstrated abilities and what their target role requires — calibrated against their real evidence, experience level, and target company type. NOT a generic gap list.

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
WHAT ${roleLabel.toUpperCase()} ROLES ACTUALLY REQUIRE:
- Required skills: ${benchmark.requiredSkills.join(", ")}
- Required project types: ${benchmark.requiredProjects.join(", ")}
- Required career stories: ${benchmark.requiredStories.join(", ")}

CALIBRATION RULES — follow exactly:
1. NEVER flag a skill with ≥2 years in techYears or appearing in skillsFound as CRITICAL — evidence exists
2. NEVER flag foundational skills (microservices, REST APIs, Docker, cloud basics) for engineers with ≥7 years experience
3. Signal depth rules:
   - ABSENT (not in signalDepthMap AND not in skillsFound AND 0 years in techYears) → CRITICAL
   - WEAK (mentioned but no project evidence) → MAJOR
   - MODERATE (some evidence, not production-depth) → MAJOR or MINOR
   - STRONG → skip entirely, not a gap
4. Gap descriptions must reference the candidate's actual background — e.g. "Despite X years of Java, system design stories at scale are absent"
5. Story gaps: only flag stories that would genuinely fail in a ${roleLabel} behavioral interview
6. totalGapScore reflects reality — a senior with deep tech skills but weak impact stories should score 55–70, not 25

Return JSON matching this exact schema:
{
  "skillGaps": [
    {
      "id": "<8-char alphanumeric id>",
      "label": "<skill name>",
      "description": "<why this matters for ${roleLabel} AND what signal is missing — reference signal depth>",
      "severity": "<critical|major|minor>",
      "estimatedHours": <realistic hours to reach working proficiency from current signal level>,
      "impactIfIgnored": "<one sentence: exactly what happens in their next interview if they skip this — e.g. 'This profile will not survive the system design round at Google, Stripe, or any Series B+ company until this is addressed.'>",
      "resourceLinks": [],
      "resolved": false
    }
  ],
  "projectGaps": [
    {
      "id": "<8-char alphanumeric id>",
      "label": "<project type>",
      "description": "<what building this signals to a ${roleLabel} hiring manager — be specific about the credibility gap>",
      "severity": "<critical|major|minor>",
      "estimatedHours": <hours to build a credible, shippable version>,
      "impactIfIgnored": "<one sentence: exactly what a recruiter/interviewer thinks when they see this gap on your resume — e.g. 'Recruiters see no real product work and assume delivery-only background — you get screened out before the first call.'>",
      "resourceLinks": [],
      "resolved": false
    }
  ],
  "storyGaps": [
    {
      "id": "<8-char alphanumeric id>",
      "label": "<story type>",
      "description": "<why this story matters in ${roleLabel} interviews — and exactly why theirs is insufficient or missing>",
      "severity": "<critical|major|minor>",
      "estimatedHours": <hours to craft, write, and practice this story to interview-ready level>,
      "impactIfIgnored": "<one sentence: what happens in the behavioral round without this story — e.g. 'You will stall when asked about ownership or initiative and the interviewer will flag you as a task-taker, not a builder.'>",
      "resourceLinks": [],
      "resolved": false
    }
  ],
  "totalGapScore": <0-100, higher = closer to role-ready. Base on evidence depth, not keyword coverage.>,
  "summary": "<2-3 sentences: honest current standing, the single biggest gap to close first, and the one thing that would most move the needle>"
}

totalGapScore calibration:
- 80-100: Mostly ready — polish and practice needed
- 60-79: Strong foundation, 2-3 concrete gaps to close in 4-8 weeks
- 40-59: Significant gaps, 2-3 months of real project work required
- 20-39: Service company background with major product ownership gaps
- 0-19: Very early stage — foundational gaps across all dimensions

Return ONLY valid JSON. No markdown fences.`;
}
