# Mithram AI Feature TODO

## Current Situation

- The app is a fresh Next.js App Router scaffold under `mithram_ai/`.
- Packages are installed for the planned stack: Next.js, React, Prisma, Twilio, OpenAI, Zod, Tailwind, and supporting UI utilities.
- The docs define a hackathon prototype first: signup/login, parent onboarding, medicine entry, dashboard, outbound Twilio call, TwiML question flow, transcript storage, and OpenAI classification.
- The implementation is not wired yet: `app/page.tsx` is still the default starter page, there are no app API routes, no product pages, no repository/service layer, and no Twilio/OpenAI logic.
- Prisma needs alignment before feature work: `docs/PRODUCT_SPEC.md` expects SQLite, but `prisma/schema.prisma` currently declares PostgreSQL and no models.
- The docs have two scopes:
  - Prototype scope: fixed three questions, simple auth, one verified Twilio number, minimal UI.
  - Product scope: configurable greeting/questions, monthly security code, consent, retries, notifications, escalation, and future analytics.

## Commit And Push Rules

- Work in small feature branches.
- Commit one logical feature or fix at a time.
- Use conventional commit prefixes:
  - `feat:` for new user-visible features.
  - `fix:` for bug fixes or broken integration behavior.
  - `chore:` for tooling, config, env examples, or non-runtime maintenance.
  - `docs:` for documentation-only changes.
  - `test:` for test additions or test harness work.
  - `refactor:` for structure changes without behavior changes.
- Recommended flow:
  1. Implement one feature.
  2. Run the relevant checks.
  3. Commit with the suggested message.
  4. Push the branch.

## Feature 0: Project Baseline

- [ ] Confirm whether the project will stay TypeScript or switch to JavaScript as the prototype spec says.
- [ ] Decide and document SQLite vs PostgreSQL. Prototype docs strongly favor SQLite.
- [ ] Add `.env.example` with non-secret placeholders for Twilio, OpenAI, ngrok, and database settings.
- [ ] Update `README.md` from default Next.js text to Mithram AI setup instructions.
- [ ] Remove generated/default starter content from the landing route or redirect `/` to `/login`.
- [ ] Verify `.gitignore` excludes `.env`, SQLite DB files, `.next/`, `node_modules/`, and OS files.
- Suggested commits:
  - `chore: align project baseline for mithram prototype`
  - `docs: add local setup instructions`

## Feature 1: Database And Data Access

- [ ] Define Prisma models for `User`, `Parent`, `Medicine`, and `CallLog`.
- [ ] Include prototype fields: `callFrequency`, `callTimes`, `callSid`, question answers, medicine flag, sentiment flag, and timestamps.
- [ ] Leave future fields for a separate commit: emergency contacts, configurable questions, custom greeting, monthly security code, consent records.
- [ ] Generate the Prisma client.
- [ ] Run a local schema push or migration.
- [ ] Add a small Prisma client helper.
- [ ] Add repository functions for users, parents, medicines, and call logs.
- Suggested commits:
  - `feat: add prisma schema for core care loop`
  - `feat: add data repositories for users and calls`

## Feature 2: Auth Prototype

- [ ] Build `POST /api/signup`.
- [ ] Build `POST /api/login`.
- [ ] Validate request bodies with Zod.
- [ ] Use plaintext password comparison only if staying true to hackathon scope; clearly document that it is demo-only.
- [ ] Build `/signup` page.
- [ ] Build `/login` page.
- [ ] Store `userId` client-side for prototype navigation.
- Suggested commits:
  - `feat: add signup and login api routes`
  - `feat: add auth pages for prototype flow`

## Feature 3: Parent And Medicine Onboarding

- [ ] Build `POST /api/parents`.
- [ ] Build `POST /api/medicines`.
- [ ] Build `/parents/new` form.
- [ ] Allow parent and medicine fields in one screen for speed.
- [ ] Capture name, phone number, relation, preferred language, call frequency, call time, medicine name, dosage, and medicine time.
- [ ] After save, route to `/dashboard`.
- Suggested commits:
  - `feat: add parent and medicine api routes`
  - `feat: add parent onboarding form`

## Feature 4: Dashboard

- [ ] Build `GET /api/parents/[userId]` returning each parent with latest call summary.
- [ ] Build `GET /api/calls/[parentId]` returning call logs newest first.
- [ ] Build `/dashboard` parent list.
- [ ] Add a `Start Call` button per parent.
- [ ] Add call history and transcript view.
- [ ] Show status, question answers, medicine flag, and sentiment flag.
- [ ] Add static dashboard cards only after real data is working.
- Suggested commits:
  - `feat: add dashboard data routes`
  - `feat: add dashboard parent and call log views`

## Feature 5: Static Subscription Page

- [ ] Build `/subscription`.
- [ ] Use hardcoded pricing tiers and placeholder copy.
- [ ] Do not add payment backend in prototype scope.
- Suggested commit:
  - `feat: add static subscription page`

## Feature 6: Twilio Call Start And Cancellation

- [ ] Add a Twilio client helper that reads env vars safely.
- [ ] Build `POST /api/calls/start`.
- [ ] Create a `CallLog` with `status = "in_progress"` before dialing.
- [ ] Dial `MY_VERIFIED_NUMBER` for demo reliability.
- [ ] Save returned `callSid`.
- [ ] Build `POST /api/calls/cancel` to terminate an active call and mark it `no_answer`.
- Suggested commits:
  - `feat: add twilio outbound call trigger`
  - `feat: add call cancellation route`

## Feature 7: TwiML Voice Flow

- [ ] Add hardcoded question constants.
- [ ] Prefer Manglish prompts for Malayalam if Twilio Malayalam speech synthesis is unreliable.
- [ ] Build `POST /api/twiml/connect`.
- [ ] Build `POST /api/twiml/step`.
- [ ] Save empty speech as `(no response)`.
- [ ] Ask all three questions in sequence.
- [ ] Mark the log `answered` after question 3.
- [ ] Add retry behavior for silence only after the basic flow works.
- Suggested commits:
  - `feat: add twiml connect webhook`
  - `feat: add twiml question step flow`
  - `fix: handle silence during voice gather`

## Feature 8: Twilio Status Callback

- [ ] Build `POST /api/twiml/status-callback`.
- [ ] Map Twilio statuses to internal statuses.
- [ ] Keep answered calls as `answered`.
- [ ] Mark incomplete, failed, busy, or no-answer calls as `no_answer`.
- Suggested commit:
  - `feat: add twilio call status callback`

## Feature 9: OpenAI Classification

- [ ] Add an OpenAI client helper.
- [ ] Build `POST /api/classify`.
- [ ] Read `q1Answer`, plus optional q2/q3 context.
- [ ] Classify `medicineFlag` as `taken`, `missed`, or `unclear`.
- [ ] Classify `sentimentFlag` as `normal` or `concern`.
- [ ] Return stable JSON and update the `CallLog`.
- [ ] Trigger classification after the final TwiML step.
- Suggested commits:
  - `feat: add call answer classification`
  - `feat: wire classification into call completion`

## Feature 10: Trust And Consent

- [ ] Add onboarding consent copy and checkbox.
- [ ] Store consent acceptance timestamp.
- [ ] Add monthly security code to parent settings.
- [ ] Ask for security code before health questions.
- [ ] Do not block the prototype call loop on this unless required for judging.
- Suggested commits:
  - `feat: capture parent call consent`
  - `feat: add monthly security code verification`

## Feature 11: Custom Greeting And Questions

- [ ] Add parent-level custom greeting.
- [ ] Add parent-level custom questions.
- [ ] Replace fixed question constants only after the prototype is stable.
- [ ] Keep sensible defaults for fast onboarding.
- Suggested commits:
  - `feat: add custom parent greeting`
  - `feat: add configurable call questions`

## Feature 12: Retry, Notifications, And Escalation

- [ ] Add retry scheduling for no-answer calls.
- [ ] Add SMS notification hooks.
- [ ] Add email notification hooks.
- [ ] Add push notification placeholder or integration.
- [ ] Add emergency contact model and escalation rules.
- Suggested commits:
  - `feat: add retry workflow for missed calls`
  - `feat: add caregiver notifications`
  - `feat: add emergency escalation contacts`

## Feature 13: Testing And Demo Readiness

- [ ] Test signup.
- [ ] Test login.
- [ ] Test parent creation.
- [ ] Test medicine creation.
- [ ] Test dashboard parent list.
- [ ] Test dashboard call history.
- [ ] Test outbound Twilio call.
- [ ] Test TwiML connect webhook through ngrok.
- [ ] Test all three spoken answers.
- [ ] Test classification.
- [ ] Record one successful full demo flow as fallback.
- Suggested commits:
  - `test: add smoke tests for api routes`
  - `test: document manual demo checklist`

## Recommended Build Order

1. Project baseline.
2. Database schema and Prisma client.
3. Auth API and pages.
4. Parent and medicine onboarding.
5. Dashboard data and UI.
6. Static subscription page.
7. Twilio outbound call start.
8. TwiML three-question flow.
9. OpenAI classification.
10. Status callback and cancellation.
11. Consent and monthly security code.
12. Custom greeting/questions.
13. Retry, notifications, escalation, and analytics.
