import { Guitar, Globe, Lightbulb } from "lucide-react";

export default function WhyWeDoItPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="font-quicksand text-4xl font-bold tracking-tight sm:text-5xl">
          Why We <span className="text-[var(--brand-accent)]">Do It</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          The mission and motivation behind AmpSim.
        </p>
      </div>

      <div className="mt-16 space-y-8">
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] sm:p-8">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-accent)]/10">
            <Guitar className="h-5 w-5 text-[var(--brand-accent)]" />
          </div>
          <h2 className="font-quicksand text-2xl font-bold">
            Tone Shouldn&apos;t Have a Price Barrier
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            A professional amp rig can cost thousands of dollars. Pedals,
            cabinets, microphones, and studio time add up fast. We believe every
            guitarist — whether you&apos;re in a bedroom or on a world tour —
            deserves access to world-class tone. AmpSim puts an entire studio
            rig in your browser for free, with premium tiers for those who want
            to go deeper.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] sm:p-8">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-accent)]/10">
            <Lightbulb className="h-5 w-5 text-[var(--brand-accent)]" />
          </div>
          <h2 className="font-quicksand text-2xl font-bold">
            Pushing Digital Audio Forward
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            We&apos;re not satisfied with &quot;good enough.&quot; Traditional
            amp sims model the broad strokes, but miss the subtle dynamics that
            make a real tube amp feel alive. By combining precision DSP with AI
            neural networks, we&apos;re closing the gap between digital and
            analog in ways that weren&apos;t possible even a few years ago.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] sm:p-8">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-accent)]/10">
            <Globe className="h-5 w-5 text-[var(--brand-accent)]" />
          </div>
          <h2 className="font-quicksand text-2xl font-bold">
            Play Anywhere, Anytime
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Your rig should travel with you. AmpSim runs in the browser, as a
            desktop app, and on mobile — with offline support so you can play
            even without an internet connection. Your signal chains sync across
            all your devices automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
