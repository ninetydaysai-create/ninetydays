import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from "@react-email/components";

interface DailyChallengeEmailProps {
  name: string;
  challengeType: string;       // e.g. "Interview Question"
  dimension: string;           // e.g. "interview confidence"
  coachingReason: string;      // AI-generated "why today"
  challengeUrl: string;
}

const CHALLENGE_EMOJI: Record<string, string> = {
  interview_question: "🎤",
  star_story:         "⭐",
  bullet_rewrite:     "✍️",
  case_study:         "📊",
  flashcard:          "🧠",
  ai_conversation:    "💬",
};

export function DailyChallengeEmail({
  name,
  challengeType,
  dimension,
  coachingReason,
  challengeUrl,
}: DailyChallengeEmailProps) {
  const firstName = name?.split(" ")[0] ?? "there";
  const emoji = CHALLENGE_EMOJI[challengeType] ?? "⚡";
  const typeLabel = challengeType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const dimLabel  = dimension.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <Html>
      <Head />
      <Preview>{emoji} Your daily challenge: {typeLabel} · 5 min</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>⚡ NinetyDays</Heading>

          <Section style={heroSection}>
            <Text style={emojiStyle}>{emoji}</Text>
            <Heading style={h1}>Your challenge for today, {firstName}</Heading>
            <Text style={subtitle}>
              {typeLabel} · targeting <strong>{dimLabel}</strong> · 5 minutes
            </Text>
          </Section>

          {/* Coaching reason — why this challenge today */}
          <Section style={reasonCard}>
            <Text style={reasonLabel}>WHY TODAY</Text>
            <Text style={reasonText}>{coachingReason}</Text>
          </Section>

          <Section style={ctaSection}>
            <Button style={button} href={challengeUrl}>
              Start today's challenge →
            </Button>
          </Section>

          <Text style={footer}>
            NinetyDays · Your AI-powered career transformation platform
            <br />
            <a href={`${challengeUrl}/settings`} style={unsubLink}>Unsubscribe from daily challenges</a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: "#0b0e14",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "40px 20px",
};

const logo: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 900,
  color: "#818cf8",
  marginBottom: "32px",
};

const heroSection: React.CSSProperties = {
  textAlign: "center",
  padding: "0 0 28px",
  borderBottom: "1px solid #1e2433",
};

const emojiStyle: React.CSSProperties = {
  fontSize: "48px",
  margin: "0 0 12px",
};

const h1: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 800,
  color: "#f1f5f9",
  margin: "0 0 8px",
};

const subtitle: React.CSSProperties = {
  fontSize: "14px",
  color: "#94a3b8",
  margin: 0,
};

const reasonCard: React.CSSProperties = {
  backgroundColor: "#161820",
  border: "1px solid #1e2433",
  borderRadius: "12px",
  padding: "20px",
  margin: "24px 0",
};

const reasonLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#a78bfa",
  margin: "0 0 8px",
};

const reasonText: React.CSSProperties = {
  fontSize: "14px",
  color: "#cbd5e1",
  lineHeight: "1.6",
  margin: 0,
};

const ctaSection: React.CSSProperties = {
  textAlign: "center",
  margin: "32px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  padding: "14px 28px",
  borderRadius: "10px",
  fontWeight: 700,
  fontSize: "15px",
  textDecoration: "none",
  display: "inline-block",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#475569",
  textAlign: "center",
  lineHeight: "1.6",
  marginTop: "32px",
  borderTop: "1px solid #1e2433",
  paddingTop: "24px",
};

const unsubLink: React.CSSProperties = {
  color: "#64748b",
};
