import { AppShell } from "@/app/components/AppShell";
import Link from "next/link";

const tiers = [
  {
    name: "Trial",
    price: "₹0",
    detail: "7 days free with one parent, manual calls, and live transcripts.",
  },
  {
    name: "Care Plus",
    price: "₹299/mo",
    detail: "Scheduled calls, caregiver alerts, and call history.",
  },
  {
    name: "Care Circle",
    price: "₹799/mo",
    detail: "Multiple parents, escalation contacts, and richer insights.",
  },
];

export default function SubscriptionPage() {
  return (
    <AppShell>
      <section className="rounded-md border border-teal-200 bg-teal-50 p-5">
        <p className="text-sm font-medium text-teal-800">New account benefit</p>
        <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-2xl font-semibold text-teal-950">
              Start with a 7-day free trial
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-teal-900">
              Try Mithram AI with live check-in calls, transcripts, caregiver
              dashboard, and escalation-ready setup before choosing a paid plan.
            </p>
          </div>
          <Link
            href="/parents/new"
            className="inline-flex rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white"
          >
            Continue setup
          </Link>
        </div>
      </section>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Plans</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Pricing is a business-oriented prototype shell. Payment collection can
          be connected after the core care workflow is stable.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <article
            key={tier.name}
            className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold">{tier.name}</h2>
            <p className="mt-3 text-2xl font-semibold">{tier.price}</p>
            <p className="mt-3 text-sm text-zinc-600">{tier.detail}</p>
            <button
              type="button"
              className="mt-5 w-full rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800"
            >
              {tier.name === "Trial" ? "Active trial" : "Choose plan"}
            </button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
