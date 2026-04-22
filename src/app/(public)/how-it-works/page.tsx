import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Input",
    description:
      "Your guitar signal enters through your audio interface. AmpSim detects your device and applies optimized settings for the lowest possible latency.",
  },
  {
    number: "2",
    title: "Preamp FX",
    description:
      "The signal hits your pedalboard first — overdrive, compression, wah, or any combination from our 18-pedal collection. Drag and drop to reorder.",
  },
  {
    number: "3",
    title: "Preamp Tubes",
    description:
      "Next, the signal passes through 12AX7 tube stages. Each stage adds gain and harmonic saturation, just like a real amp's preamp section.",
  },
  {
    number: "4",
    title: "Amplifier",
    description:
      "The tone stack shapes your sound with Bass, Middle, Treble, Presence, and Resonance controls. Switch between Clean, Crunch, and Overdrive channels.",
  },
  {
    number: "5",
    title: "FX Loop",
    description:
      "Post-amp effects like delay, reverb, and modulation sit in the FX loop — exactly where they'd be in a real rig.",
  },
  {
    number: "6",
    title: "Cabinet & Mic",
    description:
      "Your tone is shaped by a virtual speaker cabinet with IR convolution. Position a condenser, ribbon, or dynamic mic in 3D space for studio-quality results.",
  },
  {
    number: "7",
    title: "Output",
    description:
      "The final signal reaches your speakers or headphones with sub-15ms total latency. Record, perform live, or just enjoy the tone.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="font-quicksand text-4xl font-bold tracking-tight sm:text-5xl">
          How It <span className="text-[var(--brand-accent)]">Works</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          From guitar input to speaker output — here&apos;s the journey your
          signal takes through AmpSim&apos;s processing chain.
        </p>
      </div>

      <div className="mt-16 space-y-4">
        {steps.map((step, i) => (
          <div key={step.number} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent)] text-sm font-bold text-white">
                {step.number}
              </div>
              {i < steps.length - 1 && (
                <div className="my-1 flex flex-1 items-center">
                  <ArrowRight className="h-4 w-4 rotate-90 text-[var(--brand-accent)]/40" />
                </div>
              )}
            </div>
            <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-[var(--glass-blur-sm)] flex-1 mb-2">
              <h3 className="font-quicksand text-lg font-semibold">
                {step.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
