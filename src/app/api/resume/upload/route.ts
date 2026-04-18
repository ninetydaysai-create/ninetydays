import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import path from "path";

async function parsePdf(buffer: Buffer): Promise<string> {
  // Use pdfjs-dist directly — more reliable in Next.js server context than pdf-parse v2
  const { getDocument, GlobalWorkerOptions } = await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
  );

  // Point to the worker file on disk; avoids "fake worker" error in Node.js
  const workerPath = path.resolve(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  );
  GlobalWorkerOptions.workerSrc = `file://${workerPath}`;

  const data = new Uint8Array(buffer);
  const doc = await getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      // TextItem has .str; TextMarkedContent does not — filter to text items only
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => (typeof item.str === "string" ? item.str : ""))
      .join(" ");
    text += pageText + "\n";
    page.cleanup();
  }
  await doc.destroy();
  return text;
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
