/**
 * Deterministic timeline-based techYears parser.
 * Extracts employment date ranges from resume text, detects technologies
 * mentioned in each role, and returns cumulative years per technology.
 * Used to replace model-inferred techYears with evidence-based estimates.
 */

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

// Comprehensive list of technologies to detect
const KNOWN_TECHS: string[] = [
  // Languages
  "Python", "JavaScript", "TypeScript", "Java", "Go", "Golang", "Rust", "C++", "C#", "Ruby",
  "PHP", "Swift", "Kotlin", "Scala", "R", "Perl", "Shell", "Bash",
  // Frontend
  "React", "Next.js", "Vue", "Angular", "Svelte", "Tailwind", "Redux", "GraphQL",
  // Backend
  "Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot", "Spring", "Rails",
  "ASP.NET", "NestJS", "Fastify", "Hapi",
  // Databases
  "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Elasticsearch", "DynamoDB",
  "Cassandra", "Snowflake", "BigQuery", "Redshift", "ClickHouse", "Supabase",
  // Cloud & Infra
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Ansible",
  "Helm", "Pulumi", "CloudFormation", "Lambda", "EC2", "S3", "RDS",
  // ML / AI
  "PyTorch", "TensorFlow", "scikit-learn", "Keras", "Hugging Face", "LangChain",
  "OpenAI", "XGBoost", "LightGBM", "Pandas", "NumPy", "Spark", "Airflow", "MLflow",
  "Vertex AI", "SageMaker", "Kubeflow", "Ray",
  // Data / Analytics
  "SQL", "dbt", "Kafka", "Flink", "Databricks", "Tableau", "Looker", "Metabase",
  // DevOps / CI
  "GitHub Actions", "Jenkins", "CircleCI", "GitLab CI", "ArgoCD", "Datadog",
  "Prometheus", "Grafana", "New Relic", "Sentry",
  // Mobile
  "React Native", "Flutter", "iOS", "Android",
  // Other
  "REST", "gRPC", "Kafka", "RabbitMQ", "Celery", "Nginx", "Linux", "Git",
];

interface DateRange {
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
  durationYears: number;
  textStart: number; // character position in resume
}

function parseDate(token: string): { year: number; month: number } | null {
  const now = new Date();
  const lc = token.toLowerCase().trim().replace(/['']/g, "");

  if (lc === "present" || lc === "current" || lc === "now") {
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }

  // "2023" — year only
  if (/^\d{4}$/.test(lc)) {
    return { year: parseInt(lc), month: 1 };
  }

  // "jan2020" or "jan 2020" or "jan'20"
  const shortYear = lc.match(/^([a-z]+)\s*'?(\d{2,4})$/);
  if (shortYear) {
    const monthNum = MONTH_MAP[shortYear[1]];
    if (!monthNum) return null;
    const yr = shortYear[2].length === 2 ? 2000 + parseInt(shortYear[2]) : parseInt(shortYear[2]);
    return { year: yr, month: monthNum };
  }

  return null;
}

export function extractDateRanges(resumeText: string): DateRange[] {
  const ranges: DateRange[] = [];

  // Patterns:
  // "Jan 2020 – Present", "Jan 2020 - Dec 2022", "2020 – 2023"
  // "January 2020 to June 2022", "Jan '20 – Dec '22"
  const pattern =
    /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[\s']*'?(\d{2,4})\s*(?:–|-|to)\s*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|present|current|now)[\s']*'?(\d{0,4})|(\d{4})\s*(?:–|-)\s*(\d{4}|present|current)/gi;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(resumeText)) !== null) {
    let startYear: number, startMonth: number, endYear: number, endMonth: number;

    if (match[5]) {
      // Year-only format: "2020 – 2023"
      const now = new Date();
      startYear = parseInt(match[5]);
      startMonth = 1;
      const endToken = match[6].toLowerCase();
      if (endToken === "present" || endToken === "current") {
        endYear = now.getFullYear();
        endMonth = now.getMonth() + 1;
      } else {
        endYear = parseInt(match[6]);
        endMonth = 12;
      }
    } else {
      // Month-year format
      const start = parseDate(`${match[1]} ${match[2]}`);
      if (!start) continue;
      startYear = start.year;
      startMonth = start.month;

      const endStr = match[4] ? `${match[3]} ${match[4]}` : match[3];
      const end = parseDate(endStr);
      if (!end) continue;
      endYear = end.year;
      endMonth = end.month;
    }

    if (startYear < 1990 || startYear > 2030 || endYear < startYear) continue;

    const durationYears =
      (endYear - startYear) + (endMonth - startMonth) / 12;

    ranges.push({
      startYear,
      startMonth,
      endYear,
      endMonth,
      durationYears: Math.max(0, Math.round(durationYears * 10) / 10),
      textStart: match.index,
    });
  }

  return ranges.sort((a, b) => a.textStart - b.textStart);
}

function detectTechsInSection(text: string): string[] {
  const found: string[] = [];
  const lower = text.toLowerCase();

  for (const tech of KNOWN_TECHS) {
    const pattern = new RegExp(`\\b${tech.replace(/\./g, "\\.").replace(/\+/g, "\\+")}\\b`, "i");
    if (pattern.test(lower)) {
      found.push(tech);
    }
  }

  return [...new Set(found)];
}

/**
 * Main export: parse resume text and return evidence-based techYears.
 * Falls back to an empty object if no date ranges are found.
 */
export function parseTimelineYears(resumeText: string): Record<string, number> {
  const ranges = extractDateRanges(resumeText);
  if (ranges.length === 0) return {};

  const techAccumulator: Record<string, number> = {};

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    const nextRangeStart = ranges[i + 1]?.textStart ?? resumeText.length;

    // Extract text for this role: from the date range position to the next date range
    const sectionText = resumeText.slice(range.textStart, Math.min(nextRangeStart, range.textStart + 1500));
    const techs = detectTechsInSection(sectionText);

    for (const tech of techs) {
      techAccumulator[tech] = (techAccumulator[tech] ?? 0) + range.durationYears;
    }
  }

  // Round to 1 decimal place and filter out < 0.2 years (noise)
  const result: Record<string, number> = {};
  for (const [tech, years] of Object.entries(techAccumulator)) {
    const rounded = Math.round(years * 10) / 10;
    if (rounded >= 0.2) result[tech] = rounded;
  }

  return result;
}

/**
 * Merge parsed timeline years with model-inferred years.
 * Timeline-parsed years take precedence; model fills gaps for techs
 * that appear in the resume but weren't tied to a date range.
 */
export function mergeTimelineWithModel(
  parsedYears: Record<string, number>,
  modelYears: Record<string, number>
): Record<string, number> {
  const merged = { ...modelYears };

  // Timeline evidence always overrides model inference
  for (const [tech, years] of Object.entries(parsedYears)) {
    merged[tech] = years;
  }

  return merged;
}
