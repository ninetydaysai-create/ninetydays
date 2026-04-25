"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Trophy, TrendingUp, AlertCircle, CheckCircle2, Loader2, Mic, MicOff, Square } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface QuestionScore {
  questionNumber: number;
  question: string;
  score: number;
  feedback: string;
  idealAnswer: string;
}

interface Scorecard {
  overallScore: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  questionScores: QuestionScore[];
}

export default function InterviewSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [done, setDone] = useState(false);
  const [userAnswers, setUserAnswers] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Voice recording
  type RecordingState = "idle" | "recording" | "transcribing";
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const MAX_RECORDING_SECS = 90;

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  async function startRecording() {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Pick a supported MIME type — webm is best supported across browsers
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };

      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" });
        setRecordingState("transcribing");
        try {
          const fd = new FormData();
          fd.append("audio", blob, "recording.webm");
          const res = await fetch("/api/interview/transcribe", { method: "POST", body: fd });
          if (res.ok) {
            const { text } = await res.json();
            setInput((prev) => prev ? `${prev} ${text}` : text);
          } else {
            setMicError("Transcription failed — please type your answer.");
          }
        } catch {
          setMicError("Transcription failed — please type your answer.");
        } finally {
          setRecordingState("idle");
          setRecordingSeconds(0);
        }
      };

      mr.start(250); // collect data every 250ms
      setRecordingState("recording");
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => {
          if (s + 1 >= MAX_RECORDING_SECS) { stopRecording(); return 0; }
          return s + 1;
        });
      }, 1000);
    } catch {
      setMicError("Microphone access denied. Please allow mic access and try again.");
    }
  }

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // On mount: load existing transcript from DB
  useEffect(() => {
    async function loadSession() {
      const res = await fetch(`/api/interview/session/${sessionId}`);
      if (!res.ok) { router.push("/interview"); return; }
      const data = await res.json();
      if (data.transcript?.length) {
        setMessages(data.transcript.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })));
        const uAnswers = data.transcript.filter((m: { role: string }) => m.role === "user").length;
        setUserAnswers(uAnswers);
        if (data.status === "complete") {
          setDone(true);
          if (data.scorecard) setScorecard(data.scorecard as Scorecard);
          else await evaluate();
        }
      } else {
        // Fresh session — get opening question
        await getOpeningQuestion();
      }
    }
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function getOpeningQuestion() {
    setStreaming(true);
    setMessages([]);

    const res = await fetch(`/api/interview/session/${sessionId}/opening`);
    if (!res.ok || !res.body) { setStreaming(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = "";

    setMessages([{ role: "assistant", content: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      setMessages([{ role: "assistant", content: text }]);
    }
    setStreaming(false);
  }

  async function sendMessage() {
    if (!input.trim() || streaming || evaluating) return;

    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setUserAnswers((n) => n + 1);
    setStreaming(true);

    const res = await fetch("/api/interview/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message: userMsg }),
    });

    if (!res.ok || !res.body) { setStreaming(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let aiText = "";

    setMessages([...newMessages, { role: "assistant", content: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      aiText += decoder.decode(value, { stream: true });
      setMessages([...newMessages, { role: "assistant", content: aiText }]);
    }

    setStreaming(false);

    // Check if interview concluded
    const isConclusion =
      aiText.toLowerCase().includes("concludes our interview") ||
      aiText.toLowerCase().includes("that's all the questions") ||
      userAnswers + 1 >= 5;

    if (isConclusion) {
      setDone(true);
      await evaluate();
    }
  }

  async function evaluate() {
    setEvaluating(true);
    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        const data = await res.json();
        setScorecard(data.scorecard as Scorecard);
      }
    } finally {
      setEvaluating(false);
    }
  }

  function verdictColor(verdict: string) {
    if (verdict === "Strong Hire") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (verdict === "Hire") return "bg-green-100 text-green-800 border-green-200";
    if (verdict === "No Hire") return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  }

  function scoreColor(score: number) {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100dvh-6rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <Link href="/interview">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Mock Interview</h1>
          <p className="text-sm text-muted-foreground">
            Answer naturally. Take your time. {done ? "Interview complete." : `Question ${Math.min(userAnswers + 1, 5)} of 5`}
          </p>
        </div>
        {done && !scorecard && evaluating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Evaluating...
          </div>
        )}
      </div>

      {/* Scorecard */}
      {scorecard && (
        <div className="mb-6 space-y-4 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Overall Score</p>
                <div className={cn("text-5xl font-bold", scoreColor(scorecard.overallScore))}>
                  {scorecard.overallScore}
                  <span className="text-2xl text-slate-500 font-normal">/100</span>
                </div>
              </div>
              <div className={cn("border rounded-lg px-4 py-2 font-semibold text-sm", verdictColor(scorecard.verdict))}>
                {scorecard.verdict}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Strengths
                </p>
                <ul className="space-y-1">
                  {scorecard.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Improvements
                </p>
                <ul className="space-y-1">
                  {scorecard.improvements.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {scorecard.questionScores.map((qs) => (
            <div key={qs.questionNumber} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-sm font-medium text-slate-900">Q{qs.questionNumber}: {qs.question}</p>
                <Badge variant={qs.score >= 7 ? "default" : qs.score >= 5 ? "secondary" : "destructive"}>
                  {qs.score}/10
                </Badge>
              </div>
              <p className="text-sm text-slate-700 mb-3">{qs.feedback}</p>
              <div className="rounded-md bg-emerald-50 border border-emerald-100 p-3">
                <p className="text-xs font-medium text-emerald-800 mb-1">Ideal answer would include:</p>
                <p className="text-xs text-emerald-700">{qs.idealAnswer}</p>
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <Link href="/interview" className="flex-1">
              <Button variant="outline" className="w-full">Back to Interview Prep</Button>
            </Link>
            <Button className="flex-1 gap-2" onClick={() => router.push("/interview")}>
              <Trophy className="h-4 w-4" />
              Start new session
            </Button>
          </div>
        </div>
      )}

      {/* Chat */}
      {!scorecard && (
        <>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  {msg.content || (streaming && i === messages.length - 1 ? (
                    <span className="flex gap-1 items-center h-5">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                    </span>
                  ) : "")}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!done && (
            <div className="shrink-0 pt-4 border-t">
              {/* Recording indicator */}
              {recordingState === "recording" && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <span className="text-sm font-medium text-red-400">
                    Recording — {recordingSeconds}s / {MAX_RECORDING_SECS}s
                  </span>
                  <div className="flex-1 bg-white/10 rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${(recordingSeconds / MAX_RECORDING_SECS) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {recordingState === "transcribing" && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400 shrink-0" />
                  <span className="text-sm text-indigo-400">Transcribing your answer…</span>
                </div>
              )}
              {micError && (
                <p className="text-xs text-red-400 mb-2 px-1">{micError}</p>
              )}
              <div className="flex gap-2 items-end">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={
                    recordingState === "transcribing"
                      ? "Transcribing your voice answer…"
                      : "Type your answer, or tap the mic to speak…"
                  }
                  className="min-h-[56px] md:min-h-[80px] max-h-[140px] md:max-h-[200px] resize-none text-base"
                  disabled={streaming || evaluating || recordingState !== "idle"}
                />
                <div className="flex flex-col gap-2 shrink-0">
                  {/* Mic button */}
                  <Button
                    type="button"
                    variant={recordingState === "recording" ? "destructive" : "outline"}
                    className={cn(
                      "h-[40px] w-12",
                      recordingState === "transcribing" && "opacity-50 pointer-events-none"
                    )}
                    onClick={recordingState === "recording" ? stopRecording : startRecording}
                    disabled={streaming || evaluating || recordingState === "transcribing"}
                    title={recordingState === "recording" ? "Stop recording" : "Record your answer (90s max)"}
                  >
                    {recordingState === "recording"
                      ? <Square className="h-3.5 w-3.5 fill-current" />
                      : recordingState === "transcribing"
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Mic className="h-4 w-4" />}
                  </Button>
                  {/* Send button */}
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || streaming || evaluating || recordingState !== "idle"}
                    className="h-[40px] w-12 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <Mic className="h-3 w-3 inline mr-1" />Tap mic to answer out loud · Enter to send
              </p>
            </div>
          )}

          {done && !scorecard && evaluating && (
            <div className="shrink-0 pt-4 border-t text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
              <p className="font-medium">Evaluating your interview...</p>
              <p className="text-sm text-muted-foreground mt-1">This takes about 10 seconds</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
