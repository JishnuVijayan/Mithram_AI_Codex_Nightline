# Mithram AI — Agent Build Prompt
### Read this together with `mithram_2hr_prototype_plan.md`. That file explains *why*. This file tells you exactly *what to build, in what order, with what contracts*.

---

## Your task

Build a working prototype of **Mithram AI** — an app where a signed-up user adds an elderly parent's details, triggers a phone call to a real number, the call asks 3 fixed questions via voice, captures spoken answers, and displays them on a dashboard. You have a **2-hour time budget**. Prioritize a working end-to-end call loop over UI polish. Everything not explicitly marked "must work" below should be a static UI shell with no backend behind it.

---

## Hard constraints — do not deviate

- **Stack:** Next.js (App Router, JavaScript — skip TypeScript to save time) with API routes as the backend. SQLite as the database (Prisma or `better-sqlite3`, whichever you're faster with). Twilio Programmable Voice for the call. OpenAI API for one classification step. ngrok for the public webhook tunnel.
- **No real security.** Plaintext password compare is fine. Say so out loud if anyone asks — don't spend time on bcrypt.
- **No dynamic question configuration.** The 3 questions are hardcoded constants, not stored in the DB or editable via UI.
- **No multi-language / TTS voice selection.** English (or Manglish) via Twilio's default `<Say>` voice is fine for tonight.
- **No call retry / no-answer handling** unless everything below is done with time still remaining — see "Stretch goals" at the end.
- **Minimal styling.** Default Tailwind or plain CSS. Do not spend build minutes on visual design.

---

## Environment variables

```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=        # the Twilio trial number
MY_VERIFIED_NUMBER=         # the builder's personal number, verified in Twilio console
OPENAI_API_KEY=
NGROK_PUBLIC_URL=           # set this after starting ngrok — used as the base for all Twilio webhook callback URLs
DATABASE_URL=file:./dev.db  # if using Prisma
```

---

## Database schema

```
User
  id            (pk)
  name
  email
  password
  phone
  createdAt

Parent
  id                 (pk)
  userId             (fk -> User)
  name
  phoneNumber
  relation
  preferredLanguage  # "English" | "Malayalam"
  callFrequency      # "1x_day" | "3x_day"
  callTimes          # e.g. "09:00"
  createdAt

Medicine
  id          (pk)
  parentId    (fk -> Parent)
  name
  dosage
  timeOfDay
  createdAt

CallLog
  id             (pk)
  parentId       (fk -> Parent)
  callDatetime
  status         # "in_progress" | "answered" | "no_answer"
  q1Answer
  q2Answer
  q3Answer
  medicineFlag   # "taken" | "missed" | "unclear" | null
  sentimentFlag  # "normal" | "concern" | null
  createdAt
```

---

## Hardcoded questions (used by the call flow, not stored per-parent)

```js
const QUESTIONS_EN = [
  "Did you take your morning BP medicine?",
  "Did you sleep well last night?",
  "Do you need anything today, or have any appointments coming up?"
];

const QUESTIONS_ML = [
  "നിങ്ങൾ ഇന്ന് രാവിലെ ബിപി ഗുളിക കഴിച്ചോ?",
  "ഇന്നലെ രാത്രി നന്നായി ഉറങ്ങിയോ?",
  "ഇന്ന് എന്തെങ്കിലും ആവശ്യമുണ്ടോ, അല്ലെങ്കിൽ എന്തെങ്കിലും അപ്പോയിന്റ്മെന്റുകൾ ഉണ്ടോ?"
];

const GREETINGS = {
  English: "Hello, this is Mithram calling to check in on you today.",
  Malayalam: "ഹലോ, ഇത് മിത്രാം ആണ് വിളിക്കുന്നത്. നിങ്ങളുടെ ഇന്നത്തെ വിശേഷങ്ങൾ അന്വേഷിക്കാൻ വിളിച്ചതാണ്."
};

const GOODBYES = {
  English: "Thank you, take care, talk to you soon.",
  Malayalam: "വളരെ നന്ദി, സൂക്ഷിക്കുക, വീണ്ടും സംസാരിക്കാം."
};
```

---

## API routes — build these exactly

### App data routes

**POST `/api/signup`**
Request: `{ name, email, password, phone }` → creates a `User` row → response `{ userId }`

**POST `/api/login`**
Request: `{ email, password }` → plaintext compare → response `{ userId }` or `{ error }`

**POST `/api/parents`**
Request: `{ userId, name, phoneNumber, relation, preferredLanguage, callFrequency, callTimes }` → creates a `Parent` row → response `{ parentId }`

**POST `/api/medicines`**
Request: `{ parentId, name, dosage, timeOfDay }` → creates a `Medicine` row → response `{ medicineId }`

**GET `/api/parents/:userId`**
Returns all parents for that user, each with their most recent `CallLog` summary (for the dashboard list view)

**GET `/api/calls/:parentId`**
Returns all `CallLog` rows for that parent, most recent first (for the dashboard detail/transcript view)

### Call trigger

**POST `/api/calls/start`**
Request: `{ parentId }`
Steps:
1. Create a `CallLog` row with `status = "in_progress"` → get its `id` (`logId`)
2. Call Twilio: `client.calls.create({ to: MY_VERIFIED_NUMBER, from: TWILIO_PHONE_NUMBER, url: \`${NGROK_PUBLIC_URL}/api/twiml/connect?logId=${logId}\`, statusCallback: \`${NGROK_PUBLIC_URL}/api/twiml/status-callback?logId=${logId}\`, statusCallbackMethod: "POST", statusCallbackEvent: ["completed"] })`
   - Use `MY_VERIFIED_NUMBER` as the `to` value for tonight's demo, not the parent's stored number — that's what makes the phone actually ring on stage.
3. Response: `{ callSid, logId }`

### Twilio webhooks — these return TwiML (XML), not JSON

**POST `/api/twiml/connect?logId=X`**
Called automatically by Twilio the moment the call connects.
Steps:
1. Fetch parent's language from DB for this `logId`.
2. Select correct speech language (`en-IN` for English to use Indian accent, `ml-IN` for Malayalam).
3. Return TwiML:
```xml
<Response>
  <Say language="twilioLang">GREETINGS[language]</Say>
  <Gather input="speech" language="twilioLang" timeout="6" action="/api/twiml/step?logId=X&amp;step=1" method="POST">
    <Say language="twilioLang">QUESTIONS[language][0]</Say>
  </Gather>
</Response>
```

**POST `/api/twiml/step?logId=X&amp;step=N`**
Twilio posts here with a `SpeechResult` field containing the transcribed answer to question N.
Logic:
1. Read `SpeechResult` from the request body (may be empty if nothing was heard — save as `"(no response)"` in that case)
2. Save it to `CallLog.q{N}Answer` for the row matching `logId`
3. Fetch parent language (`en-IN` or `ml-IN`).
4. If `N < 3`: return TwiML with `<Gather>` asking `QUESTIONS[language][N]` (0-indexed), action pointing to `step=N+1`
5. If `N == 3`:
   - Set `CallLog.status = "answered"`
   - Fire-and-forget a call to `/api/classify` (below) with `logId`
   - Return TwiML with GOODBYES[language] and `<Hangup/>`

**POST `/api/twiml/status-callback?logId=X`**
Called by Twilio when call finishes. If `CallLog.status` is still `in_progress` (e.g. they hung up early or didn't answer), update `status` to `no_answer` or `answered` (if call completed).

### Classification (the one AI-reasoning step beyond Twilio's built-in transcription)

**POST `/api/classify`**
Request: `{ logId }`
Steps:
1. Read `q1Answer` (the medicine question) for that `CallLog` row
2. Call OpenAI with a prompt that can parse responses in English, Malayalam script, or Manglish (Roman script Malayalam), classify medicine as `taken` / `missed` / `unclear`, and tone as `normal` / `concern`. Update the `CallLog` flags in DB.

---

## Frontend pages

| Page | Must work? | Notes |
|---|---|---|
| `/login` | **Yes** | Form → `POST /api/login` |
| `/signup` | **Yes** | Form → `POST /api/signup` |
| `/parents/new` | **Yes** | Form (parent + medicine fields together is fine) → `POST /api/parents` then `POST /api/medicines` |
| `/dashboard` | **Yes (data), no (styling)** | List parents via `GET /api/parents/:userId`. Each row has a "Start Call" button → `POST /api/calls/start`. Clicking a parent shows their `CallLog` history via `GET /api/calls/:parentId` — real transcripts, real flags. |
| `/subscription` | **No** | Static JSX only. No fetch calls. Pricing tiers can be hardcoded placeholder text. |

---

## Build order (follow this sequence — don't jump ahead)

1. Scaffold Next.js project, set up the DB schema, run migration, confirm you can read/write a test row
2. Confirm Twilio, ngrok, and OpenAI keys all work in isolation (one test call, one test tunnel, one test API call) — do this before writing app logic
3. Build `/api/signup`, `/api/login`, `/login`, `/signup` pages
4. Build `/api/parents`, `/api/medicines`, `/parents/new` page
5. Build `/dashboard` shell + `/subscription` static page
6. Build `/api/calls/start`, `/api/twiml/connect`, `/api/twiml/step` — test with a real call to your own phone
7. Wire `/api/classify` into the end of the call flow
8. Connect dashboard's call log view to real data
9. Run the full flow once, end to end, before you consider it done

---

## Stretch goals — only if everything above works with time left

- Handle Twilio's call status callback (`no-answer`, `busy`, `failed`) and set `CallLog.status` accordingly
- Add a `sentimentFlag`-based visual indicator (colored dot) on the dashboard
- Add a basic "streak" count of consecutive calls answered

Do not start these until the core loop (sections above) is fully working and tested.



### Database Schema Updates (for Parent and CallLog)
Parent
  id                 (pk)
  userId             (fk -> User)
  name
  phoneNumber
  relation
  preferredLanguage  # "English" | "Malayalam"
  callFrequency      # "1x_day" | "3x_day"
  callTimes          # e.g. "09:00"
  createdAt

CallLog
  id             (pk)
  parentId       (fk -> Parent)
  callDatetime
  status         # "in_progress" | "answered" | "no_answer"
  callSid        # Save twilio call.sid here on create
  q1Answer
  q2Answer
  q3Answer
  medicineFlag   # "taken" | "missed" | "unclear" | null
  sentimentFlag  # "normal" | "concern" | null
  createdAt

---

### PREDEFINED QUESTIONS & TRANSLATIONS
const QUESTIONS_EN = [
  "Did you take your morning BP medicine?",
  "Did you sleep well last night?",
  "Do you need anything today, or have any appointments coming up?"
];

const QUESTIONS_ML = [
  "നിങ്ങൾ ഇന്ന് രാവിലെ ബിപി ഗുളിക കഴിച്ചോ?",
  "ഇന്നലെ രാത്രി നന്നായി ഉറങ്ങിയോ?",
  "ഇന്ന് എന്തെങ്കിലും ആവശ്യമുണ്ടോ, അല്ലെങ്കിൽ എന്തെങ്കിലും അപ്പോയിന്റ്മെന്റുകൾ ഉണ്ടോ?"
];

const GREETINGS = {
  English: "Hello, this is Mithram calling to check in on you today.",
  Malayalam: "ഹലോ, ഇത് മിത്രാം ആണ് വിളിക്കുന്നത്. നിങ്ങളുടെ ഇന്നത്തെ വിശേഷങ്ങൾ അന്വേഷിക്കാൻ വിളിച്ചതാണ്."
};

const GOODBYES = {
  English: "Thank you, take care, talk to you soon.",
  Malayalam: "വളരെ നന്ദി, സൂക്ഷിക്കുക, വീണ്ടും സംസാരിക്കാം."
};

---

### NEW & UPDATED WEBHOOK HANDLERS

1. **POST `/api/calls/cancel`**
   - Retrieve active log with status "in_progress" for parent.
   - Terminate active call: `client.calls(callSid).update({ status: 'completed' })`.
   - Set database status to "no_answer".

2. **POST `/api/twiml/connect?logId=X`**
   - Retrieve parent preferredLanguage.
   - Set Twilio Say/Gather language: `ml-IN` for Malayalam, `en-IN` (Indian English accent) for English.
   - Return greeting and first question in the selected language.

3. **POST `/api/twiml/status-callback?logId=X`**
   - Listens to Twilio callbacks. If status is in_progress, update status to "no_answer" or "answered" depending on call outcome.

---

# Appendix: Development Notes & Known Issues

. Next.js Directory Naming Conflict
Bug: Creating a Next.js project with npx create-next-app inside the ./ directory failed with: Could not create a project called "Try" because of npm naming restrictions: name can no longer contain capital letters.
Fix: Initialized the Next.js app inside a temporary lowercase directory (mithram-ai) and moved all structural configurations (src/, public/, package.json, etc.) to the root directory, cleaning up the subdirectory afterward.

## 2. Prisma v7 Configuration and SQLite Connection deprecation
Bug: In Prisma 7+, defining url = env("DATABASE_URL") directly inside schema.prisma is deprecated, throwing validation error P1012. Resolving it natively requires setting up TypeScript/JavaScript driver adapters (like better-sqlite3), which introduces heavy native compilation dependencies.
Fix: Downgraded the database packages to prisma@6.2.1 and @prisma/client@6.2.1. This allowed us to keep the lightweight, zero-dependency native SQLite driver and restore the url connection parameter inside 

schema.prisma
 cleanly.

## 3. Turbopack / Webpack dev HMR Tunnel Blocks (WebSocket 503)
Bug: When running the local development server and accessing the browser via the public ngrok address, the console was flooded with WebSocket connection to wss://.../_next/webpack-hmr failed: Unexpected response code: 503 because Turbopack HMR websockets don't resolve cleanly over ngrok's proxy layers.
Fix:
Configured 

next.config.mjs
 to filter out ReactRefreshWebpackPlugin inside development webpack targets to disable ngrok dev proxy socket constraints.
Declared an empty turbopack: {} block in Next configuration options to silence Turbopack custom Webpack checker errors in Next.js 16.
Suggested working on http://localhost:3000 for browser sessions (where local HMR works normally) while keeping ngrok tunneling active in the background exclusively for Twilio's incoming webhooks.

## 4. Silent Call Disconnects / Silence on Malayalam Speech synthesis
Bug: Passing language="ml-IN" inside <Say> and <Gather> caused the outbound call to silently skip speaking audio and drop the line after 6 seconds. This happens because Twilio does not natively enable the regional Malayalam neural voice module on free trial accounts.
Fix:
Updated the Malayalam greeting and question prompts in 

src/lib/questions.js
 to Manglish (Malayalam written using the English alphabet).
Locked the output language parameter to en-IN (Indian English accent) in the connect and step routes. This forces Twilio to speak the Manglish prompts with a realistic local Indian accent on the free tier.
Increased speech timeouts to 10 seconds, set speechTimeout="auto", and implemented a dynamic retry <Redirect> loop to repeat the prompt if silence is encountered.

## 5. Hanging "Calling..." state on the Dashboard
Bug: If the user hung up early or didn't answer, the call log state was left as in_progress, causing the dashboard screen to stay permanently stuck on Calling....
Fix: Registered /api/twiml/status-callback with Twilio. Twilio automatically alerts this webhook when a call completes or fails, updating the database status from in_progress to answered or no_answer to release the UI state.

## 6. Cancel Call failing with "No active in-progress call found"
Bug: Clicking the "Cancel Call" button for a call triggered before the database schema updates occurred threw an error because the log row was missing a callSid.
Fix: Optimized the cancel call endpoint in 

route.js
 to immediately update the local database state to no_answer to clear the screen, then gracefully check for and cancel callSid on Twilio only if it is present.

---

# Feature Update: Intelligent Retry, Escalation & Privacy

## Parent Registration Enhancements

When adding a parent, extend the form with the following configurable fields.

### Retry Configuration

```text
Retry Count
- 0
- 1
- 2
- 3
- 5

Retry Gap
- Number of minutes between retries
Example: 5, 10, 15 minutes
```

### Notification & Escalation Rules

Allow the user to dynamically configure what should happen after each failed call attempt.

Example workflow:

```
Attempt 1
↓
No Answer
↓
Send SMS ✅

Attempt 2
↓
No Answer
↓
Send Push Notification ✅

Attempt 3
↓
No Answer
↓
Send Email ✅

Final Retry Failed
↓
Automatically call emergency contact (Son/Daughter)
```

The user should be able to enable or disable each action independently.

Available actions:

- Send SMS
- Send Email
- Send Push Notification
- Automatically Call Emergency Contact

## Emergency Contact

Allow users to register one or more emergency contacts.

Example fields:

```
Emergency Contact Name
Relationship
Phone Number
Email
```

Primary use case:

- Son
- Daughter
- Relative
- Caretaker

If every retry fails, the system should automatically place a phone call to the configured emergency contact.

This is a configurable option and can be turned ON or OFF.

---

## Database Updates

### Parent

Add the following fields:

```
retryCount
retryGapMinutes

notifyBySMS
notifyByEmail
notifyByPush
callEmergencyContact

privacyConsent
dataProcessingConsent
```

### EmergencyContact

```
id
parentId
name
relationship
phoneNumber
email
createdAt
```

---

## Dashboard

Display:

- Retry count configured
- Retry interval
- Emergency contact status
- Last notification sent
- Escalation status
- Final outcome

---

## Privacy & Consent

Before completing registration, display a mandatory consent dialog.

The user must explicitly agree before saving data.

Example message:

> **Your Privacy Matters**
>
> Mithram securely stores the information required to provide health check-in services for your loved ones.
>
> Your personal data is never sold or shared with third parties for advertising or commercial purposes.
>
> Information is used only to provide reminders, wellness monitoring, emergency escalation, and service improvements.
>
> By continuing, you consent to securely storing and processing this information for these purposes.

Required checkbox:

```
☑ I understand and consent to securely storing this data for providing Mithram services.
```

Registration should not continue until consent has been provided.
