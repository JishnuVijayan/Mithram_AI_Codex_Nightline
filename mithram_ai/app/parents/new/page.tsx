"use client";

import { AppShell } from "@/app/components/AppShell";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type CallFrequency = "1x_day" | "2x_day" | "3x_day";

export default function NewParentPage() {
  const router = useRouter();
  const [userId] = useState(() =>
    typeof window === "undefined"
      ? ""
      : localStorage.getItem("mithram_user_id") ?? "",
  );
  const [error, setError] = useState("");
  const [callFrequency, setCallFrequency] =
    useState<CallFrequency>("1x_day");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) {
      router.push("/login");
    }
  }, [router, userId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const callTimes = formData
      .getAll("callTimes")
      .map((value) => String(value))
      .filter(Boolean)
      .join(",");

    const parentResponse = await fetch("/api/parents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        name: formData.get("name"),
        phoneNumber: formData.get("phoneNumber"),
        relation: formData.get("relation"),
        preferredLanguage: formData.get("preferredLanguage"),
        callFrequency: formData.get("callFrequency"),
        callTimes,
        retryCount: Number(formData.get("retryCount") || 0),
        retryGapMinutes: Number(formData.get("retryGapMinutes") || 15),
        notifySms: formData.has("notifySms"),
        notifyEmail: formData.has("notifyEmail"),
        notifyPush: formData.has("notifyPush"),
        callEmergency: formData.has("callEmergency"),
        emergencyName: formData.get("emergencyName"),
        emergencyRelation: formData.get("emergencyRelation"),
        emergencyPhone: formData.get("emergencyPhone"),
      }),
    });
    const parentPayload = await parentResponse.json();

    if (!parentResponse.ok) {
      setError(parentPayload.error ?? "Could not save parent");
      setIsSubmitting(false);
      return;
    }

    const medicineResponse = await fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentId: parentPayload.parentId,
        name: formData.get("medicineName"),
        dosage: formData.get("dosage"),
        timeOfDay: formData.get("timeOfDay"),
      }),
    });
    const medicinePayload = await medicineResponse.json();
    setIsSubmitting(false);

    if (!medicineResponse.ok) {
      setError(medicinePayload.error ?? "Parent saved, medicine failed");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Add parent</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Save the elder profile and one medicine so the first call can ask the
          fixed wellness questions.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-md border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-base font-semibold">Parent details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" required />
          <Field label="Phone number" name="phoneNumber" required />
          <Field
            label="Relation"
            name="relation"
            placeholder="Mother"
            required
          />

          <label
            className="block text-sm font-medium"
            htmlFor="preferredLanguage"
          >
            Preferred language
            <select
              id="preferredLanguage"
              name="preferredLanguage"
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-teal-700"
              defaultValue="English"
            >
              <option value="English">English</option>
              <option value="Malayalam">Malayalam</option>
            </select>
          </label>

          <label className="block text-sm font-medium" htmlFor="callFrequency">
            Call frequency
            <select
              id="callFrequency"
              name="callFrequency"
              value={callFrequency}
              onChange={(event) =>
                setCallFrequency(event.target.value as CallFrequency)
              }
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-teal-700"
            >
              <option value="1x_day">Once daily</option>
              <option value="2x_day">Twice daily</option>
              <option value="3x_day">Three times daily</option>
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {callFrequency === "1x_day" ? (
            <Field label="Call time" name="callTimes" type="time" required />
          ) : callFrequency === "2x_day" ? (
            <>
              <Field
                label="Morning call"
                name="callTimes"
                type="time"
                required
              />
              <Field
                label="Evening call"
                name="callTimes"
                type="time"
                required
              />
            </>
          ) : (
            <>
              <Field
                label="Morning call"
                name="callTimes"
                type="time"
                required
              />
              <Field
                label="Afternoon call"
                name="callTimes"
                type="time"
                required
              />
              <Field
                label="Evening call"
                name="callTimes"
                type="time"
                required
              />
            </>
          )}
        </div>

        <h2 className="mt-8 text-base font-semibold">Medicine</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field
            label="Medicine"
            name="medicineName"
            placeholder="BP tablet"
            required
          />
          <Field label="Dosage" name="dosage" placeholder="1 tablet" required />
          <Field label="Time" name="timeOfDay" type="time" required />
        </div>

        <h2 className="mt-8 text-base font-semibold">
          Escalation management
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium" htmlFor="retryCount">
            Retry count after no answer
            <select
              id="retryCount"
              name="retryCount"
              defaultValue="2"
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-teal-700"
            >
              <option value="0">No retries</option>
              <option value="1">1 retry</option>
              <option value="2">2 retries</option>
              <option value="3">3 retries</option>
              <option value="5">5 retries</option>
            </select>
          </label>

          <label
            className="block text-sm font-medium"
            htmlFor="retryGapMinutes"
          >
            Gap between retries
            <select
              id="retryGapMinutes"
              name="retryGapMinutes"
              defaultValue="15"
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-teal-700"
            >
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </label>
        </div>

        <div className="mt-4 rounded-md border border-zinc-200 p-4">
          <p className="text-sm font-medium">Notification rules</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Checkbox
              label="Send SMS after each failed attempt"
              name="notifySms"
              defaultChecked
            />
            <Checkbox label="Send email alert" name="notifyEmail" />
            <Checkbox label="Send push notification" name="notifyPush" />
            <Checkbox
              label="Call emergency contact after all retries fail"
              name="callEmergency"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field
            label="Emergency contact"
            name="emergencyName"
            placeholder="Akhil"
          />
          <Field
            label="Relation"
            name="emergencyRelation"
            placeholder="Son"
          />
          <Field
            label="Emergency phone"
            name="emergencyPhone"
            placeholder="+91..."
          />
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={!userId || isSubmitting}
          className="mt-6 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isSubmitting ? "Saving..." : "Save parent"}
        </button>
      </form>
    </AppShell>
  );
}

function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 text-sm text-zinc-700">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 rounded border-zinc-300 text-teal-700"
      />
      <span>{label}</span>
    </label>
  );
}

type FieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
};

function Field({
  label,
  name,
  placeholder,
  required,
  type = "text",
}: FieldProps) {
  return (
    <label className="block text-sm font-medium" htmlFor={name}>
      {label}
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
        className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-normal outline-none focus:border-teal-700"
      />
    </label>
  );
}
