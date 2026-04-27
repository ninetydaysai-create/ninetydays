// Known IT services / outsourcing employers
const SERVICE_COMPANY_NAMES = [
  "tata consultancy", "tcs", "infosys", "wipro", "accenture", "cognizant", "capgemini",
  "hcl technologies", "hcltech", "tech mahindra", "mphasis", "hexaware", "mindtree",
  "l&t infotech", "ltimindtree", "persistent systems", "zensar", "mastech",
  "igate", "patni", "kpit", "niit technologies", "syntel", "atos", "dxc technology",
  "unisys", "cgi group", "ntt data", "fujitsu", "genpact", "wns global", "merilytics",
  "ey gds", "deloitte usp", "kpmg global services", "pwc acceleration",
];

/**
 * Returns true only if the candidate was an *employee* at a service company,
 * not just if a service company name appears anywhere in the text (e.g., as a client).
 * Checks short lines (likely employer headers) and explicit employer-context patterns.
 */
export function detectServiceCompanyEmployer(resumeText: string): boolean {
  const text = resumeText.toLowerCase();
  const lines = text.split(/\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    // Employer header lines: short, no "client" context
    if (trimmed.length > 0 && trimmed.length <= 80 && !trimmed.includes("client")) {
      for (const company of SERVICE_COMPANY_NAMES) {
        if (trimmed.includes(company)) return true;
      }
    }
  }

  // Explicit employer-context patterns: "at Infosys", "Company: TCS", "for Wipro"
  const employerPatterns = SERVICE_COMPANY_NAMES.map(
    (c) => new RegExp(`(?:at|for|employer|company)[:\\s]+${c.replace(/[+.]/g, "\\$&")}`, "i")
  );
  return employerPatterns.some((p) => p.test(resumeText));
}
