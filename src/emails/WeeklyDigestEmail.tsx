import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WeeklyDigestEmailProps {
  name: string;
  weekNumber: number;
  tasksCompleted: number;
  tasksTotal: number;
  tasksThisWeek: number;
  currentWeekTheme: string;
  progressPct: number;
  readiness: number;
  dashboardUrl: string;
  nextSteps: string[];
}

export function WeeklyDigestEmail({
  name,
  weekNumber,
  tasksCompleted,
  tasksTotal,
  tasksThisWeek,
  currentWeekTheme,
  progressPct,
  readiness,
  dashboardUrl,
  nextSteps,
}: WeeklyDigestEmailProps) {
  const firstName = name?.split(" ")[0] ?? "there";

  const readinessColor =
    readiness >= 70 ? "#16a34a" : readiness >= 50 ? "#d97706" : "#dc2626";

  const readinessBg =
    readiness >= 70 ? "#f0fdf4" : readiness >= 50 ? "#fffbeb" : "#fef2f2";

  const readinessBorder =
    readiness >= 70 ? "#bbf7d0" : readiness >= 50 ? "#fde68a" : "#fecaca";

  return (
    <Html>
      <Head />
      <Preview>{`Week ${weekNumber} — you're ${readiness}% ready`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>⚡ NinetyDays</Heading>

          <Text style={eyebrow}>WEEK {weekNumber} DIGEST</Text>
          <Heading style={h1}>How&apos;s your transition going, {firstName}?</Heading>

          {/* Readiness Score Hero */}
          <Section style={{ ...readinessHero, backgroundColor: readinessBg, borderColor: readinessBorder }}>
            <Text style={{ ...readinessNumber, color: readinessColor }}>{readiness}%</Text>
            <Text style={readinessLabel}>Interview Readiness Score</Text>
            <Text style={{ ...readinessMotivation, color: readinessColor }}>
              You&apos;re {readiness}% ready for a product company role
            </Text>
          </Section>

          {/* Progress stats */}
          <Section style={statsRow}>
            <Section style={stat}>
              <Text style={statNumber}>{progressPct}%</Text>
              <Text style={statLabel}>Roadmap complete</Text>
            </Section>
            <Section style={stat}>
              <Text style={statNumber}>{tasksCompleted}/{tasksTotal}</Text>
              <Text style={statLabel}>Tasks done</Text>
            </Section>
            <Section style={stat}>
              <Text style={statNumber}>{tasksThisWeek}</Text>
              <Text style={statLabel}>This week</Text>
            </Section>
          </Section>

          {/* Current week */}
          <Section style={weekSection}>
            <Text style={sectionLabel}>This week&apos;s focus</Text>
            <Text style={weekTheme}>{currentWeekTheme}</Text>
          </Section>

          {/* Next steps */}
          {nextSteps.length > 0 && (
            <Section style={nextSection}>
              <Text style={sectionLabel}>Your next steps</Text>
              {nextSteps.map((step, i) => (
                <Text key={i} style={nextStep}>→ {step}</Text>
              ))}
            </Section>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Open your roadmap →
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            Weekly digest from NinetyDays. You can adjust email preferences in your account settings.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f9fafb",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};
const container = { margin: "0 auto", padding: "40px 24px", maxWidth: "520px" };
const logo = { fontSize: "24px", fontWeight: "700", color: "#6366f1", marginBottom: "24px" };
const eyebrow = { fontSize: "11px", fontWeight: "700", color: "#6366f1", letterSpacing: "2px", textTransform: "uppercase" as const, marginBottom: "8px" };
const h1 = { fontSize: "26px", fontWeight: "700", color: "#111827", lineHeight: "1.3", marginBottom: "24px" };
const readinessHero = { borderRadius: "12px", border: "1px solid", padding: "24px 20px", marginBottom: "28px", textAlign: "center" as const };
const readinessNumber = { fontSize: "64px", fontWeight: "800", margin: "0 0 4px", lineHeight: "1" };
const readinessLabel = { fontSize: "13px", fontWeight: "700", color: "#374151", textTransform: "uppercase" as const, letterSpacing: "1px", margin: "0 0 8px" };
const readinessMotivation = { fontSize: "15px", fontWeight: "600", margin: "0" };
const statsRow = { display: "flex", gap: "0", marginBottom: "28px" };
const stat = { flex: "1", backgroundColor: "#f3f4f6", borderRadius: "8px", padding: "16px", margin: "0 4px", textAlign: "center" as const };
const statNumber = { fontSize: "28px", fontWeight: "700", color: "#6366f1", margin: "0 0 4px" };
const statLabel = { fontSize: "12px", color: "#6b7280", margin: "0" };
const weekSection = { backgroundColor: "#ede9fe", borderRadius: "8px", padding: "16px 20px", marginBottom: "20px" };
const sectionLabel = { fontSize: "11px", fontWeight: "700", color: "#7c3aed", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "6px" };
const weekTheme = { fontSize: "16px", fontWeight: "600", color: "#1f2937", margin: "0" };
const nextSection = { marginBottom: "28px" };
const nextStep = { fontSize: "15px", color: "#374151", lineHeight: "1.7", marginBottom: "4px" };
const buttonContainer = { textAlign: "center" as const, marginBottom: "32px" };
const button = { backgroundColor: "#6366f1", color: "#ffffff", fontSize: "16px", fontWeight: "600", borderRadius: "8px", padding: "14px 28px", textDecoration: "none", display: "inline-block" };
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const footer = { fontSize: "13px", color: "#9ca3af", lineHeight: "1.6" };

export default WeeklyDigestEmail;
