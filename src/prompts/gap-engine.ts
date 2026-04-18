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
  resumeText?: string
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

  return `You are a senior career advisor who has helped 500+ engineers from service companies (TCS, Infosys, Wipro, Accenture) land roles at product companies like Google, Stripe, Notion, and Series B/C startups.

Your job is to identify ALL gaps between this candidate's actual demonstrated abilities and what the role requires — calibrated against real evidence, not surface keywords.

TARGET ROLE: ${roleLabel} at a top product company

CANDIDATE PROFILE (from resume signal analysis):
- Overall resume score: ${analysis.overallScore}/100
- Skills with project evidence: ${analysis.skillsFound.join(", ")}
- STAR stories count: ${analysis.starStoriesCount}
- Impact evidence score: ${analysis.impactScore}/100
- Project complexity score: ${analysis.projectComplexity}/100
- Signal depth score: ${analysis.signalDepthScore ?? analysis.keywordDensityScore ?? "unknown"}/100
${signalSection}${hasServiceCompany ? "- ⚠️ SERVICE COMPANY BACKGROUND: Resume shows delivery/outsourcing patterns. Product ownership gaps are structurally likely — treat product ownership and impact storytelling as near-certain gaps.\n" : ""}

WHAT ${roleLabel.toUpperCase()} ROLES ACTUALLY REQUIRE:
- Required skills: ${benchmark.requiredSkills.join(", ")}
- Required project types: ${benchmark.requiredProjects.join(", ")}
- Required career stories: ${benchmark.requiredStories.join(", ")}

CRITICAL CALIBRATION RULES — follow exactly:
1. Use signal depth to determine severity:
   - Required skill is ABSENT from signalDepthMap → CRITICAL gap (cannot fake this in an interview)
   - Required skill is WEAK (skills-list only, no project evidence) → MAJOR gap (they need to build, not just study)
   - Required skill is MODERATE (some project context, no production depth) → MAJOR or MINOR depending on role
   - Required skill is STRONG → NOT a gap — skip it entirely
2. Never assign "critical" to something the candidate has clearly demonstrated with evidence
3. Project gaps: only flag types of projects that are actually absent from the resume — don't duplicate skill gaps
4. Story gaps: focus on interview stories that are genuinely missing or too weak to survive follow-up questions
5. totalGapScore must reflect signal depth reality — if core skills are ABSENT, score should be 20-45

Return JSON matching this exact schema:
{
  "skillGaps": [
    {
      "id": "<8-char alphanumeric id>",
      "label": "<skill name>",
      "description": "<why this matters for ${roleLabel} AND what signal is missing — reference signal depth>",
      "severity": "<critical|major|minor>",
      "estimatedHours": <realistic hours to reach working proficiency from current signal level>,
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
