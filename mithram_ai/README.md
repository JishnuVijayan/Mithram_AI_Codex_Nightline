# Mithram AI

AI-powered elder wellness companion built with Next.js, Prisma, Twilio, and OpenAI.

## Prototype Flow

1. A caregiver signs up or logs in.
2. They add an elderly parent and one medicine.
3. The dashboard lists parents and call history.
4. Starting a call creates a call log and dials the verified Twilio demo number.
5. Twilio webhooks ask wellness questions and save transcripts.
6. OpenAI classifies the medicine answer and sentiment.

## Local Setup

Install dependencies:

```bash
npm install
```

Copy env placeholders and fill in local values:

```bash
cp .env.example .env
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Push the schema to the configured development database:

```bash
npm run prisma:push
```

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Current Scope

The current build targets the hackathon MVP first: auth, onboarding, dashboard, outbound call trigger, TwiML question flow, and classification. Subscription is static.

Prototype auth is intentionally simple and must not be treated as production-ready.
