import { AppShell } from "@/app/components/AppShell";

const tiers = [
  {
    name: "Care Basic",
    price: "Free",
    detail: "For one demo parent and manual calls.",
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
      <div>
        <h1 className="text-2xl font-semibold">Subscription</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Static pricing shell for the prototype. Payment integration comes
          after the core call loop is working.
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
              Choose plan
            </button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
