"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { AppShell } from "@/app/components/AppShell";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type CallLog = {
  id: string;
  callDatetime: string;
  status: string;
  q1Answer: string | null;
  q2Answer: string | null;
  q3Answer: string | null;
  medicineFlag: string | null;
  sentimentFlag: string | null;
};

type Parent = {
  id: string;
  name: string;
  relation: string;
  phoneNumber: string;
  preferredLanguage: string;
  retryCount: number;
  retryGapMinutes: number;
  notifySms: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
  callEmergency: boolean;
  emergencyName: string | null;
  emergencyRelation: string | null;
  emergencyPhone: string | null;
  latestCall: CallLog | null;
};

type DashboardStats = {
  totalParents: number;
  totalCalls: number;
  attendedCalls: number;
  unattendedCalls: number;
  activeCalls: number;
};

const emptyStats: DashboardStats = {
  totalParents: 0,
  totalCalls: 0,
  attendedCalls: 0,
  unattendedCalls: 0,
  activeCalls: 0,
};

export default function DashboardPage() {
  const router = useRouter();
  const [userId] = useState(() =>
    typeof window === "undefined"
      ? ""
      : localStorage.getItem("mithram_user_id") ?? "",
  );
  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingCall, setIsStartingCall] = useState(false);

  const loadParents = useCallback(async (nextUserId: string) => {
    setIsLoading(true);
    const [parentsResponse, statsResponse] = await Promise.all([
      fetch(`/api/parents/${nextUserId}`),
      fetch(`/api/dashboard/${nextUserId}`),
    ]);
    const payload = await parentsResponse.json();
    const statsPayload = await statsResponse.json();
    const nextParents = payload.parents ?? [];

    setParents(nextParents);
    setStats(statsPayload.stats ?? emptyStats);
    setSelectedParentId((current) => current || nextParents[0]?.id || "");
    setIsLoading(false);
  }, []);

  const loadCalls = useCallback(async (parentId: string) => {
    const response = await fetch(`/api/calls/${parentId}`);
    const payload = await response.json();
    setCalls(payload.calls ?? []);
  }, []);

  useEffect(() => {
    if (!userId) {
      router.push("/login");
      return;
    }

    loadParents(userId);
  }, [loadParents, router, userId]);

  useEffect(() => {
    if (!selectedParentId) return;

    loadCalls(selectedParentId);
  }, [loadCalls, selectedParentId]);

  async function startCall(parentId: string) {
    setMessage("");
    setIsStartingCall(true);

    const response = await fetch("/api/calls/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId }),
    });
    const payload = await response.json();
    setIsStartingCall(false);

    if (!response.ok) {
      setMessage(payload.error ?? "Could not start call");
      return;
    }

    setMessage(`Call started: ${payload.callSid}`);
    await loadCalls(parentId);
    if (userId) {
      await loadParents(userId);
    }
  }

  const selectedParent = parents.find((parent) => parent.id === selectedParentId);

  return (
    <AppShell>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Track check-in calls, transcripts, and AI flags.
          </p>
        </div>
        <Link
          href="/parents/new"
          className="inline-flex rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white"
        >
          Add parent
        </Link>
      </div>

      {message ? (
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {message}
        </p>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Parents" value={stats.totalParents} />
        <KpiCard label="Total calls" value={stats.totalCalls} />
        <KpiCard label="Attended" value={stats.attendedCalls} tone="good" />
        <KpiCard
          label="Unattended"
          value={stats.unattendedCalls}
          tone="alert"
        />
        <KpiCard label="In progress" value={stats.activeCalls} tone="active" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold">Parents</h2>

          {isLoading ? (
            <p className="mt-4 text-sm text-zinc-600">Loading...</p>
          ) : parents.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600">
              No parents yet. Add one to start the call flow.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {parents.map((parent) => (
                <button
                  key={parent.id}
                  type="button"
                  onClick={() => setSelectedParentId(parent.id)}
                  className={`w-full rounded-md border p-4 text-left ${
                    parent.id === selectedParentId
                      ? "border-teal-700 bg-teal-50"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  <span className="block font-medium">{parent.name}</span>
                  <span className="mt-1 block text-sm text-zinc-600">
                    {parent.relation} · {parent.preferredLanguage}
                  </span>
                  <span className="mt-2 block text-xs text-zinc-500">
                    Latest: {parent.latestCall?.status ?? "No calls yet"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold">
                {selectedParent?.name ?? "Call history"}
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                {selectedParent
                  ? `${selectedParent.phoneNumber} · ${selectedParent.relation}`
                  : "Choose a parent to inspect transcripts."}
              </p>
              {selectedParent ? (
                <p className="mt-2 text-xs text-zinc-500">
                  Retry {selectedParent.retryCount} time
                  {selectedParent.retryCount === 1 ? "" : "s"} every{" "}
                  {selectedParent.retryGapMinutes} min · Escalation{" "}
                  {selectedParent.callEmergency ? "enabled" : "off"}
                </p>
              ) : null}
            </div>

            {selectedParent ? (
              <button
                type="button"
                onClick={() => startCall(selectedParent.id)}
                disabled={isStartingCall}
                className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {isStartingCall ? "Starting..." : "Start Call"}
              </button>
            ) : null}
          </div>

          <div className="mt-6 space-y-4">
            {selectedParent ? (
              <section className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <h3 className="text-sm font-semibold">
                  Retry and escalation status
                </h3>
                <div className="mt-3 grid gap-3 text-sm text-zinc-700 sm:grid-cols-2">
                  <p>
                    Failed-call retries:{" "}
                    <span className="font-medium text-zinc-950">
                      {selectedParent.retryCount}
                    </span>
                  </p>
                  <p>
                    Retry gap:{" "}
                    <span className="font-medium text-zinc-950">
                      {selectedParent.retryGapMinutes} minutes
                    </span>
                  </p>
                  <p>
                    Notifications:{" "}
                    <span className="font-medium text-zinc-950">
                      {[
                        selectedParent.notifySms ? "SMS" : null,
                        selectedParent.notifyEmail ? "Email" : null,
                        selectedParent.notifyPush ? "Push" : null,
                      ]
                        .filter(Boolean)
                        .join(", ") || "None"}
                    </span>
                  </p>
                  <p>
                    Emergency contact:{" "}
                    <span className="font-medium text-zinc-950">
                      {selectedParent.emergencyName
                        ? `${selectedParent.emergencyName} (${selectedParent.emergencyRelation || "Contact"})`
                        : "Not configured"}
                    </span>
                  </p>
                </div>
              </section>
            ) : null}

            {calls.length === 0 ? (
              <p className="text-sm text-zinc-600">No call logs yet.</p>
            ) : (
              calls.map((call) => (
                <article
                  key={call.id}
                  className="rounded-md border border-zinc-200 p-4"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <div>
                      <p className="font-medium">{call.status}</p>
                      <p className="text-sm text-zinc-600">
                        {new Date(call.callDatetime).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-zinc-700">
                      Medicine: {call.medicineFlag ?? "pending"} · Sentiment:{" "}
                      {call.sentimentFlag ?? "pending"}
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm">
                    <TranscriptQuestion
                      label="Medicine"
                      answer={call.q1Answer}
                    />
                    <TranscriptQuestion label="Sleep" answer={call.q2Answer} />
                    <TranscriptQuestion label="Needs" answer={call.q3Answer} />
                  </dl>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function KpiCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "good" | "alert" | "active";
}) {
  const toneClass = {
    neutral: "border-zinc-200 bg-white text-zinc-950",
    good: "border-emerald-200 bg-emerald-50 text-emerald-950",
    alert: "border-rose-200 bg-rose-50 text-rose-950",
    active: "border-amber-200 bg-amber-50 text-amber-950",
  }[tone];

  return (
    <article className={`rounded-md border p-4 shadow-sm ${toneClass}`}>
      <p className="text-sm font-medium text-current/70">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </article>
  );
}

function TranscriptQuestion({
  label,
  answer,
}: {
  label: string;
  answer: string | null;
}) {
  return (
    <div>
      <dt className="font-medium text-zinc-700">{label}</dt>
      <dd className="mt-1 text-zinc-600">
        {answer ?? "No transcript or keypad answer captured yet"}
      </dd>
    </div>
  );
}
