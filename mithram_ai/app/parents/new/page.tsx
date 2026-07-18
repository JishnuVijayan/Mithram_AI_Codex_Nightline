"use client";

import { AppShell } from "@/app/components/AppShell";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function NewParentPage() {
  const router = useRouter();
  const [userId] = useState(() =>
    typeof window === "undefined"
      ? ""
      : localStorage.getItem("mithram_user_id") ?? "",
  );
  const [error, setError] = useState("");
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
        callTimes: formData.get("callTimes"),
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
          <Field label="Relation" name="relation" placeholder="Mother" required />

          <label className="block text-sm font-medium" htmlFor="preferredLanguage">
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
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-teal-700"
              defaultValue="1x_day"
            >
              <option value="1x_day">Once daily</option>
              <option value="3x_day">Three times daily</option>
            </select>
          </label>

          <Field label="Call time" name="callTimes" type="time" required />
        </div>

        <h2 className="mt-8 text-base font-semibold">Medicine</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Medicine" name="medicineName" placeholder="BP tablet" required />
          <Field label="Dosage" name="dosage" placeholder="1 tablet" required />
          <Field label="Time" name="timeOfDay" type="time" required />
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
