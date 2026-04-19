import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function parsePdf(buffer: Buffer): Promise<string> {
  // pdf-parse is a CJS module; dynamic import wraps it under `.default` at runtime
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
  const result = await pdfParse(buffer);
  return result.text ?? "";
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.type !== "application/pdf")
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024)
    return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  let rawText = "";
  try {
    rawText = await parsePdf(buffer);
  } catch (err) {
    console.error("PDF parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse PDF. Please use a text-based PDF." },
      { status: 422 }
    );
  }

  if (!rawText.trim()) {
    return NextResponse.json(
      { error: "PDF appears to be empty or image-only. Please use a text-based PDF." },
      { status: 422 }
    );
  }

  const fileUrl = `data:application/pdf;name=${encodeURIComponent(file.name)};size=${file.size}`;

  const resume = await db.resume.create({
    data: {
      userId,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      rawText,
    },
  });

  return NextResponse.json({ resumeId: resume.id });
}
