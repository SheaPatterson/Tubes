"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Guitar, Volume2, Mic, Sliders, Wifi, Shield, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ampModels } from "@/data/amp-models";
import { fxPedals } from "@/data/fx-pedals";
import { cabinets } from "@/data/cabinets";

/* ─── Hero ─── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--brand-primary)]/5 via-transparent to-transparent" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[var(--brand-accent)]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-1.5 text-sm backdrop-blur-[var(--glass-blur-sm)]">
            <Zap className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
            <span className="text-muted-foreground">Professional-grade amp simulation</span>
          </div>

          <h1 className="font-quicksand text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your tone.{" "}
            <span className="text-[var(--brand-accent)]">Perfected.</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Faithfully recreate iconic amp tones with real-time DSP processing,
            AI-enhanced neural simulation, and a complete virtual pedalboard —
            all in your browser.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-white px-8"
            >
              <Link href="/signup">
                Get Started Free
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/how-it-works">See How It Works</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Interactive Amp Mockups ─── */
function AmpShowcase() {
  const [selectedAmp, setSelectedAmp] = useState(0);
  const amp = ampModels[selectedAmp];

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-quicksand text-3xl font-bold tracking-tight sm:text-4xl">
            Iconic Amp Models
          </h2>
          <p className="mt-3 text-muted-foreground">
            7 faithfully recreated amplifiers under our brand identity
          </p>
        </div>

        {/* Amp selector tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {ampModels.map((model, i) => (
            <button
              key={model.id}
              onClick={() => setSelectedAmp(i)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium transition-all sm:text-sm",
                selectedAmp === i
                  ? "bg-[var(--brand-accent)] text-white shadow-lg shadow-[var(--brand-accent)]/25"
                  : "bg-[var(--glass-bg)] text-muted-foreground border border-[var(--glass-border)] hover:border-[var(--brand-accent)]/50 backdrop-blur-[var(--glass-blur-sm)]"
              )}
            >
              {model.name}
            </button>
          ))}
        </div>

        {/* Selected amp display */}
        <div className="mt-8 mx-auto max-w-2xl">
          <div
            className="relative rounded-2xl border border-[var(--glass-border)] p-6 sm:p-8 backdrop-blur-[var(--glass-blur)] shadow-[var(--glass-shadow)]"
            style={{ backgroundColor: amp.visualConfig.panelColor + "22" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-quicksand text-xl font-bold">{amp.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {amp.brandRename} &middot; {amp.channels.join(" / ")} &middot;{" "}
                  {amp.powerAmpTubeType} power tubes
                </p>
              </div>
              <div
                className="h-10 w-10 rounded-full border-2"
                style={{
                  backgroundColor: amp.visualConfig.panelColor,
                  borderColor: "var(--glass-border)",
                }}
              />
            </div>

            {/* Knob mockup row */}
            <div className="flex flex-wrap items-end justify-center gap-4 py-6">
              {amp.controls.slice(0, 8).map((ctrl) => (
                <div key={ctrl.paramKey} className="flex flex-col items-center gap-1.5">
                  <div className="relative h-12 w-12 rounded-full border-2 border-foreground/20 bg-foreground/5 sm:h-14 sm:w-14">
                    <div
                      className="absolute left-1/2 top-1 h-3 w-0.5 -translate-x-1/2 rounded-full bg-[var(--brand-accent)]"
                      style={{
                        transformOrigin: "bottom center",
                        transform: `translateX(-50%) rotate(${((ctrl.defaultValue - ctrl.min) / (ctrl.max - ctrl.min)) * 270 - 135}deg)`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground sm:text-xs">
                    {ctrl.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Toggle switches */}
            <div className="flex flex-wrap justify-center gap-3 border-t border-[var(--glass-border)] pt-4">
              {amp.toggleSwitches
                .filter((t) => t.applicableToModel)
                .map((toggle) => (
                  <span
                    key={toggle.paramKey}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-medium border",
                      toggle.defaultValue
                        ? "bg-[var(--brand-accent)]/15 text-[var(--brand-accent)] border-[var(--brand-accent)]/30"
                        : "bg-muted text-muted-foreground border-transparent"
                    )}
                  >
                    {toggle.name}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FX Pedal Showcase ─── */
function PedalShowcase() {
  const brands = ["MAC", "KING", "Manhattan", "TOKYO"] as const;
  const [activeBrand, setActiveBrand] = useState<string>("MAC");
  const filtered = fxPedals.filter((p) => p.brand === activeBrand);

  const brandColors: Record<string, string> = {
    MAC: "var(--brand-mac)",
    KING: "var(--brand-king)",
    Manhattan: "var(--brand-manhattan)",
    TOKYO: "var(--brand-tokyo)",
  };

  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-quicksand text-3xl font-bold tracking-tight sm:text-4xl">
            FX Pedal Collection
          </h2>
          <p className="mt-3 text-muted-foreground">
            {fxPedals.length} pedals across 4 iconic brands
          </p>
        </div>

        {/* Brand tabs */}
        <div className="mt-10 flex justify-center gap-3">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setActiveBrand(brand)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-bold transition-all",
                activeBrand === brand
                  ? "text-white shadow-lg"
                  : "bg-[var(--glass-bg)] text-muted-foreground border border-[var(--glass-border)] backdrop-blur-[var(--glass-blur-sm)]"
              )}
              style={
                activeBrand === brand
                  ? { backgroundColor: brandColors[brand], boxShadow: `0 4px 20px ${brandColors[brand]}44` }
                  : undefined
              }
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Pedal grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((pedal) => (
            <div
              key={pedal.id}
              className="group relative rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-[var(--glass-blur-sm)] transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              <div
                className="mb-3 h-16 w-full rounded-lg"
                style={{ backgroundColor: pedal.visualConfig.bodyColor + "33" }}
              />
              <h4 className="text-sm font-semibold">{pedal.name}</h4>
              <p className="text-xs text-muted-foreground capitalize">
                {pedal.category}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {pedal.controls.slice(0, 3).map((ctrl) => (
                  <span
                    key={ctrl.paramKey}
                    className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {ctrl.name}
                  </span>
                ))}
                {pedal.controls.length > 3 && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    +{pedal.controls.length - 3}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                  pedal.tierRequired === "free"
                    ? "bg-green-500/10 text-green-600"
                    : pedal.tierRequired === "classic"
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-purple-500/10 text-purple-600"
                )}
              >
                {pedal.tierRequired === "free"
                  ? "Free"
                  : pedal.tierRequired === "classic"
                    ? "Classic"
                    : "Next Gen"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Cabinet Showcase ─── */
function CabinetShowcase() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-quicksand text-3xl font-bold tracking-tight sm:text-4xl">
            Speaker Cabinets
          </h2>
          <p className="mt-3 text-muted-foreground">
            {cabinets.length} cabinets with IR-based speaker simulation
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cabinets.map((cab) => (
            <div
              key={cab.id}
              className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-[var(--glass-blur-sm)] transition-all hover:shadow-lg"
            >
              <div
                className="mb-4 flex h-20 items-center justify-center rounded-lg"
                style={{ backgroundColor: cab.visualConfig.bodyColor + "22" }}
              >
                <Volume2 className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h4 className="font-semibold">{cab.name}</h4>
              <p className="text-xs text-muted-foreground">
                {cab.speakerConfig} &middot;{" "}
                {cab.speakers[0]?.name ?? "Custom"}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {cab.visualConfig.grillPattern.replace("-", " ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Feature Highlights ─── */
const features = [
  {
    icon: Guitar,
    title: "7 Amp Models",
    description: "From clean Fender-style tones to crushing high-gain, faithfully recreated under our brand identity.",
  },
  {
    icon: Sliders,
    title: "18 FX Pedals",
    description: "Overdrive, distortion, delay, modulation, compression, EQ, and multi-effects from 4 iconic brands.",
  },
  {
    icon: Mic,
    title: "Virtual Mic Placement",
    description: "Position condenser, ribbon, or dynamic mics in 3D space for studio-quality cabinet tones.",
  },
  {
    icon: Zap,
    title: "Sub-15ms Latency",
    description: "AudioWorklet-powered DSP runs on a dedicated thread for real-time, glitch-free processing.",
  },
  {
    icon: Wifi,
    title: "Offline Ready",
    description: "Full DSP engine works offline. Your signal chains sync automatically when you reconnect.",
  },
  {
    icon: Shield,
    title: "AI Enhancement",
    description: "Next Gen tier adds neural network processing trained on real amp tonal data for unmatched realism.",
  },
];

function FeatureHighlights() {
  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-quicksand text-3xl font-bold tracking-tight sm:text-4xl">
            Built for Tone Chasers
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need for practice, recording, and live performance
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] transition-all hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-accent)]/10">
                <feat.icon className="h-5 w-5 text-[var(--brand-accent)]" />
              </div>
              <h3 className="font-quicksand text-lg font-semibold">{feat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing Preview ─── */
const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with the essentials",
    features: [
      "1 amp model",
      "3 FX pedals",
      "1 cabinet",
      "Full DSP engine",
      "Offline support",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Classic",
    price: "$9.99",
    period: "/month",
    description: "Unlock the full rig",
    features: [
      "All 7 amp models",
      "All 18 FX pedals",
      "All 7 cabinets",
      "MIDI controller support",
      "Cross-device sync",
      "Live performance mode",
      "Recording engine",
    ],
    cta: "Go Classic",
    highlighted: true,
  },
  {
    name: "Next Gen",
    price: "$19.99",
    period: "/month",
    description: "AI-enhanced tonal perfection",
    features: [
      "Everything in Classic",
      "AI neural network enhancement",
      "Cloud tone processing",
      "Priority support",
      "Early access to new models",
    ],
    cta: "Go Next Gen",
    highlighted: false,
  },
];

function PricingPreview() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-quicksand text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative rounded-2xl border p-6 sm:p-8 transition-all",
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
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{tier.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>

              <ul className="mt-6 space-y-2.5">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-accent)]" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "mt-8 w-full",
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
      </div>
    </section>
  );
}

/* ─── Bottom CTA ─── */
function BottomCTA() {
  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <Zap className="mx-auto h-10 w-10 text-[var(--brand-accent)]" />
        <h2 className="mt-6 font-quicksand text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to find your tone?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Join thousands of guitarists shaping their sound with AmpSim. Start
          free — no credit card required.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            asChild
            className="bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-white px-8"
          >
            <Link href="/signup">
              Get Started Free
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/contact">Talk to Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─── Landing Page ─── */
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <AmpShowcase />
      <PedalShowcase />
      <CabinetShowcase />
      <FeatureHighlights />
      <PricingPreview />
      <BottomCTA />
    </>
  );
}
