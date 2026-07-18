"use client";

import { PasswordInput } from "@/app/components/PasswordInput";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Login failed");
      return;
    }

    localStorage.setItem("mithram_user_id", payload.userId);
    router.push("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-100 px-4 text-zinc-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-md border border-zinc-300 bg-white p-6 shadow-sm"
      >
        <div className="mb-6">
          <p className="text-sm font-medium text-teal-700">Mithram AI</p>
          <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Continue to your elder wellness dashboard.
          </p>
        </div>

        <label className="block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-teal-700"
        />

        <label className="mt-4 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <PasswordInput id="password" name="password" required />

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-600">
          No account?{" "}
          <Link href="/signup" className="font-medium text-teal-700">
            Create one
          </Link>
        </p>
      </form>
    </main>
  );
}
