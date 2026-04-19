import { NextRequest, NextResponse } from "next/server";

/** Escape HTML special chars to prevent XSS from query params */
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// Returns a shareable HTML card page (screenshot-ready)
// Usage: /api/og/share-card?score=74&week=8&role=ml+engineer&company=Google
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const rawScore = parseInt(searchParams.get("score") ?? "0", 10);
  const score = Math.max(0, Math.min(100, isNaN(rawScore) ? 0 : rawScore));
  const week = esc(searchParams.get("week")?.slice(0, 3) ?? "?");
  const role = esc((searchParams.get("role") ?? "product engineer").slice(0, 60));
  const company = esc((searchParams.get("company") ?? "").slice(0, 40));

  const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const companyLine = company ? `Targeting ${company}` : "Product company track";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0b0e14;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  .card {
    width: 540px;
    background: #12141c;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    padding: 36px;
    position: relative;
    overflow: hidden;
  }
  .glow {
    position: absolute;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    height: 200px;
    background: radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%);
    pointer-events: none;
  }
  .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
  .logo-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #6366f1, #7c3aed);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .logo-name { font-size: 15px; font-weight: 700; color: #fff; }
  .week-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 100px; padding: 5px 14px;
    font-size: 12px; font-weight: 600; color: #a5b4fc;
    margin-bottom: 20px;
  }
  .score-row { display: flex; align-items: flex-end; gap: 12px; margin-bottom: 8px; }
  .score-num { font-size: 80px; font-weight: 900; color: ${color}; line-height: 1; }
  .score-label { font-size: 14px; color: rgba(255,255,255,0.4); margin-bottom: 12px; }
  .role-line { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 4px; text-transform: capitalize; }
  .company-line { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 28px; }
  .bar-bg { background: rgba(255,255,255,0.08); border-radius: 100px; height: 8px; overflow: hidden; margin-bottom: 32px; }
  .bar-fill { height: 100%; border-radius: 100px; background: ${color}; width: ${Math.min(100, score)}%; }
  .cta { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; }
  .cta-text { font-size: 12px; color: rgba(255,255,255,0.35); }
  .cta-url { font-size: 12px; font-weight: 600; color: #818cf8; }
</style>
</head>
<body>
<div class="card">
  <div class="glow"></div>
  <div class="logo">
    <div class="logo-icon">&#x26A1;</div>
    <span class="logo-name">NinetyDays.ai</span>
  </div>
  <div class="week-badge">Week ${week} of 12 &middot; My 90-day journey</div>
  <div class="score-row">
    <div class="score-num">${score}</div>
    <div class="score-label">/ 100<br />readiness</div>
  </div>
  <div class="role-line">${role} readiness</div>
  <div class="company-line">${companyLine}</div>
  <div class="bar-bg"><div class="bar-fill"></div></div>
  <div class="cta">
    <span class="cta-text">Track your readiness daily</span>
    <span class="cta-url">ninetydays.ai</span>
  </div>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
