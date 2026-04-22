import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with the essentials",
    highlighted: false,
    cta: "Start Free",
  },
  {
    name: "Classic",
    price: "$9.99",
    period: "/month",
    description: "Unlock the full rig",
    highlighted: true,
    cta: "Go Classic",
  },
  {
    name: "Next Gen",
    price: "$19.99",
    period: "/month",
    description: "AI-enhanced tonal perfection",
    highlighted: false,
    cta: "Go Next Gen",
  },
];

interface FeatureRow {
  feature: string;
  free: string | boolean;
  classic: string | boolean;
  nextGen: string | boolean;
}

const features: FeatureRow[] = [
  { feature: "Amp Models", free: "1", classic: "All 7", nextGen: "All 7" },
  { feature: "FX Pedals", free: "3", classic: "All 18", nextGen: "All 18" },
  { feature: "Cabinets", free: "1", classic: "All 7", nextGen: "All 7" },
  { feature: "DSP Engine", free: true, classic: true, nextGen: true },
  {
    feature: "AI Neural Enhancement",
    free: false,
    classic: false,
    nextGen: true,
  },
  { feature: "Offline Support", free: true, classic: true, nextGen: true },
  {
    feature: "MIDI Controller Support",
    free: false,
    classic: true,
    nextGen: true,
  },
  {
    feature: "Cross-Device Sync",
    free: false,
    classic: true,
    nextGen: true,
  },
  {
    feature: "Live Performance Mode",
    free: false,
    classic: true,
    nextGen: true,
  },
  {
    feature: "Recording Engine (WAV/MP3/FLAC)",
    free: false,
    classic: true,
    nextGen: true,
  },
  {
    feature: "Cloud Tone Processing",
    free: false,
    classic: false,
    nextGen: true,
  },
  {
    feature: "Priority Support",
    free: false,
    classic: false,
    nextGen: true,
  },
  {
    feature: "Early Access to New Models",
    free: false,
    classic: false,
    nextGen: true,
  },
];

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "string") {
    return <span className="text-sm font-medium">{value}</span>;
  }
  return value ? (
    <Check className="mx-auto h-5 w-5 text-[var(--brand-accent)]" />
  ) : (
    <X className="mx-auto h-5 w-5 text-muted-foreground/40" />
  );
}

export default function WhatItCostsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="font-quicksand text-4xl font-bold tracking-tight sm:text-5xl">
          What It <span className="text-[var(--brand-accent)]">Costs</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Simple, transparent pricing. Start free and upgrade when you&apos;re
          ready.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "relative rounded-2xl border p-6 text-center transition-all",
              tier.highlighted
                ? "border-[var(--brand-accent)] bg-[var(--brand-accent)]/5 shadow-lg shadow-[var(--brand-accent)]/10 scale-[1.02]"
                : "border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur-sm)]"
            )}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--brand-accent)] px-3 py-0.5 text-xs font-semibold text-white">
                Most Popular
              </span>
            )}
            <h3 className="font-quicksand text-xl font-bold">{tier.name}</h3>
            <div className="mt-3 flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold">{tier.price}</span>
              <span className="text-sm text-muted-foreground">
                {tier.period}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {tier.description}
            </p>
            <Button
              className={cn(
                "mt-6 w-full",
                tier.highlighted
                  ? "bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-white"
                  : ""
              )}
              variant={tier.highlighted ? "default" : "outline"}
              asChild
            >
              <Link href="/signup">{tier.cta}</Link>
            </Button>
          </div>
        ))}
      </div>

      {/* Feature comparison table */}
      <div className="mt-20">
        <h2 className="text-center font-quicksand text-2xl font-bold">
          Feature Comparison
        </h2>
        <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--glass-border)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-[var(--glass-bg)]">
                <th className="px-4 py-3 text-sm font-semibold">Feature</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">
                  Free
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--brand-accent)]">
                  Classic
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold">
                  Next Gen
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((row, i) => (
                <tr
                  key={row.feature}
                  className={cn(
                    "border-b border-[var(--glass-border)]",
                    i % 2 === 0 ? "bg-transparent" : "bg-muted/30"
                  )}
                >
                  <td className="px-4 py-3 text-sm">{row.feature}</td>
                  <td className="px-4 py-3 text-center">
                    <CellValue value={row.free} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <CellValue value={row.classic} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <CellValue value={row.nextGen} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
