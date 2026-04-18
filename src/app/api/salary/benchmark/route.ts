import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { redisGet, redisSet } from "@/lib/redis";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";

const BenchmarkSchema = z.object({
  p25: z.number(),
  p50: z.number(),
  p75: z.number(),
  p90: z.number(),
  currency: z.string(),
  topPayingCompanies: z.array(z.string()),
  negotiationFloor: z.number(),
  negotiationTarget: z.number(),
  insiderTip: z.string(),
  totalCompNote: z.string(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role, location, yearsExp, currentSalary } = await req.json();
  if (!role || !location) return NextResponse.json({ error: "role and location required" }, { status: 400 });

  // Cache per role+location combo — salary data doesn't change daily
  const cacheKey = `salary:${role}:${location}:${yearsExp ?? 5}`;
  const cached = await redisGet<z.infer<typeof BenchmarkSchema>>(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const prompt = `You are a compensation expert with access to 2024-2025 market data from Levels.fyi, Glassdoor, and Blind.

Generate realistic salary benchmarks for this profile:
- Role: ${role}
- Location / market: ${location}
- Years of experience: ${yearsExp ?? "5-7"}
- Current salary (if provided): ${currentSalary ? `$${currentSalary}` : "not provided"}

Return a JSON object with:
{
  "p25": <25th percentile annual base salary in USD or local currency>,
  "p50": <median base salary>,
  "p75": <75th percentile — strong performers at product companies>,
  "p90": <90th percentile — FAANG / top-tier companies>,
  "currency": <"USD" | "INR" | "EUR" etc based on location>,
  "topPayingCompanies": [<3-4 companies known for top comp in this role/location>],
  "negotiationFloor": <minimum to accept — walk away below this>,
  "negotiationTarget": <realistic target to ask for first>,
  "insiderTip": <one specific, actionable negotiation insight for this role/location — not generic>,
  "totalCompNote": <brief note on stock/RSU/bonus expectations for this role level — 1-2 sentences>
}

Use real 2024-2025 market data. For India locations, use INR. Be specific and realistic — avoid ranges, give exact numbers.`;

  const { object } = await generateObject({
    model: defaultModel,
    schema: BenchmarkSchema,
    prompt,
  });

  // Cache for 7 days — salary data is stable
  await redisSet(cacheKey, object, 7 * 24 * 60 * 60);

  return NextResponse.json(object);
}
