/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to KnowIt AI — confirm your email to get started 🚀</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logoText}>K</Text>
          <Heading style={h1}>Welcome aboard! 🎉</Heading>
        </Section>
        <Text style={text}>
          Thanks for joining{' '}
          <Link href={siteUrl} style={link}>
            <strong>KnowIt AI</strong>
          </Link>
          ! You're one step away from personalized, AI-powered learning.
        </Text>
        <Text style={text}>
          Confirm your email (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) to start earning XP, unlocking achievements, and mastering new subjects.
        </Text>
        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            Get Started
          </Button>
        </Section>
        <Text style={footer}>
          If you didn't create an account on KnowIt AI, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
const link = { color: '#171717', textDecoration: 'underline' }
const buttonSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = {
  backgroundColor: '#171717',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  borderRadius: '10px',
  padding: '12px 28px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#a3a3a3', margin: '24px 0 0', borderTop: '1px solid #f5f5f5', paddingTop: '16px' }
