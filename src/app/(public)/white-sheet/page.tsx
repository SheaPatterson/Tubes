export default function WhiteSheetPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="font-quicksand text-4xl font-bold tracking-tight sm:text-5xl">
          White <span className="text-[var(--brand-accent)]">Sheet</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          A technical overview of AmpSim&apos;s approach to digital amplifier
          simulation.
        </p>
      </div>

      <article className="prose prose-neutral dark:prose-invert mx-auto mt-16 max-w-none space-y-8">
        <section className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] sm:p-8">
          <h2 className="font-quicksand text-2xl font-bold text-foreground">
            Abstract
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            AmpSim is a browser-native guitar amplifier simulation platform that
            combines component-level circuit modeling with AI-enhanced tonal
            processing. This document outlines the technical foundations of the
            platform&apos;s DSP engine, neural network enhancement layer, and
            real-time audio architecture.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] sm:p-8">
          <h2 className="font-quicksand text-2xl font-bold text-foreground">
            Signal Processing Architecture
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            The DSP engine processes audio through a fixed-order signal chain:
            Input → Preamp FX → Preamp Tubes → Amplifier → FX Loop → Cabinet →
            Output. Each stage is implemented as a custom AudioWorkletProcessor
            running on a dedicated real-time audio thread, processing
            128-sample blocks at configurable sample rates (44.1kHz, 48kHz,
            96kHz).
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            This architecture achieves a total audio round-trip latency of less
            than 15ms under standard CPU load, meeting the threshold for
            real-time musical performance.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] sm:p-8">
          <h2 className="font-quicksand text-2xl font-bold text-foreground">
            Tube Amplifier Modeling
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Preamp stages model individual 12AX7 vacuum tubes with cumulative
            gain and per-stage frequency response shaping. Power amp simulation
            covers six tube types (KT88, 6L6, EL34, EL84, 12BH7, 12AU7) with
            dynamic sag compression, bias modeling, and voltage response curves
            derived from manufacturer specifications.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            At drive levels above 70%, the power amp model applies progressive
            sag-based compression that reduces pick-attack transients — faithfully
            reproducing the dynamic feel of a real tube amplifier under load.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] sm:p-8">
          <h2 className="font-quicksand text-2xl font-bold text-foreground">
            Cabinet & Microphone Simulation
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Cabinet simulation uses impulse response convolution blended from
            publicly available IR data and proprietary research. Virtual
            microphone positioning in 3D space (X, Y, Z axes plus distance)
            allows users to shape the final tone as a recording engineer would,
            with three mic types (condenser, ribbon, dynamic) each contributing
            unique frequency response characteristics.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] sm:p-8">
          <h2 className="font-quicksand text-2xl font-bold text-foreground">
            Neural Network Enhancement
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            The Next Gen tier adds a cloud-hosted neural network that analyzes
            DSP output and applies tonal corrections trained on thousands of
            hours of real amplifier recordings. The AI engine communicates via
            low-latency WebSocket, with automatic fallback to DSP-only
            processing if latency exceeds 50ms or the connection is lost.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] sm:p-8">
          <h2 className="font-quicksand text-2xl font-bold text-foreground">
            Offline-First Design
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            The entire DSP engine, amp/FX/cabinet data, and UI assets are cached
            via Service Workers for offline operation. User data synchronizes
            across devices using CRDT-based conflict resolution, with mutations
            queued in IndexedDB during offline periods and synced within 30
            seconds of reconnection.
          </p>
        </section>
      </article>
    </div>
  );
}
