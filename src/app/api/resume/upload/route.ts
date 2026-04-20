import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/sync-user";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the file looks like a PDF by magic bytes (regardless of MIME) */
function isPdfBuffer(buf: Buffer): boolean {
  return buf.length > 4 && buf.slice(0, 4).toString("ascii") === "%PDF";
}

/** Returns true if the file looks like a DOCX/XLSX (OOXML zip) by magic bytes */
function isDocxBuffer(buf: Buffer): boolean {
  // ZIP magic: 50 4B 03 04
  return buf.length > 3 && buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04;
}

/** Extract text from PDF buffer — tries pdf-parse first, unpdf as fallback */
async function extractPdfText(buf: Buffer): Promise<string> {
  // Primary: pdf-parse (mature, handles most text-layer PDFs well)
  try {
    // pdf-parse ships both CJS and ESM; use require() to guarantee we get the CJS default export
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(buf);
    if (data?.text?.trim()) return data.text;
  } catch {
    // fall through to secondary
  }

  // Secondary: unpdf (pdfjs-dist serverless build)
  try {
    const { extractText } = await import("unpdf");
    const pages = await extractText(new Uint8Array(buf), { mergePages: true });
    const text = Array.isArray(pages) ? pages.join("\n") : (pages as unknown as { text: string }).text ?? "";
    if (text.trim()) return text;
  } catch {
    // fall through
  }

  return "";
}

/** Extract text from DOCX buffer using mammoth */
async function extractDocxText(buf: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer: buf });
  return result.value ?? "";
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await syncUser(userId);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "File must be under 10 MB" }, { status: 400 });

  // Check extension (MIME alone is unreliable across browsers/OS)
  const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: "Please upload a PDF or Word document (.pdf, .doc, .docx)" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Detect real format by magic bytes
  const looksLikePdf = isPdfBuffer(buffer);
  const looksLikeDocx = isDocxBuffer(buffer);

  let rawText = "";

  if (ext === ".pdf" || looksLikePdf) {
    // Parse as PDF
    rawText = await extractPdfText(buffer);

    if (!rawText.trim()) {
      return NextResponse.json(
        {
          error:
            "Your PDF doesn't contain selectable text. " +
            "This usually means it's a scanned image. " +
            "Please export your resume as a text-based PDF from Word or Google Docs and try again.",
        },
        { status: 422 }
      );
    }
  } else if (ext === ".docx" || (ext === ".doc" && looksLikeDocx)) {
    // Parse as DOCX
    try {
      rawText = await extractDocxText(buffer);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("DOCX parse error:", msg);
      return NextResponse.json(
        {
          error:
            "Could not read your Word document. " +
            "Try saving it as PDF (File → Save as PDF) and uploading that instead.",
        },
        { status: 422 }
      );
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        {
          error:
            "Your Word document appears to be empty. " +
            "Please check the file and try again, or save as PDF.",
        },
        { status: 422 }
      );
    }
  } else {
    // Old .doc binary format — we can't parse it reliably
    return NextResponse.json(
      {
        error:
          "Old .doc format is not supported. " +
          "Open your file in Word and save as .docx or PDF, then try again.",
      },
      { status: 400 }
    );
  }

  // Sanity-check: at least 100 chars of real content
  if (rawText.trim().length < 100) {
    return NextResponse.json(
      {
        error:
          "Resume text is too short to analyze. " +
          "Please make sure your resume has content and try again.",
      },
      { status: 422 }
    );
  }

  const fileUrl = `data:${ext === ".pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"};name=${encodeURIComponent(file.name)};size=${file.size}`;

  let resume;
  try {
    resume = await db.resume.create({
      data: { userId, fileUrl, fileName: file.name, fileSize: file.size, rawText },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("DB error creating resume:", msg);
    return NextResponse.json({ error: "Failed to save resume. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ resumeId: resume.id });
}
