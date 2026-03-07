/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your KnowIt AI verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logoText}>K</Text>
          <Heading style={h1}>Verification code</Heading>
        </Section>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Section style={codeSection}>
          <Text style={codeStyle}>{token}</Text>
        </Section>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Segoe UI', Roboto, Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '480px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logoText = {
  display: 'inline-block',
  width: '44px',
  height: '44px',
  lineHeight: '44px',
  textAlign: 'center' as const,
  backgroundColor: '#171717',
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '800' as const,
  borderRadius: '10px',
  margin: '0 auto 12px',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#171717',
  margin: '0',
}
const text = {
  fontSize: '14px',
  color: '#737373',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const codeSection = { textAlign: 'center' as const, margin: '24px 0' }
const codeStyle = {
  fontFamily: "'SF Mono', 'Courier New', monospace",
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#171717',
  letterSpacing: '4px',
  margin: '0',
  padding: '16px 24px',
  backgroundColor: '#f5f5f5',
  borderRadius: '10px',
  display: 'inline-block',
}
const footer = { fontSize: '12px', color: '#a3a3a3', margin: '24px 0 0', borderTop: '1px solid #f5f5f5', paddingTop: '16px' }
