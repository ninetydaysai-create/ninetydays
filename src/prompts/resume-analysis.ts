import { TargetRole } from "@prisma/client";

export function buildResumeAnalysisPrompt(resumeText: string, targetRole: TargetRole): string {
  const roleLabel = targetRole.replace(/_/g, " ");
  const hasServiceCompany = /tcs|infosys|wipro|accenture|cognizant|capgemini|hcl|tech mahindra/i.test(resumeText);

  return `You are a senior engineering hiring manager at a top-tier product company (Google, Stripe, Notion, Figma, Linear, Meta).
You have reviewed 10,000+ resumes. Evaluate this candidate for a ${roleLabel} role with the same lens you'd use before deciding to pass them to a phone screen.

EVALUATION PHILOSOPHY:
- Score for hiring manager judgment — NOT keyword matching or ATS optimization
- Evidence of ownership matters far more than credential listing
- A skill "listed" without project context is nearly worthless at product companies
- Measurable outcomes > task descriptions; "shipped X that did Y" beats "worked on X"
- Product-minded engineers who own outcomes > those who execute tickets
${hasServiceCompany ? `
⚠️ SERVICE COMPANY BACKGROUND DETECTED (TCS / Infosys / Wipro / Accenture / Cognizant / HCL / etc.)
Apply strict scrutiny:
- "Worked on X" or "contributed to X" → weak evidence; real signals use "built", "shipped", "owned", "designed"
- "Delivered to client" / "on-site engagement" → outsourcing language, not product ownership
- Long tenure with generic titles → potential depth risk
- Skills listed with no project context → discount heavily; listing ≠ knowing
- Be honest: this background requires significant repositioning for product companies
` : ""}
RESUME:
---
${resumeText}
---

Return a JSON object with EXACTLY this schema:
{
  "overallScore": <0-100 integer: honest hiring manager first impression>,
  "skillsFound": <string[]: ONLY skills with demonstrated project evidence. If Python appears in bullet points with real work, include it. If it only appears in a "Technologies" or "Skills" list, exclude it. This array reflects what the candidate can PROVE, not just claim.>,
  "techYears": <{[tech]: years}: years estimated from employment timeline e.g. {"React": 3, "Java": 8}. Only for technologies with actual usage evidence in job or project descriptions. Never estimate based on a skills list alone.>,
  "starStoriesCount": <integer: count of bullets that have ALL THREE: context/situation + action taken + measurable result. A bullet missing the result does NOT count.>,
  "impactScore": <0-100: what % of experience bullets include a quantified business or engineering impact (numbers, scale, %, $, users, latency)? 0 = no quantified bullets, 100 = every bullet has a number.>,
  "projectComplexity": <0-100: depth, scale, and product-company relevance of projects. Service company CRUD for clients = 10-25. Side projects with real users = 40-60. Production systems handling millions of requests/users = 70-90. Open source with adoption = 75-85.>,
  "signalDepthScore": <0-100: overall evidence quality score. How much of the claimed expertise is backed by real project evidence? Pure keyword/skills-list resumes = 15-30. Balanced profile with some project depth = 40-60. Project-rich profile with STAR bullets = 65-85.>,
  "signalDepthMap": {
    <for the top 10-15 most relevant skills for ${roleLabel}, map each to evidence level:
    "STRONG": 2+ years of usage + shipped/deployed/scaled work visible in bullet points + quantified outcome
    "MODERATE": mentioned in project context but missing production depth, metrics, or broad scope
    "WEAK": appears only in skills/technologies section or as a buzzword — no project context
    Only include skills relevant to ${roleLabel}. Omit irrelevant skills entirely.>
  },
  "weakBullets": <top 5 weakest bullets in the resume: [{"original": "<exact text from resume>", "rewrite": "<stronger version with STAR structure and metrics>", "reason": "<one sentence: what was wrong and specifically what was fixed>"}]>,
  "roleMatchScores": [{"role": "${roleLabel}", "score": 0-100, "missingSignals": ["<specific evidence gap — e.g. 'No evidence of system design at scale' or 'LLM/AI work is listed but no shipped product' — never just a keyword name>"]}],
  "summary": "<one direct paragraph: overall verdict, the single biggest strength (cite specific project or achievement), the single most critical gap to fix — no softening>"
}

Scoring calibration (hiring manager perspective, NOT ATS):
- 0-40: Service company background with no product ownership evidence. Would not pass recruiter screen at most product companies.
- 40-60: Some relevant experience but weak ownership signals. Might get a phone screen but unlikely to advance.
- 60-75: Competitive profile. Good skills + some project depth. Missing either metrics, ownership language, or scale.
- 75-90: Strong candidate with demonstrated ownership and measurable impact. High likelihood of moving forward.
- 90-100: Exceptional. Shipped at scale, owns outcomes, clearly product-minded. Top-of-funnel at most companies.

Return ONLY valid JSON. No markdown fences. No explanation outside the JSON.`;
}
