export interface TranscriptMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface QuestionScore {
  questionNumber: number;
  question: string;
  userAnswer: string;
  score: number; // 0–10
  feedback: string;
  idealAnswer: string;
}

export interface InterviewScorecard {
  overallScore: number; // 0–100
  strengths: string[];
  improvements: string[];
  questionScores: QuestionScore[];
  verdict: string; // "Strong Hire" | "Hire" | "No Hire" | "Strong No Hire"
}
