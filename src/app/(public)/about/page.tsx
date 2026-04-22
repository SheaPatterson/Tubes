import { Zap, Users, Target, Heart } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Precision",
    description:
      "Every amp model, pedal circuit, and cabinet IR is meticulously crafted to capture the soul of the original hardware.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Built by musicians, for musicians. We listen to our users and evolve the platform based on real-world feedback.",
  },
  {
    icon: Heart,
    title: "Passion",
    description:
      "We believe great tone should be accessible to everyone — from bedroom players to touring professionals.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "Combining classic DSP with cutting-edge AI neural networks to push the boundaries of digital amp simulation.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="font-quicksand text-4xl font-bold tracking-tight sm:text-5xl">
          About <span className="text-[var(--brand-accent)]">AmpSim</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          AmpSim is a professional-grade amplifier and effects simulation
          platform that brings iconic guitar tones to your browser, desktop, and
          mobile device. We faithfully recreate the circuits, tubes, and speaker
          cabinets that shaped decades of music — all under our own brand
          identity.
        </p>
      </div>

      <div className="mt-16 space-y-8 text-muted-foreground">
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] sm:p-8">
          <h2 className="font-quicksand text-2xl font-bold text-foreground">
            Our Story
          </h2>
          <p className="mt-4 leading-relaxed">
            AmpSim started with a simple idea: what if you could carry every
            legendary amp, pedal, and cabinet in your pocket? We set out to
            build a platform that doesn&apos;t just approximate tone — it
            recreates it with scientific precision using real circuit modeling,
            impulse response convolution, and AI-enhanced processing.
          </p>
          <p className="mt-4 leading-relaxed">
            Our team of audio engineers, DSP specialists, and software
            developers shares a common thread: we&apos;re all guitarists who
            obsess over tone. That obsession drives every decision we make.
          </p>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center font-quicksand text-2xl font-bold">
          What We Value
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)]"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-accent)]/10">
                <v.icon className="h-5 w-5 text-[var(--brand-accent)]" />
              </div>
              <h3 className="font-quicksand text-lg font-semibold">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
