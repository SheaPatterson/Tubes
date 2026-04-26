import { Cpu, Waves, Mic, Guitar, Sliders, Zap } from "lucide-react";

const approaches = [
  {
    icon: Cpu,
    title: "Circuit-Level Modeling",
    description:
      "Each amp and pedal is modeled at the component level — transistors, op-amps, tube stages, and tone stacks — using values derived from real hardware measurements.",
  },
  {
    icon: Waves,
    title: "AudioWorklet DSP",
    description:
      "All audio processing runs on a dedicated real-time thread via the Web Audio API's AudioWorklet interface, achieving sub-15ms latency with 128-sample processing blocks.",
  },
  {
    icon: Guitar,
    title: "Tube Gain Staging",
    description:
      "Preamp tubes are modeled individually as 12AX7 stages with cumulative gain and per-stage frequency response shaping, just like a real amp circuit.",
  },
  {
    icon: Mic,
    title: "IR Convolution",
    description:
      "Cabinet simulation uses impulse response convolution blended from publicly available IRs and proprietary research, combined with virtual microphone positioning.",
  },
  {
    icon: Sliders,
    title: "Manufacturer-Accurate Parameters",
    description:
      "Tone stack EQ curves, power amp sag coefficients, and bias values are sourced from manufacturer specifications and real-world measurements.",
  },
  {
    icon: Zap,
    title: "AI Enhancement Layer",
    description:
      "For Next Gen subscribers, a cloud neural network trained on real amp recordings applies tonal corrections that bridge the gap between simulation and reality.",
  },
];

export default function HowWeDoItPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="font-quicksand text-4xl font-bold tracking-tight sm:text-5xl">
          How We <span className="text-[var(--brand-accent)]">Do It</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          A look under the hood at the engineering and science behind
          AmpSim&apos;s tone engine.
        </p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {approaches.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)]"
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-accent)]/10">
              <item.icon className="h-5 w-5 text-[var(--brand-accent)]" />
            </div>
            <h3 className="font-quicksand text-lg font-semibold">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
