import { TargetRole, InterviewType } from "@prisma/client";
import { TranscriptMessage } from "@/types/interview";
import { COMPANY_MAP } from "@/lib/companies";

export function buildInterviewSystemPrompt(
  role: TargetRole,
  type: InterviewType,
  companyName?: string
): string {
  const roleLabel = role.replace(/_/g, " ");
  const typeLabel = type.replace(/_/g, " ");

  const companyBlock = buildCompanyBlock(companyName);

  return `You are a senior interviewer at a top product company conducting a ${typeLabel} interview for a ${roleLabel} position.

Your style:
- Professional but direct — you do not waste words
- Ask one question at a time
- Follow up on vague answers: "Can you be more specific?", "What was the actual impact?", "Who else was involved and what was your specific role?"
- Do NOT give hints, reassurance, or positive affirmation mid-interview — stay neutral and probing
- After a complete answer, either ask a targeted follow-up OR move to the next question
- After 5 questions total (including follow-ups), say EXACTLY: "Thank you, that concludes our interview. I'll send you the evaluation shortly."

Interview focus for ${typeLabel}:
${getInterviewFocus(type, role)}
${companyBlock}
Start by introducing yourself briefly (one sentence) and immediately asking the first question.`;
}

interface CandidateContext {
  signalDepthMap?: Record<string, string>;      // from resume analysis
  skillsFound?: string[];                       // skills with project evidence
  resumeSummary?: string;                       // one-paragraph verdict from analyzer
  criticalGaps?: string[];                      // labels of critical skill gaps
  majorGaps?: string[];                         // labels of major skill gaps
  storyGaps?: string[];                         // interview story gaps
}

export function buildInterviewEvaluationPrompt(
  transcript: TranscriptMessage[],
  role: TargetRole,
  type: InterviewType,
  candidateContext?: CandidateContext
): string {
  const roleLabel = role.replace(/_/g, " ");
  const typeLabel = type.replace(/_/g, " ");

  const transcriptText = transcript
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const rubric = getEvaluationRubric(type, role);

  // Build candidate context block for cross-reference evaluation
  let contextBlock = "";
  if (candidateContext) {
    const parts: string[] = [];

    if (candidateContext.resumeSummary) {
      parts.push(`Resume assessment: ${candidateContext.resumeSummary}`);
    }

    if (candidateContext.signalDepthMap && Object.keys(candidateContext.signalDepthMap).length > 0) {
      const strong = Object.entries(candidateContext.signalDepthMap)
        .filter(([, d]) => d === "STRONG").map(([s]) => s);
      const weak = Object.entries(candidateContext.signalDepthMap)
        .filter(([, d]) => d === "WEAK").map(([s]) => s);
      if (strong.length > 0) parts.push(`Skills with STRONG resume evidence: ${strong.join(", ")}`);
      if (weak.length > 0) parts.push(`Skills listed but NO project evidence (WEAK signal): ${weak.join(", ")}`);
    }

    if (candidateContext.criticalGaps?.length) {
      parts.push(`Known CRITICAL gaps (from gap analysis): ${candidateContext.criticalGaps.join(", ")}`);
    }
    if (candidateContext.majorGaps?.length) {
      parts.push(`Known MAJOR gaps: ${candidateContext.majorGaps.join(", ")}`);
    }
    if (candidateContext.storyGaps?.length) {
      parts.push(`Story gaps flagged before interview: ${candidateContext.storyGaps.join(", ")}`);
    }

    if (parts.length > 0) {
      contextBlock = `\nCANDIDATE BACKGROUND (from resume analysis and gap report):
${parts.map((p) => `- ${p}`).join("\n")}

CROSS-REFERENCE INSTRUCTIONS:
- If the candidate claims expertise in a WEAK-signal skill, probe that claim in your feedback — does the interview answer actually reveal depth or is it surface-level?
- If the candidate demonstrates something that contradicts their gap report (positively or negatively), call it out specifically in strengths/improvements
- If a known critical gap was directly tested and the candidate answered poorly, mark it explicitly in improvements
- If story gaps were known before the interview and the candidate still delivered a weak story, note it
\n`;
    }
  }

  return `You are evaluating a ${typeLabel} interview for a ${roleLabel} position at a product company.
Apply the same bar that top product companies use — be calibrated and honest. Most candidates do NOT pass.
${contextBlock}
TRANSCRIPT:
---
${transcriptText}
---

EVALUATION RUBRIC FOR ${typeLabel.toUpperCase()} / ${roleLabel.toUpperCase()}:
${rubric}

Score and return JSON:
{
  "overallScore": <0-100: calibrated to real product company bar — see scoring guide below>,
  "verdict": "<Strong Hire|Hire|No Hire|Strong No Hire>",
  "strengths": ["<specific strength observed in the transcript — cite actual content, not generic praise>", "<strength 2>", "<strength 3>"],
  "improvements": ["<specific gap with example from transcript — cite what was said and what was missing>", "<gap 2>", "<gap 3>"],
  "questionScores": [
    {
      "questionNumber": 1,
      "question": "<exact question the interviewer asked>",
      "userAnswer": "<2-3 sentence summary of what the candidate actually said>",
      "score": <0-10: see per-question rubric>,
      "feedback": "<specific feedback: what worked, what was vague, what follow-up they failed to answer well>",
      "idealAnswer": "<what a strong answer would have included — specific, not generic>"
    }
  ]
}

Overall scoring (product company bar):
- 90-100: Exceptional — would pass bar-raiser at top companies. Clear ownership, specific metrics, no vague answers.
- 75-89: Strong — likely to pass. Good structure, some specificity, minor gaps in depth.
- 60-74: Average — 50/50. Answers present but lack metrics, depth, or ownership. Might pass a lenient loop.
- 40-59: Weak — unlikely to pass. Missing structure, no metrics, vague ownership claims.
- 0-39: Not ready — fundamental gaps. Answers are generic, no evidence of real experience.

Per-question score guide (0-10):
- 9-10: STAR complete, specific metrics, shows clear ownership, survives follow-up
- 7-8: Good structure, some specificity, minor metric or ownership gap
- 5-6: Partial STAR, vague on impact or action, or relies on team without individual contribution
- 3-4: Generic answer, no metrics, unclear ownership
- 1-2: Off-topic, did not answer the question, or theoretical only

Return ONLY valid JSON.`;
}

function getInterviewFocus(type: InterviewType, role: TargetRole): string {
  const focuses: Record<InterviewType, Record<string, string>> = {
    behavioral: {
      default: "Leadership, conflict resolution, cross-team impact, project ownership, failure + learning stories. Probe for STAR: Situation (brief), Action (detailed — what THEY specifically did), Result (quantified). Push back on vague ownership claims: 'What was YOUR specific contribution vs the team's?'",
      staff_eng: "Technical influence, org-wide impact, mentorship, driving adoption of practices, saying no to bad ideas with impact. Probe for scope: how many teams, what decisions did they influence, what would have broken without them.",
      ai_pm: "Product decisions, cross-functional leadership, AI feature trade-offs, metric definition and ownership. Probe for data: 'What metric did you define?', 'How did you prioritize?', 'What did you kill?'",
    },
    system_design: {
      default: "Scalability, API design, database choices (and why), trade-offs, capacity estimation, failure modes, real-world constraints. Expect the candidate to DRIVE the discussion. Push them: 'How would you handle 10x traffic?', 'What breaks first?', 'Why that database over alternatives?'",
      ml_eng: "ML system design: data pipeline, training infrastructure, serving latency, model versioning, feature store, monitoring/drift detection. Probe: 'How would you detect model degradation in production?', 'How would you A/B test a model change?'",
      staff_eng: "Platform/infrastructure design, tech org architecture, buy vs build decisions, migration strategies, cross-team API contracts. Probe: 'How would you migrate 50M records without downtime?', 'How do you design for future teams you don't know yet?'",
    },
    ml_concepts: {
      default: "ML fundamentals, model selection rationale, evaluation metric choice, overfitting/underfitting diagnosis, deployment concerns, real-world ML system design. Push beyond memorized answers: 'When would you NOT use a neural network?', 'How would you debug a model that works in training but degrades in production?'",
    },
    product_sense: {
      default: "Product thinking, user empathy, metric definition, prioritization frameworks, trade-off reasoning. Probe: 'How would you measure success?', 'Who is this NOT for?', 'If you could only ship one thing, what and why?'",
      ai_pm: "AI product strategy, ethical trade-offs, latency vs accuracy decisions, human-in-the-loop design. Probe: 'What would a 10% drop in accuracy mean for your users?', 'How would you explain this AI decision to a non-technical exec?'",
    },
  };

  const roleKey = role as string;
  const typeMap = focuses[type];
  return typeMap[roleKey] ?? typeMap["default"] ?? focuses[type].default ?? "";
}

function getEvaluationRubric(type: InterviewType, role: TargetRole): string {
  const rubrics: Partial<Record<InterviewType, string>> = {
    behavioral: `
What to evaluate per answer:
1. OWNERSHIP: Did they say "I" or "we"? Follow-ups asked about their specific role?
2. SPECIFICITY: Real project names, team sizes, timelines, not "a large project at my company"
3. IMPACT: Quantified result — %, latency improvement, revenue, user count, error rate
4. REFLECTION: Did they show learning, not just outcome?
5. BREVITY: Did they answer the question or ramble?

Strong signals: "I designed the architecture for...", "My specific contribution was...", "The result was X% improvement in..."
Weak signals: "We worked together to...", "The team shipped...", "It was successful" (no metric)`,

    system_design: `
What to evaluate:
1. SCOPING: Did they clarify requirements and constraints before diving in?
2. ESTIMATION: Rough capacity math — requests/sec, storage, bandwidth
3. COMPONENT SELECTION: Did they choose components with justification, not just name-drop?
4. TRADE-OFF REASONING: Strong candidates compare options explicitly ("I chose Postgres over DynamoDB because...")
5. FAILURE MODES: Did they address what breaks and how to detect/recover?
6. ITERATION: Did they start simple and evolve, or jump to over-engineered solutions?

Strong signals: Clarifying questions first, explicit trade-off comparisons, mentions of CAP theorem implications, latency/throughput estimates
Weak signals: Jumping straight to microservices, name-dropping without justification, no mention of failure handling`,

    ml_concepts: `
What to evaluate:
1. DEPTH: Can they explain WHY, not just WHAT? (Why does L2 regularization work, not just "it prevents overfitting")
2. PRACTICAL AWARENESS: Real production concerns — data drift, inference latency, model versioning
3. TRADE-OFF REASONING: When to use which algorithm, what metric for what business outcome
4. DEBUGGING MINDSET: How do they approach a model that's underperforming?
5. RECENCY: Do they know current best practices (transformers, LLMs, foundation models)?

Strong signals: First-principles reasoning, mentions production gotchas, connects ML decisions to business outcomes
Weak signals: Textbook definitions only, no production context, can't explain why they'd choose one approach`,

    product_sense: `
What to evaluate:
1. USER CLARITY: Did they define the user segment clearly before proposing solutions?
2. METRIC DEFINITION: Did they propose a North Star and guardrail metrics?
3. PRIORITIZATION LOGIC: Is their prioritization framework explicit and defensible?
4. TRADE-OFF AWARENESS: Did they acknowledge what they're giving up with each choice?
5. EDGE CASES: Did they consider failure states, abuse cases, non-ideal users?

Strong signals: "The primary user is X, not Y, because...", "I'd measure success with metric A, and monitor B as a guardrail", "I'd deprioritize C because the opportunity cost is..."
Weak signals: Generic "improve user experience", no metric definition, builds for every user at once`,
  };

  return rubrics[type] ?? "Evaluate based on specificity, depth, ownership, and impact evidence.";
}

function buildCompanyBlock(companyName?: string): string {
  if (!companyName) return "";

  const key = companyName.toLowerCase();
  const profile = COMPANY_MAP[key];

  if (!profile) return "";

  return `
COMPANY CONTEXT — ${profile.name}:
You are conducting this interview as if you work at ${profile.name}. Tailor your questions, follow-ups, and evaluation criteria to how ${profile.name} actually interviews.

What ${profile.name} values culturally:
${profile.cultureValues}

Technical emphasis at ${profile.name}:
${profile.technicalEmphasis}

What makes ${profile.name}'s interviews unique:
${profile.uniquePattern}

Key focus areas: ${profile.interviewFocus.join(", ")}.

When asking questions, draw on real ${profile.name} problem domains. When evaluating answers, score against the bar ${profile.name} actually sets — not a generic industry average.
`;
}
