const stackCategories = [
  {
    category: "Frontend",
    items: [
      {
        name: "Next.js 15",
        detail: "App Router, React Server Components, SSR/SSG",
      },
      { name: "React 19", detail: "UI component library with concurrent features" },
      {
        name: "TypeScript",
        detail: "Strict mode throughout the entire codebase",
      },
      {
        name: "Tailwind CSS",
        detail: "Utility-first styling with custom design tokens",
      },
      {
        name: "shadcn/ui",
        detail: "Radix UI primitives with accessible, composable components",
      },
      { name: "Quicksand", detail: "Brand body font via next/font" },
    ],
  },
  {
    category: "Audio & DSP",
    items: [
      {
        name: "Web Audio API",
        detail: "AudioWorklet for real-time, low-latency audio processing",
      },
      {
        name: "AudioWorklet",
        detail:
          "Dedicated audio thread, 128-sample blocks (~2.9ms at 44.1kHz)",
      },
      {
        name: "IR Convolution",
        detail: "Impulse response-based cabinet and speaker simulation",
      },
      {
        name: "Web MIDI API",
        detail: "USB and Bluetooth MIDI controller integration",
      },
      {
        name: "MediaRecorder API",
        detail: "WAV, MP3, FLAC recording at up to 96kHz/32-bit",
      },
    ],
  },
  {
    category: "Backend & Data",
    items: [
      {
        name: "Convex",
        detail:
          "Reactive database with real-time sync, optimistic updates, and TypeScript-native functions",
      },
      {
        name: "CRDT Sync",
        detail:
          "Conflict-free data replication for offline-first multi-device support",
      },
      {
        name: "IndexedDB",
        detail: "Local cache for offline signal chain storage and mutation queuing",
      },
    ],
  },
  {
    category: "AI & Cloud",
    items: [
      {
        name: "FastAPI",
        detail: "Python backend hosting the neural network AI engine",
      },
      {
        name: "Neural Network",
        detail:
          "Trained on real amp recordings for tonal correction and enhancement",
      },
      {
        name: "WebSocket",
        detail: "Low-latency streaming for real-time AI audio processing",
      },
    ],
  },
  {
    category: "Platform & Distribution",
    items: [
      { name: "Vercel", detail: "Web app hosting and edge deployment" },
      {
        name: "Electron",
        detail: "Desktop app for Mac (Apple Silicon + Intel) and Windows (x64)",
      },
      {
        name: "Service Workers",
        detail: "PWA offline caching for DSP engine, data, and UI assets",
      },
      { name: "Stripe", detail: "PCI-compliant payment processing" },
    ],
  },
  {
    category: "Testing & Quality",
    items: [
      { name: "Vitest", detail: "Unit and integration testing" },
      {
        name: "fast-check",
        detail: "Property-based testing for DSP and data invariants",
      },
      {
        name: "@dnd-kit",
        detail: "Accessible drag-and-drop for pedal board reordering",
      },
    ],
  },
];

export default function BlueprintPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="font-quicksand text-4xl font-bold tracking-tight sm:text-5xl">
          Blueprint &{" "}
          <span className="text-[var(--brand-accent)]">Tech Stack</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          A transparent look at the technologies and architecture powering
          AmpSim.
        </p>
      </div>

      {/* Architecture overview */}
      <div className="mt-16 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-[var(--glass-blur-sm)] sm:p-8">
        <h2 className="font-quicksand text-2xl font-bold">Architecture</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          AmpSim follows a client-heavy architecture. All audio processing
          happens on your device via the Web Audio API&apos;s AudioWorklet
          interface — no round-trip to a server for sound. The cloud handles
          data sync, authentication, payments, and AI enhancement (Next Gen tier
          only). The signal chain is modeled as a directed acyclic graph of
          AudioWorkletNodes connected in series, enabling glitch-free parameter
          changes and pedal reordering within 10ms.
        </p>
      </div>

      {/* Tech stack grid */}
      <div className="mt-12 space-y-8">
        {stackCategories.map((cat) => (
          <div key={cat.category}>
            <h2 className="font-quicksand text-xl font-bold">{cat.category}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {cat.items.map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 backdrop-blur-[var(--glass-blur-sm)]"
                >
                  <span className="text-sm font-semibold">{item.name}</span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
