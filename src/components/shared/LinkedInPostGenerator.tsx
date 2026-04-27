"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Tone = "motivational" | "technical" | "story";

interface Post {
  variant: string;
  content: string;
  hashtags: string[];
}

const EVENT_OPTIONS = [
  "Completed a roadmap task",
  "Hit a readiness milestone",
  "Built a project",
  "Completed a mock interview",
  "Custom milestone",
];

const TONES: { key: Tone; label: string }[] = [
  { key: "motivational", label: "Motivational" },
  { key: "technical", label: "Technical" },
  { key: "story", label: "Story" },
];

export function LinkedInPostGenerator() {
  const [event, setEvent] = useState(EVENT_OPTIONS[0]);
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<Tone>("motivational");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setPosts([]);
    try {
      const res = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, context, tone }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Generation failed");
        return;
      }
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyPost(post: Post, idx: number) {
    const cleanTags = post.hashtags.map((h) => `#${h.replace(/^#/, "")}`);
    const hashtagLine = cleanTags.length > 0 ? "\n\n" + cleanTags.join(" ") : "";
    navigator.clipboard.writeText(post.content + hashtagLine);
    setCopiedIdx(idx);
    toast.success("Post copied to clipboard");
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Input form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Generate a LinkedIn post</h2>
          <p className="text-sm text-slate-500">
            Tell us what you accomplished — we'll write 3 post variants you can copy straight to LinkedIn.
          </p>
        </div>

        {/* Event selector */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Milestone</Label>
          <select
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            {EVENT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Context textarea */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Tell us more{" "}
            <span className="text-slate-400 font-normal">(optional)</span>
          </Label>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. I finished Week 4 of my NinetyDays roadmap — implemented a caching layer that cut latency by 40%"
            rows={3}
            className="text-sm text-slate-900 bg-slate-50 border-slate-200 focus:bg-white transition-colors resize-none placeholder:text-slate-400"
          />
        </div>

        {/* Tone pills */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Tone</Label>
          <div className="flex gap-2 flex-wrap">
            {TONES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTone(key)}
                className={`h-9 px-4 rounded-full text-sm font-semibold border transition-all ${
                  tone === key
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="h-12 px-8 text-base font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all w-full sm:w-auto"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Generating posts...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate 3 posts
            </span>
          )}
        </Button>
      </div>

      {/* Results */}
      {posts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold text-sm">
              3 posts ready — copy and paste to LinkedIn
            </span>
          </div>

          {posts.map((post, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {post.variant}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-xs"
                  onClick={() => copyPost(post, idx)}
                >
                  {copiedIdx === idx ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              {/* Post content */}
              <div className="px-6 py-5 space-y-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>

                {/* Hashtags */}
                {post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700"
                      >
                        #{tag.replace(/^#/, "")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
