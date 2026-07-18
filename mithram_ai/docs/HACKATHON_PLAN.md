# Mithram AI — 2-Hour Hackathon Prototype Plan
### Codex Nightline, Kochi Metro | Scope: prove the core loop works, fake everything else

---

## 1. What "done" looks like

A judge should be able to watch:
1. You add a parent's details through a real form (saved to a real DB).
2. You tap "Start Call."
3. Your own phone rings, live, on stage.
4. You answer 3 questions as if you were the parent.
5. The dashboard updates with the transcript and a flag ("medicine taken / missed").

Everything else — subscription page, settings, polished dashboard charts — is **look-and-feel only**. Don't spend build minutes there.

---

## 2. Before You Board — do this today, not on the train

This is account admin, not coding. It involves SMS/email verification loops that will waste live-build time if left for the sprint.

- [ ] Create a **Twilio** trial account.
- [ ] Verify **your own personal mobile number** in the Twilio console (SMS or call-based verification, ~5 min). Trial accounts can only call verified numbers — this is a feature for your demo, not a limitation.
- [ ] Note your Twilio **Account SID**, **Auth Token**, and trial phone number.
- [ ] Create an **OpenAI API key** (for the classification step in section 5).
- [ ] Install **ngrok** locally and confirm it runs (you'll need a public URL for Twilio to call back into your local server).
- [ ] Confirm with organizers whether pre-configured accounts/keys are allowed before the sprint starts — most hackathons are fine with infra setup, just not pre-written app code, but check the Codex Nightline rules specifically.
- [ ] Test your ngrok tunnel over a mobile hotspot once, if possible — this is the single most likely point of live failure on a moving train.

---

## 3. Tech Stack (fastest path for a solo 2-hour build)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js** | Frontend + backend API routes in one project — no separate server to run/deploy, less context-switching for Codex agent. |
| Database | **SQLite** (via Prisma or better-sqlite3) | Zero external setup, file-based, no network dependency. Keeps your DB working even if train wifi drops — only the call feature needs live internet. |
| Auth | Plain email/password stored in DB | Not secure — that's fine, this is a demo. Say so if asked. |
| Telephony | **Twilio Programmable Voice** | `<Say>` handles text-to-speech, `<Gather input="speech">` handles speech-to-text automatically — you don't need to integrate a separate STT/TTS service at all. This is the biggest scope-saver in the whole build. |
| Tunnel | **ngrok** | Exposes your local server so Twilio's webhooks can reach it. |
| AI classification | **OpenAI API** (one call per response) | After each answer is transcribed, send it to classify "medicine: taken / missed / unclear" and flag sentiment. This is the one place actual AI reasoning happens beyond Twilio's built-in transcription — it's what makes the demo look like "AI noticing," not just an IVR menu. Also satisfies the "must use OpenAI's ecosystem" requirement at the app level, not just as your coding tool. |

---

## 4. Database Schema (fields only)

**users** (the children who sign up)
`id, name, email, password, phone, created_at`

**parents**
`id, user_id (FK), name, phone_number, relation, preferred_language, created_at`

**medicines**
`id, parent_id (FK), name, dosage, time_of_day, created_at`

**call_logs**
`id, parent_id (FK), call_datetime, status (answered / no_answer), q1_answer, q2_answer, q3_answer, medicine_flag (taken / missed / unclear), sentiment_flag, created_at`

Keep `q1/q2/q3` as separate columns rather than one JSON blob — faster to display directly in a dashboard table with no parsing step.

---

## 5. Screens — what actually needs to work

| Screen | Status | Notes |
|---|---|---|
| Login / Signup | **Working** | POST `/api/signup`, POST `/api/login` |
| Add Parent | **Working** | Form → POST `/api/parents` |
| Add Medicine | **Working** | Form → POST `/api/medicines` (can live on the same page as Add Parent) |
| Dashboard | **Partially working** | Parent list + call log table must pull real data via GET. Streaks, charts, "wellbeing score" widgets can be static/fake. |
| Subscription / Pricing | **Static only** | No backend. Pure UI. |
| "Start Call" button | **Working** | On a parent's row → POST `/api/calls/start` → triggers Twilio |

---

## 6. The Call Flow (this is the core demo — describe, not code)

1. You tap **Start Call** → your backend calls the Twilio Voice API → Twilio places an outbound call to your verified personal number.
2. When you answer, Twilio requests instructions from your webhook URL (exposed via ngrok).
3. Your webhook returns TwiML:
   - `<Say>` — greeting ("Hello Amma, this is Mithram calling to check in today.")
   - `<Gather input="speech" action="/webhook/q1">` — asks Question 1, waits, transcribes your spoken answer automatically, POSTs the transcript back to your server.
4. Your server saves the Q1 answer to `call_logs`, then returns the next TwiML block for Q2 → repeat for Q3.
5. After all 3 answers, one `<Say>` closing line, then hang up.
6. On each saved answer (or after the call ends), send the medicine-related answer to OpenAI for a quick taken/missed/unclear classification, save alongside the transcript.
7. Dashboard's call log table fetches this row live — this is what the judges watch update in real time.

**The 3 predefined questions** (hardcode these, no need for a UI to configure them today):
1. "Did you take your morning BP medicine?"
2. "Did you sleep well last night?"
3. "Do you need anything today, or have any appointments coming up?"

---

## 7. Time Budget (2 hours)

| Time | Task |
|---|---|
| 0:00–0:15 | Scaffold Next.js project, set up SQLite schema, confirm Twilio + ngrok + OpenAI keys work with a test call/request |
| 0:15–0:40 | Backend: signup/login, add-parent, add-medicine POST APIs |
| 0:40–0:55 | Frontend: login form, add-parent form, wire both to APIs |
| 0:55–1:00 | Static shells: dashboard layout, subscription page |
| 1:00–1:40 | Twilio call flow: outbound call trigger, TwiML webhook, 3-question Gather loop, save to DB |
| 1:40–1:55 | Wire dashboard call-log table to real data; add OpenAI classification step |
| 1:55–2:00 | Buffer — test the full flow once end-to-end, rehearse what you'll say during the demo |

If you're behind at 1:40, cut the OpenAI classification step first — a working call-and-transcript loop matters more than the "taken/missed" flag for the demo to land.

---

## 8. Scaling Note (not tonight's build — just so you have an answer if judges ask)

Your personal number only works because it's a Twilio **trial** account calling a **verified** number. For real users:

- You'd need a production telephony provider with proper India compliance — **Exotel** or **Knowlarity** are more common than Twilio for India-specific voice-bot deployments, since they handle TRAI/DLT registration (required for any commercial/automated calling in India) out of the box.
- Twilio's built-in voices don't cover Malayalam well — a real product would need an Indic-language TTS/STT provider (e.g. Sarvam AI, AI4Bharat, or Google Cloud's Indic voice models).
- You'd also need the child's and parent's consent flow formalized, since this is automated calling to a third party (the parent), not just the signing-up user.

One sentence on this if asked is enough — don't over-invest here tonight.

---

## 9. Fallback Plan

- Screen-record one full successful call cycle **before** judging starts, in case ngrok/network drops mid-demo.
- If live call fails in front of judges, don't debug live — switch straight to the recording and narrate over it.
