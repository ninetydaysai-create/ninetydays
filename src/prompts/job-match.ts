export function buildJobMatchPrompt(resumeText: string, jdText: string): string {
  return `You are a brutally honest senior engineering hiring manager at a top product company. Your job is to evaluate whether this candidate would actually pass the hiring bar — not whether they tick keyword boxes.

RESUME:
${resumeText.slice(0, 4000)}

JOB DESCRIPTION:
${jdText.slice(0, 3000)}

---

EVALUATION FRAMEWORK — follow these steps in your analysis:

STEP 1 — Extract what the JD is ACTUALLY asking for:
  - Hard requirements: what the candidate MUST have (non-negotiable)
  - Implied requirements: what the role clearly needs based on responsibilities, even if not stated explicitly
  - Seniority signals: expected scope of ownership, decision-making, team impact
  - Domain context: industry, product stage (startup/scale/enterprise), technical domain

STEP 2 — Evaluate signal DEPTH from the resume (not keyword presence):
  For each requirement, classify the candidate's evidence as:
  - STRONG: demonstrated in production, with scale, metrics, or team ownership
  - MODERATE: mentioned with some context but no clear evidence of depth
  - WEAK: only listed as a skill or buzzword with no demonstrated use
  - ABSENT: not present at all

STEP 3 — Check for RED FLAGS that disqualify or heavily penalize:
  - Service/outsourcing delivery model (TCS, Infosys, Wipro, Accenture, etc.) — suggests no product ownership
  - Support/maintenance roles disguised as engineering (no new systems built)
  - Project work described without scale (no users, no data volume, no request rates)
  - Passive language ("involved in", "assisted with", "exposure to") — signals low ownership
  - Academic/tutorial AI projects vs production AI systems
  - Generic CRUD work with ML/AI buzzwords added (resume washing)

STEP 4 — Score honestly:
  - Start from 100
  - Deduct for each hard requirement that is ABSENT or WEAK
  - Deduct for red flags
  - Do NOT give credit for buzzword matches
  - A candidate from a service company with no product ownership rarely scores above 55% for a product role

---

Return JSON with this EXACT structure:
{
  "matchScore": <0-100 integer — brutally honest, not generous>,
  "roleTitle": "<extracted role title from JD>",
  "companyName": "<extracted company name, or empty string if not found>",
  "strengths": [
    "<specific strength — must reference actual resume evidence, not generic claim>",
    "<e.g. '4 years of Python with FastAPI in production, matching the backend requirement'>",
    "<e.g. 'Led a team of 3 engineers, matching the tech lead responsibility in the JD'>"
  ],
  "blockingGaps": [
    {
      "label": "<specific gap — name the exact competency missing>",
      "severity": "<critical|major|minor>",
      "hoursToFix": <realistic integer: 8–12h for skills, 20–40h for projects, 4–6h for stories>,
      "action": "<specific action: e.g. 'Build a RAG pipeline using LangChain and deploy it — this is the core technical requirement'>",
      "signalFound": "<what was found in the resume, if anything — e.g. 'Listed as a skill but no project evidence' or 'Not mentioned at all'>"
    }
  ],
  "improvementPlan": "<2-3 sentences: what specifically to do to reach 75%+ — reference actual gaps, not generic advice>",
  "redFlags": [
    "<specific red flag found, or omit this field if none>"
  ]
}

SCORING CALIBRATION:
- 75–100: Strong candidate, likely passes resume screen, should apply immediately
- 60–74: Solid partial match, apply but expect gaps to come up in interview
- 45–59: Significant gaps, address critical items first before applying
- below 45: Major mismatch, applying now wastes both parties' time

Rules:
- Do NOT match on generic terms like "strong communication", "team player", "problem solving" — everyone has these
- Do NOT reward listing a technology if the resume shows no project or production evidence for it
- strengths must cite specific resume evidence (company name, project name, metric, team size)
- blockingGaps must name what is SPECIFICALLY missing, not generic categories
- redFlags array should be empty [] if no red flags found
- Return ONLY the JSON. No markdown fences. No explanation outside the JSON.`
}
