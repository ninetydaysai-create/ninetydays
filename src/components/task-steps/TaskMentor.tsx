"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

type StepType =
  | "why_it_matters" | "lesson" | "example_gallery"
  | "practice" | "quiz" | "deliverable";

interface QuickAction {
  label: string;
  action: string;
  requiresSubmitted?: boolean;
}

const STEP_QUICK_ACTIONS: Record<StepType, QuickAction[]> = {
  why_it_matters: [
    { label: "Explain again",      action: "explain_again" },
    { label: "Give an analogy",    action: "analogy"       },
    { label: "Interview relevance",action: "interview"     },
  ],
  lesson: [
    { label: "Simplify",           action: "simplify"  },
    { label: "Real example",       action: "example"   },
    { label: "Key takeaway",       action: "takeaway"  },
  ],
  example_gallery: [
    { label: "Why is Excellent better?", action: "compare"  },
    { label: "Another example",         action: "example"  },
    { label: "Common mistakes",         action: "mistakes" },
  ],
  practice: [
    { label: "Give me a hint",     action: "hint"    },
    { label: "Review my answer",   action: "review",  requiresSubmitted: true },
    { label: "How to improve?",    action: "improve", requiresSubmitted: true },
  ],
  quiz: [
    { label: "Explain the concept", action: "explain_again" },
    { label: "Common mistakes",     action: "mistakes"      },
  ],
  deliverable: [
    { label: "Review my draft",    action: "review",   requiresSubmitted: true },
    { label: "How to improve?",    action: "improve",  requiresSubmitted: true },
    { label: "What makes it strong?", action: "criteria" },
  ],
};

const ACTION_DISPLAY: Record<string, string> = {
  explain_again: "Explain this again",
  analogy:       "Give me an analogy",
  interview:     "Interview relevance?",
  simplify:      "Simplify this",
  example:       "Give me an example",
  takeaway:      "What's the key takeaway?",
  compare:       "Why is Excellent better?",
  mistakes:      "Common mistakes?",
  hint:          "Give me a hint",
  review:        "Review my answer",
  improve:       "How can I improve?",
  criteria:      "What makes it strong?",
};

interface Message { role: "user" | "ai"; content: string }

interface Props {
  taskId: string;
  stepType: StepType;
  stepTitle: string;
  hasSubmitted: boolean;  // whether the step has a saved userInput
  userInput: string | null;
}

export function TaskMentor({ taskId, stepType, stepTitle, hasSubmitted, userInput }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function send(action: string, customMessage?: string) {
    if (isLoading) return;

    const displayMsg = customMessage || ACTION_DISPLAY[action] || action;
    const history = messages.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content,
    }));

    setMessages((prev) => [...prev, { role: "user", content: displayMsg }, { role: "ai", content: "" }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/task-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          stepType,
          stepTitle,
          action: customMessage ? "custom" : action,
          customMessage,
          userInput,
          conversationHistory: history,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "ai", content: full };
          return updated;
        });
      }
    } catch {
      // Remove the empty ai message on failure
      setMessages((prev) => prev.slice(0, -2).concat(prev.slice(-2, -1)));
    } finally {
      setIsLoading(false);
    }
  }

  function handleCustomSend() {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput("");
    send("custom", msg);
  }

  const quickActions = STEP_QUICK_ACTIONS[stepType] ?? [];
  const exchangeCount = Math.floor(messages.length / 2);

  return (
    <div className="mt-5 pt-4 border-t border-white/[0.06]">
      {/* Toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-violet-300 transition-colors"
      >
        <Bot className="h-4 w-4 text-violet-400 shrink-0" />
        <span>Ask AI Mentor</span>
        {exchangeCount > 0 && (
          <span className="h-4 min-w-4 px-1 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-black flex items-center justify-center">
            {exchangeCount}
          </span>
        )}
        {isOpen
          ? <ChevronUp className="h-3.5 w-3.5 ml-auto" />
          : <ChevronDown className="h-3.5 w-3.5 ml-auto" />}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {/* Quick action chips */}
          {quickActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quickActions.map((qa) => {
                const disabled = isLoading || (!!qa.requiresSubmitted && !hasSubmitted);
                return (
                  <button
                    key={qa.action}
                    onClick={() => send(qa.action)}
                    disabled={disabled}
                    title={qa.requiresSubmitted && !hasSubmitted ? "Submit your response first" : undefined}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                      bg-white/[0.03] border-white/10 text-slate-300
                      hover:bg-violet-500/10 hover:border-violet-500/20 hover:text-violet-300
                      disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {qa.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Conversation history */}
          {messages.length > 0 && (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <p key={i} className="text-xs text-slate-500 italic text-right">
                    {m.content}
                  </p>
                ) : (
                  <div
                    key={i}
                    className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3"
                  >
                    {m.content ? (
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </p>
                    ) : (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
                    )}
                  </div>
                )
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Free-form input */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCustomSend();
                }
              }}
              placeholder="Ask anything about this step…"
              className="flex-1 min-w-0 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-colors"
            />
            <button
              onClick={handleCustomSend}
              disabled={!input.trim() || isLoading}
              className="h-9 w-9 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-colors"
            >
              {isLoading
                ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                : <Send className="h-3.5 w-3.5 text-white" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
