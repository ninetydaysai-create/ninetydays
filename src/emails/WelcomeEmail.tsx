import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
  dashboardUrl: string;
}

export function WelcomeEmail({ name, dashboardUrl }: WelcomeEmailProps) {
  const firstName = name?.split(" ")[0] ?? "there";

  return (
    <Html>
      <Head />
      <Preview>Welcome to NinetyDays — your 90-day career transition starts now</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>⚡ NinetyDays</Heading>

          <Heading style={h1}>Welcome, {firstName}!</Heading>

          <Text style={paragraph}>
            You just made a great decision. NinetyDays is your AI-powered co-pilot for transitioning
            from a service company into a product company or AI role — in 90 days.
          </Text>

          <Text style={paragraph}>
            Here&apos;s what&apos;s waiting for you:
          </Text>

          <Section style={featureList}>
            <Text style={feature}>✅ Resume Analyzer — get an honest score vs your target role</Text>
            <Text style={feature}>✅ Gap Engine — see exactly what skills and stories you&apos;re missing</Text>
            <Text style={feature}>✅ 90-Day Roadmap — week-by-week action plan tailored to you</Text>
            <Text style={feature}>✅ AI Mock Interviews — practice and get scored instantly</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Go to your dashboard →
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You received this email because you signed up at{" "}
            <Link href="https://ninetydays.ai" style={link}>ninetydays.ai</Link>.
            Questions? Reply to this email.
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

const container = {
  margin: "0 auto",
  padding: "40px 24px",
  maxWidth: "520px",
};

const logo = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#6366f1",
  marginBottom: "32px",
};

const h1 = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#111827",
  lineHeight: "1.3",
  marginBottom: "16px",
};

const paragraph = {
  fontSize: "16px",
  color: "#6b7280",
  lineHeight: "1.7",
  marginBottom: "12px",
};

const featureList = {
  backgroundColor: "#f3f4f6",
  borderRadius: "12px",
  padding: "20px 24px",
  marginBottom: "28px",
};

const feature = {
  fontSize: "15px",
  color: "#374151",
  lineHeight: "1.7",
  marginBottom: "4px",
};

const buttonContainer = { textAlign: "center" as const, marginBottom: "32px" };

const button = {
  backgroundColor: "#6366f1",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  borderRadius: "8px",
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const hr = { borderColor: "#e5e7eb", margin: "24px 0" };

const footer = { fontSize: "13px", color: "#9ca3af", lineHeight: "1.6" };

const link = { color: "#6366f1" };

export default WelcomeEmail;
