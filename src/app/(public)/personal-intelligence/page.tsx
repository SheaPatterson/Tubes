import { Brain, Cpu, Waves, Sparkles } from "lucide-react";

const capabilities = [
  {
    icon: Brain,
    title: "Neural Tone Matching",
    description:
      "Our AI analyzes the harmonic spectrum, dynamic response, and tonal fingerprint of real amplifiers to enhance your simulated tone in real time.",
  },
  {
    icon: Waves,
    title: "Real-Time Processing",
    description:
      "Audio streams to our cloud AI engine via low-latency WebSocket, returning enhanced audio with sub-50ms round-trip time.",
  },
  {
    icon: Cpu,
    title: "Continuous Learning",
    description:
      "The neural network improves over time with new training data from manufacturer specs, studio recordings, and proprietary research — no app update required.",
  },
  {
    icon: Sparkles,
    title: "Blend Control",
    description:
      "Dial in exactly how much AI enhancement you want — from 0% (pure DSP) to 100% (full neural processing) — using a simple slider.",
  },
];

export default function PersonalIntelligencePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="font-quicksand text-4xl font-bold tracking-tight sm:text-5xl">
          Personal{" "}
          <span className="text-[var(--brand-accent)]">Intelligence</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          AmpSim&apos;s Next Gen tier adds an AI neural network layer that
          analyzes and enhances your tone beyond what traditional DSP can
          achieve. It&apos;s like having a world-class amp tech fine-tuning your
          rig in real time.
        </p>
      </div>

      <div className="mt-16 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] sm:p-8">
        <h2 className="font-quicksand text-2xl font-bold">How the AI Works</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          The AI Engine is a cloud-hosted neural network trained on thousands of
          hours of real amplifier recordings, manufacturer tonal data, and
          studio captures. When you play through AmpSim with AI enabled, your
          DSP-processed audio is sent to the neural network, which applies tonal
          corrections that close the gap between digital simulation and the real
          thing.
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          The result is richer harmonics, more natural dynamic response, and
          that intangible &quot;feel&quot; that separates a great amp from a
          good simulation.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {capabilities.map((cap) => (
          <div
            key={cap.title}
            className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)]"
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-accent)]/10">
              <cap.icon className="h-5 w-5 text-[var(--brand-accent)]" />
            </div>
            <h3 className="font-quicksand text-lg font-semibold">
              {cap.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {cap.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
