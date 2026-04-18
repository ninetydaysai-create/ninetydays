import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface RoadmapReadyEmailProps {
  name: string;
  targetRole: string;
  weekOneTheme: string;
  roadmapUrl: string;
}

export function RoadmapReadyEmail({ name, targetRole, weekOneTheme, roadmapUrl }: RoadmapReadyEmailProps) {
  const firstName = name?.split(" ")[0] ?? "there";

  return (
    <Html>
      <Head />
      <Preview>Your 90-day roadmap is ready — Week 1 starts now</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>⚡ NinetyDays</Heading>

          <Section style={heroSection}>
            <Text style={emoji}>🗺️</Text>
            <Heading style={h1}>Your roadmap is ready, {firstName}!</Heading>
            <Text style={subtitle}>
              We built you a personalized 12-week plan to become a {targetRole}.
            </Text>
          </Section>

          <Section style={weekOneCard}>
            <Text style={cardLabel}>WEEK 1 FOCUS</Text>
            <Text style={cardTheme}>{weekOneTheme}</Text>
            <Text style={cardHint}>
              Start here. Complete each task and check it off as you go.
            </Text>
          </Section>

          <Text style={paragraph}>
            The plan is calibrated to your resume gaps, target role, and 10 hours/week commitment.
            Every week unlocks new tasks. Every task has real learning resources.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={roadmapUrl}>
              Start Week 1 →
            </Button>
          </Section>

          <Text style={tip}>
            💡 <strong>Tip:</strong> Block 2 hours on Monday and Thursday in your calendar right now.
            Consistency beats intensity.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f9fafb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const container = { margin: "0 auto", padding: "40px 24px", maxWidth: "520px" };
const logo = { fontSize: "24px", fontWeight: "700", color: "#6366f1", marginBottom: "32px" };
const heroSection = { textAlign: "center" as const, marginBottom: "32px" };
const emoji = { fontSize: "48px", margin: "0 0 12px" };
const h1 = { fontSize: "28px", fontWeight: "700", color: "#111827", lineHeight: "1.3", marginBottom: "12px" };
const subtitle = { fontSize: "16px", color: "#6b7280", lineHeight: "1.6", margin: "0" };
const weekOneCard = { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "12px", padding: "24px", marginBottom: "28px", textAlign: "center" as const };
const cardLabel = { fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.7)", letterSpacing: "2px", textTransform: "uppercase" as const, marginBottom: "8px" };
const cardTheme = { fontSize: "22px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" };
const cardHint = { fontSize: "14px", color: "rgba(255,255,255,0.8)", margin: "0" };
const paragraph = { fontSize: "15px", color: "#6b7280", lineHeight: "1.7", marginBottom: "28px" };
const buttonContainer = { textAlign: "center" as const, marginBottom: "24px" };
const button = { backgroundColor: "#6366f1", color: "#ffffff", fontSize: "16px", fontWeight: "600", borderRadius: "8px", padding: "14px 28px", textDecoration: "none", display: "inline-block" };
const tip = { fontSize: "14px", color: "#374151", backgroundColor: "#fef9c3", borderRadius: "8px", padding: "14px 16px", lineHeight: "1.6" };

export default RoadmapReadyEmail;
