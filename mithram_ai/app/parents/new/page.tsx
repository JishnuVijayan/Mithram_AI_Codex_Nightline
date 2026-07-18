"use client";

import { AppShell } from "@/app/components/AppShell";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type CallFrequency = "1x_day" | "2x_day" | "3x_day";

type MedicineRow = {
  id: number;
};

type QuestionRow = {
  id: number;
};

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
  const [medicineRows, setMedicineRows] = useState<MedicineRow[]>([{ id: 1 }]);
  const [questionRows, setQuestionRows] = useState<QuestionRow[]>([]);
  const [hasSecurityCodeExpiry, setHasSecurityCodeExpiry] = useState(true);
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
    const customQuestions = questionRows
      .map((row) => String(formData.get(`customQuestion-${row.id}`) || ""))
      .filter(Boolean)
      .join("\n");
    const securityCode = String(formData.get("securityCode") || "").trim();
    const securityCodeExpiresAt =
      hasSecurityCodeExpiry && securityCode
        ? formData.get("securityCodeExpiresAt")
        : null;

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
        customQuestions,
        securityCode,
        securityCodeExpiresAt,
      }),
    });
    const parentPayload = await parentResponse.json();

    if (!parentResponse.ok) {
      setError(parentPayload.error ?? "Could not save parent");
      setIsSubmitting(false);
      return;
    }

    const medicineRequests = medicineRows.map((row) =>
      fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: parentPayload.parentId,
          name: formData.get(`medicineName-${row.id}`),
          dosage: formData.get(`dosage-${row.id}`),
          timeOfDay: formData.get(`timeOfDay-${row.id}`),
        }),
      }),
    );
    const medicineResponses = await Promise.all(medicineRequests);
    const failedMedicine = medicineResponses.find((response) => !response.ok);
    setIsSubmitting(false);

    if (failedMedicine) {
      const medicinePayload = await failedMedicine.json();
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

        <div className="mt-8 flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">Medicines</h2>
          <button
            type="button"
            onClick={() =>
              setMedicineRows((rows) => [...rows, { id: Date.now() }])
            }
            className="rounded-md border border-teal-700 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50"
          >
            Add medicine
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {medicineRows.map((row, index) => (
            <div
              key={row.id}
              className="rounded-md border border-zinc-200 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium">Medicine {index + 1}</p>
                {medicineRows.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setMedicineRows((rows) =>
                        rows.filter((item) => item.id !== row.id),
                      )
                    }
                    className="text-sm font-medium text-rose-700 hover:text-rose-900"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Field
                  label="Medicine"
                  name={`medicineName-${row.id}`}
                  placeholder="BP tablet"
                  required
                />
                <Field
                  label="Dosage"
                  name={`dosage-${row.id}`}
                  placeholder="1 tablet"
                  required
                />
                <Field
                  label="Time"
                  name={`timeOfDay-${row.id}`}
                  type="time"
                  required
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Custom questions</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Saved for future configurable call flows. The current live call
              still uses the fixed demo questions.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setQuestionRows((rows) => [...rows, { id: Date.now() }])
            }
            className="rounded-md border border-teal-700 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50"
          >
            Add question
          </button>
        </div>

        {questionRows.length > 0 ? (
          <div className="mt-4 space-y-3">
            {questionRows.map((row, index) => (
              <div key={row.id} className="flex items-start gap-3">
                <label
                  className="block flex-1 text-sm font-medium"
                  htmlFor={`customQuestion-${row.id}`}
                >
                  Question {index + 1}
                  <input
                    id={`customQuestion-${row.id}`}
                    name={`customQuestion-${row.id}`}
                    placeholder="Example: Did you have breakfast?"
                    className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-normal outline-none focus:border-teal-700"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setQuestionRows((rows) =>
                      rows.filter((item) => item.id !== row.id),
                    )
                  }
                  className="mt-8 text-sm font-medium text-rose-700 hover:text-rose-900"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <h2 className="mt-8 text-base font-semibold">Call security code</h2>
        <div className="mt-4 rounded-md border border-zinc-200 p-4">
          <p className="text-sm text-zinc-600">
            Mithram will speak this code at the start of the call so your parent
            can recognize that the call is genuine.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Security code"
              name="securityCode"
              placeholder="Example: AMMA-24"
            />
            <label
              className="block text-sm font-medium"
              htmlFor="securityCodeExpiresAt"
            >
              Valid until
              <input
                id="securityCodeExpiresAt"
                name="securityCodeExpiresAt"
                type="date"
                disabled={!hasSecurityCodeExpiry}
                defaultValue={getDefaultSecurityCodeExpiry()}
                className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-normal outline-none disabled:bg-zinc-100 disabled:text-zinc-400 focus:border-teal-700"
              />
            </label>
          </div>
          <Checkbox
            label="Expire this code after one month"
            name="securityCodeHasExpiry"
            defaultChecked
            onChange={(checked) => setHasSecurityCodeExpiry(checked)}
          />
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
  onChange,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 text-sm text-zinc-700">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        onChange={(event) => onChange?.(event.target.checked)}
        className="mt-0.5 size-4 rounded border-zinc-300 text-teal-700"
      />
      <span>{label}</span>
    </label>
  );
}

function getDefaultSecurityCodeExpiry() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);

  return date.toISOString().slice(0, 10);
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
