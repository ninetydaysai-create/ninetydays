"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Loader2, Trash2, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

const STARTERS = [
  "What should I focus on this week?",
  "Am I ready to start applying?",
  "Which gap will hurt me most in interviews?",
  "How do I fix my resume bullets?",
  "What project should I build first?",
];

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    fetch("/api/mentor/history")
      .then((r) => r.json())
      .then((d) => {
        if (d.messages?.length > 0) {
          setMessages(d.messages.map((m: Message & { id: string }) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: m.createdAt,
          })));
        }
      })
      .finally(() => setHistoryLoading(false));
  }, []);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Optimistic assistant placeholder
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (!res.ok) throw new Error("Failed");
      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: full } : m)
        );
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      toast.error("Mentor is unavailable — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    await fetch("/api/mentor/history", { method: "DELETE" });
    setMessages([]);
    toast.success("Conversation cleared");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const isEmpty = messages.length === 0 && !historyLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/8 bg-[#1a1b23] shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AI Mentor</h1>
            <p className="text-xs text-slate-400">Knows your resume, gaps, and roadmap · Guides you daily</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-slate-400 hover:text-red-500 gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {historyLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center pb-10">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-xl shadow-indigo-500/25">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Your personal career mentor</h2>
              <p className="text-slate-400 text-base max-w-sm mx-auto leading-relaxed">
                I know your resume, your gaps, and where you are in your roadmap. Ask me anything — or start with one of these:
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/30 rounded-xl px-4 py-2 text-sm text-slate-400 hover:text-indigo-400 font-medium transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-3 max-w-3xl", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}
          >
            {/* Avatar */}
            <div className={cn(
              "h-8 w-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5",
              msg.role === "assistant"
                ? "bg-gradient-to-br from-indigo-500 to-blue-600 shadow-sm"
                : "bg-slate-100"
            )}>
              {msg.role === "assistant"
                ? <Bot className="h-4 w-4 text-white" />
                : <User className="h-4 w-4 text-slate-500" />
              }
            </div>

            {/* Bubble */}
            <div className={cn(
              "rounded-2xl px-4 py-3 max-w-[75%] text-sm leading-relaxed",
              msg.role === "assistant"
                ? "bg-[#1a1b23] border border-white/10 text-slate-300 shadow-sm"
                : "bg-indigo-600 text-white"
            )}>
              {msg.content || (
                <span className="flex gap-1 items-center text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-5 pt-3 border-t border-white/8 bg-[#1a1b23]">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your mentor anything... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="resize-none min-h-[44px] max-h-[160px] overflow-y-auto text-sm rounded-xl border-slate-200 focus-visible:ring-indigo-500"
            style={{ height: "auto" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 160) + "px";
            }}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="h-11 w-11 p-0 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </Button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          Mentor knows your resume · gaps · roadmap progress
        </p>
      </div>
    </div>
  );
}
