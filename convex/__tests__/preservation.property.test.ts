import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Property 2: Preservation — Audio Control Synchronous State & Component Contracts
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 *
 * These tests capture the OBSERVED baseline behavior on UNFIXED code:
 * - /rig page: all knob/slider/toggle handlers use synchronous useState with
 *   functional updaters via updateState() — no Convex calls in the audio control path
 * - /live page: handleChannelChange, handleMasterVolumeChange, handlePedalToggle
 *   use synchronous setState with functional updaters — no async or network calls
 * - /rig page: AmpModelRenderer, PedalBoard, CabinetRenderer, MicPositionControl
 *   receive the same prop shapes (AmpModel, FxPedalInstance[], Cabinet, MicConfig)
 * - ConvexClientProvider renders children without a provider when NEXT_PUBLIC_CONVEX_URL is empty
 *
 * EXPECTED OUTCOME: Tests PASS on unfixed code (confirms baseline behavior to preserve).
 */

const WORKSPACE_ROOT = path.resolve(__dirname, "../..");
const RIG_PAGE_PATH = path.join(WORKSPACE_ROOT, "src/app/(app)/rig/page.tsx");
const LIVE_PAGE_PATH = path.join(WORKSPACE_ROOT, "src/app/(app)/live/page.tsx");
const CONVEX_PROVIDER_PATH = path.join(
  WORKSPACE_ROOT,
  "src/components/providers/convex-client-provider.tsx",
);
const AMP_RENDERER_PATH = path.join(
  WORKSPACE_ROOT,
  "src/components/amp/amp-model-renderer.tsx",
);
const PEDAL_BOARD_PATH = path.join(
  WORKSPACE_ROOT,
  "src/components/fx/pedal-board.tsx",
);
const CABINET_RENDERER_PATH = path.join(
  WORKSPACE_ROOT,
  "src/components/cabinet/cabinet-renderer.tsx",
);
const MIC_POSITION_PATH = path.join(
  WORKSPACE_ROOT,
  "src/components/cabinet/mic-position-control.tsx",
);

const rigPageSource = fs.readFileSync(RIG_PAGE_PATH, "utf-8");
const livePageSource = fs.readFileSync(LIVE_PAGE_PATH, "utf-8");
const convexProviderSource = fs.readFileSync(CONVEX_PROVIDER_PATH, "utf-8");
const ampRendererSource = fs.readFileSync(AMP_RENDERER_PATH, "utf-8");
const pedalBoardSource = fs.readFileSync(PEDAL_BOARD_PATH, "utf-8");
const cabinetRendererSource = fs.readFileSync(CABINET_RENDERER_PATH, "utf-8");
const micPositionSource = fs.readFileSync(MIC_POSITION_PATH, "utf-8");


// ---------------------------------------------------------------------------
// Helper: Extract handler bodies from source code
// ---------------------------------------------------------------------------

/**
 * Extracts the full text of a useCallback handler from source code,
 * from the opening of useCallback( to its matching closing ), [...]).
 * This captures the entire callback including parameter list and body.
 */
function extractCallbackBody(source: string, handlerName: string): string | null {
  // Match: const handlerName = useCallback(
  const startPattern = new RegExp(
    `const\\s+${handlerName}\\s*=\\s*useCallback\\s*\\(`,
  );
  const startMatch = startPattern.exec(source);
  if (!startMatch) return null;

  // From the opening paren of useCallback(, track depth to find the full callback body
  const openParenIdx = startMatch.index + startMatch[0].length - 1; // index of '('
  let depth = 0;

  for (let i = openParenIdx; i < source.length; i++) {
    const ch = source[i];
    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
    } else if (ch === ")" || ch === "}" || ch === "]") {
      depth--;
      if (depth === 0) {
        // Return everything between the outer parens of useCallback(...)
        return source.slice(openParenIdx + 1, i);
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Async/network patterns that must NOT appear in audio control handlers
// ---------------------------------------------------------------------------

const ASYNC_NETWORK_PATTERNS = [
  { pattern: /\buseQuery\b/, name: "useQuery" },
  { pattern: /\buseMutation\b/, name: "useMutation" },
  { pattern: /\bawait\b/, name: "await" },
  { pattern: /\bfetch\s*\(/, name: "fetch()" },
  { pattern: /\basync\b/, name: "async" },
  { pattern: /\.then\s*\(/, name: ".then()" },
  { pattern: /api\.catalog/, name: "api.catalog" },
  { pattern: /api\.signalChains/, name: "api.signalChains" },
] as const;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 2: Preservation — Audio Control Synchronous State & Component Contracts", () => {
  // ─── /rig page: synchronous audio control handlers ─────────────────────

  describe("/rig page: audio control handlers use synchronous useState only", () => {
    /**
     * Observed on UNFIXED code: all knob/slider/toggle handlers on /rig use
     * the synchronous updateState() helper which calls setState with a
     * functional updater. No Convex hooks, await, fetch, or async patterns
     * appear in any handler.
     */

    const rigAudioHandlers = [
      "handleAmpParameterChange",
      "handleChannelChange",
      "handleToggleChange",
      "handleInputGainChange",
      "handleNoiseGateToggle",
      "handleNoiseGateThreshold",
      "handleNoiseGateRelease",
      "handleMasterVolume",
      "handleOutputGain",
      "handleMicPositionChange",
      "handleMicDistanceChange",
      "handleMicTypeChange",
      "handleMicPresetChange",
      "handlePreampReorder",
      "handlePreampPedalToggle",
      "handlePreampPedalParam",
      "handlePreampRemovePedal",
      "handleFxLoopReorder",
      "handleFxLoopPedalToggle",
      "handleFxLoopPedalParam",
      "handleFxLoopRemovePedal",
    ] as const;

    it("all /rig audio handlers use useCallback with synchronous updateState", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...rigAudioHandlers),
          (handlerName) => {
            const body = extractCallbackBody(rigPageSource, handlerName);
            // Handler must exist as a useCallback
            expect(body).not.toBeNull();
            // Handler must call updateState (the synchronous wrapper around setState)
            expect(body).toMatch(/updateState\s*\(/);
          },
        ),
        { numRuns: rigAudioHandlers.length },
      );
    });

    it("no /rig audio handler contains async/network patterns", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...rigAudioHandlers),
          fc.constantFrom(...ASYNC_NETWORK_PATTERNS),
          (handlerName, { pattern, name }) => {
            const body = extractCallbackBody(rigPageSource, handlerName);
            if (!body) return; // handler not found — skip
            const hasAsyncPattern = pattern.test(body);
            expect(
              hasAsyncPattern,
              `Handler ${handlerName} must not contain ${name}`,
            ).toBe(false);
          },
        ),
        { numRuns: rigAudioHandlers.length * ASYNC_NETWORK_PATTERNS.length },
      );
    });
  });

  // ─── /live page: synchronous audio control handlers ────────────────────

  describe("/live page: audio control handlers use synchronous setState only", () => {
    /**
     * Observed on UNFIXED code: handleChannelChange, handleMasterVolumeChange,
     * handlePedalToggle use synchronous setState with functional updaters.
     * No async or network calls in the handler call chain.
     */

    const liveAudioHandlers = [
      "handleChannelChange",
      "handleMasterVolumeChange",
      "handlePedalToggle",
      "handleSlotRecall",
      "handleSlotAssign",
    ] as const;

    it("all /live audio handlers use useCallback with synchronous setState", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...liveAudioHandlers),
          (handlerName) => {
            const body = extractCallbackBody(livePageSource, handlerName);
            expect(body).not.toBeNull();
            // Handler must call setState or setQuickSlots (both synchronous)
            expect(body).toMatch(/setState\s*\(|setQuickSlots\s*\(/);
          },
        ),
        { numRuns: liveAudioHandlers.length },
      );
    });

    it("no /live audio handler contains async/network patterns", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...liveAudioHandlers),
          fc.constantFrom(...ASYNC_NETWORK_PATTERNS),
          (handlerName, { pattern, name }) => {
            const body = extractCallbackBody(livePageSource, handlerName);
            if (!body) return;
            const hasAsyncPattern = pattern.test(body);
            expect(
              hasAsyncPattern,
              `Handler ${handlerName} must not contain ${name}`,
            ).toBe(false);
          },
        ),
        { numRuns: liveAudioHandlers.length * ASYNC_NETWORK_PATTERNS.length },
      );
    });
  });

  // ─── Component prop contracts ──────────────────────────────────────────

  describe("/rig component prop contracts remain unchanged", () => {
    /**
     * Observed on UNFIXED code: AmpModelRenderer, PedalBoard, CabinetRenderer,
     * MicPositionControl receive the same prop shapes. These interfaces must
     * remain stable after the fix.
     */

    it("AmpModelRenderer accepts AmpModel, AmpParameters, onParameterChange, onChannelChange", () => {
      const expectedProps = [
        { name: "model", type: "AmpModel" },
        { name: "parameters", type: "AmpParameters" },
        { name: "onParameterChange", type: "(param: string, value: number) => void" },
        { name: "onChannelChange", type: "(channel: AmpChannel) => void" },
      ] as const;

      fc.assert(
        fc.property(
          fc.constantFrom(...expectedProps),
          ({ name, type }) => {
            // Check the interface definition exists with the expected prop
            const hasInterface = /export\s+interface\s+AmpModelRendererProps/.test(
              ampRendererSource,
            );
            expect(hasInterface).toBe(true);

            // Check the prop exists in the interface
            const propPattern = new RegExp(`${name}\\s*:\\s*${type.replace(/[()]/g, "\\$&")}`);
            expect(propPattern.test(ampRendererSource)).toBe(true);
          },
        ),
        { numRuns: expectedProps.length },
      );
    });

    it("PedalBoard accepts stage, pedals, pedalDefinitions, and handler callbacks", () => {
      const expectedProps = [
        { name: "stage", pattern: /stage\s*:\s*"preamp"\s*\|\s*"fxloop"/ },
        { name: "pedals", pattern: /pedals\s*:\s*FxPedalInstance\[\]/ },
        { name: "pedalDefinitions", pattern: /pedalDefinitions\s*:\s*Record<string,\s*FxPedalDefinition>/ },
        { name: "onReorder", pattern: /onReorder\s*:\s*\(newOrder:\s*string\[\]\)\s*=>\s*void/ },
        { name: "onPedalToggle", pattern: /onPedalToggle\s*:\s*\(pedalId:\s*string,\s*enabled:\s*boolean\)\s*=>\s*void/ },
        { name: "onPedalParameterChange", pattern: /onPedalParameterChange\s*:\s*\(pedalId:\s*string,\s*param:\s*string,\s*value:\s*number\)\s*=>\s*void/ },
        { name: "onAddPedal", pattern: /onAddPedal\s*:\s*\(\)\s*=>\s*void/ },
        { name: "onRemovePedal", pattern: /onRemovePedal\s*:\s*\(pedalId:\s*string\)\s*=>\s*void/ },
      ] as const;

      fc.assert(
        fc.property(
          fc.constantFrom(...expectedProps),
          ({ name, pattern }) => {
            const hasInterface = /export\s+interface\s+PedalBoardProps/.test(pedalBoardSource);
            expect(hasInterface).toBe(true);
            expect(
              pattern.test(pedalBoardSource),
              `PedalBoard prop "${name}" must match expected type`,
            ).toBe(true);
          },
        ),
        { numRuns: expectedProps.length },
      );
    });

    it("CabinetRenderer accepts Cabinet prop", () => {
      const expectedProps = [
        { name: "cabinet", pattern: /cabinet\s*:\s*Cabinet/ },
      ] as const;

      fc.assert(
        fc.property(
          fc.constantFrom(...expectedProps),
          ({ name, pattern }) => {
            const hasInterface = /export\s+interface\s+CabinetRendererProps/.test(
              cabinetRendererSource,
            );
            expect(hasInterface).toBe(true);
            expect(
              pattern.test(cabinetRendererSource),
              `CabinetRenderer prop "${name}" must match expected type`,
            ).toBe(true);
          },
        ),
        { numRuns: expectedProps.length },
      );
    });

    it("MicPositionControl accepts MicConfiguration and handler callbacks", () => {
      const expectedProps = [
        { name: "config", pattern: /config\s*:\s*MicConfiguration/ },
        { name: "onPositionChange", pattern: /onPositionChange\s*:\s*\(x:\s*number,\s*y:\s*number,\s*z:\s*number\)\s*=>\s*void/ },
        { name: "onDistanceChange", pattern: /onDistanceChange\s*:\s*\(distance:\s*number\)\s*=>\s*void/ },
        { name: "onMicTypeChange", pattern: /onMicTypeChange\s*:\s*\(type:\s*MicType\)\s*=>\s*void/ },
        { name: "onPresetChange", pattern: /onPresetChange\s*:\s*\(preset:\s*MicPreset\)\s*=>\s*void/ },
      ] as const;

      fc.assert(
        fc.property(
          fc.constantFrom(...expectedProps),
          ({ name, pattern }) => {
            const hasInterface = /export\s+interface\s+MicPositionControlProps/.test(
              micPositionSource,
            );
            expect(hasInterface).toBe(true);
            expect(
              pattern.test(micPositionSource),
              `MicPositionControl prop "${name}" must match expected type`,
            ).toBe(true);
          },
        ),
        { numRuns: expectedProps.length },
      );
    });
  });

  // ─── ConvexClientProvider fallback ─────────────────────────────────────

  describe("ConvexClientProvider renders children without provider when no URL configured", () => {
    /**
     * Observed on UNFIXED code: ConvexClientProvider checks for
     * NEXT_PUBLIC_CONVEX_URL and renders children directly (without
     * ConvexProvider wrapper) when the URL is empty/not set.
     */

    it("provider checks for empty convex URL and renders children directly", () => {
      const preservationPatterns = [
        {
          name: "reads NEXT_PUBLIC_CONVEX_URL with empty fallback",
          pattern: /process\.env\.NEXT_PUBLIC_CONVEX_URL\s*\?\?\s*""/,
        },
        {
          name: "conditionally creates ConvexReactClient only when URL exists",
          pattern: /convexUrl\s*\?\s*new\s+ConvexReactClient\s*\(\s*convexUrl\s*\)\s*:\s*null/,
        },
        {
          name: "renders children without provider when convex is null",
          pattern: /if\s*\(\s*!convex\s*\)\s*\{[^}]*return\s*<>\{children\}<\/>/,
        },
        {
          name: "wraps children in ConvexProvider when convex client exists",
          pattern: /<ConvexProvider\s+client=\{convex\}>\{children\}<\/ConvexProvider>/,
        },
      ] as const;

      fc.assert(
        fc.property(
          fc.constantFrom(...preservationPatterns),
          ({ name, pattern }) => {
            expect(
              pattern.test(convexProviderSource),
              `ConvexClientProvider must: ${name}`,
            ).toBe(true);
          },
        ),
        { numRuns: preservationPatterns.length },
      );
    });
  });
});
