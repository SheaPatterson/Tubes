import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Property 1: Bug Condition — Static Data Usage on /live and Stale Local State on /presets
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
 *
 * This test encodes the EXPECTED (correct) behavior:
 * - /live page should use useAmpModels() and useFxPedals() hooks for ALL rendering data
 *   (not just import them — the PEDAL_DEF_MAP must be derived from hook data, not static imports)
 * - /presets page should NOT use createSeedChains() as the primary data source
 * - /presets mutations should use Convex as the PRIMARY persistence mechanism,
 *   not setLocalChains with Convex as fire-and-forget
 *
 * On UNFIXED code this test MUST FAIL — failure confirms the bug exists.
 */

const WORKSPACE_ROOT = path.resolve(__dirname, "../..");
const LIVE_PAGE_PATH = path.join(WORKSPACE_ROOT, "src/app/(app)/live/page.tsx");
const PRESETS_PAGE_PATH = path.join(WORKSPACE_ROOT, "src/app/(app)/presets/page.tsx");

const livePageSource = fs.readFileSync(LIVE_PAGE_PATH, "utf-8");
const presetsPageSource = fs.readFileSync(PRESETS_PAGE_PATH, "utf-8");

describe("Property 1: Bug Condition — Static Data Usage on /live and Stale Local State on /presets", () => {

  // ─── /live page bug conditions ───────────────────────────────────────────

  describe("/live page: PEDAL_DEF_MAP must be derived from hook data, not static imports", () => {
    /**
     * The /live page builds PEDAL_DEF_MAP at module scope from staticFxPedals.
     * This means pedal name lookups in the ActivePedalsGrid use stale static data
     * even though the hook data is available. The map should be built inside the
     * component (e.g. via useMemo) from the hook-provided fxPedals data.
     *
     * Bug: PEDAL_DEF_MAP is built from staticFxPedals at module scope
     * Expected: PEDAL_DEF_MAP should be derived from useFxPedals() hook data
     */

    const moduleScoreStaticMapPatterns = [
      // Module-scope map built from static data
      /const\s+PEDAL_DEF_MAP[^=]*=\s*\{\s*\}/,
      /for\s*\(\s*const\s+\w+\s+of\s+staticFxPedals\s*\)/,
    ] as const;

    const hookDerivedMapPatterns = [
      // useMemo-based map derived from hook data
      /useMemo\s*\(\s*\(\)\s*=>\s*\{[^}]*fxPedals/,
      /useMemo\s*\([^)]*fxPedals/,
    ] as const;

    it("should NOT build PEDAL_DEF_MAP from staticFxPedals at module scope", () => {
      // Generate random indices into the pattern array to check each pattern
      fc.assert(
        fc.property(
          fc.constantFrom(...moduleScoreStaticMapPatterns),
          (pattern) => {
            const hasStaticModuleScopeMap = pattern.test(livePageSource);
            // Expected behavior: no module-scope static map
            // On unfixed code: this will FAIL because the map IS built from static data
            expect(hasStaticModuleScopeMap).toBe(false);
          },
        ),
        { numRuns: moduleScoreStaticMapPatterns.length },
      );
    });

    it("should derive pedal lookup map from useFxPedals() hook data via useMemo", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...hookDerivedMapPatterns),
          (pattern) => {
            const hasHookDerivedMap = pattern.test(livePageSource);
            // Expected behavior: map is derived from hook data
            // On unfixed code: this will FAIL because no useMemo-based map exists
            expect(hasHookDerivedMap).toBe(true);
          },
        ),
        { numRuns: hookDerivedMapPatterns.length },
      );
    });
  });

  // ─── /presets page bug conditions ────────────────────────────────────────

  describe("/presets page: must NOT use createSeedChains() as primary data source", () => {
    /**
     * The /presets page calls createSeedChains() to initialize useState,
     * making local seed data the primary source of truth instead of Convex queries.
     *
     * Bug: useState<SavedSignalChain[]>(() => createSeedChains())
     * Expected: Use convexChains from useSignalChains as the source of truth
     */

    it("should not define or call createSeedChains()", () => {
      const seedChainPatterns = [
        /function\s+createSeedChains/,
        /createSeedChains\s*\(\s*\)/,
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...seedChainPatterns),
          (pattern) => {
            const hasSeedChains = pattern.test(presetsPageSource);
            // Expected: no createSeedChains function or calls
            // On unfixed code: FAILS because createSeedChains exists and is called
            expect(hasSeedChains).toBe(false);
          },
        ),
        { numRuns: seedChainPatterns.length },
      );
    });

    it("should not use localChains useState as the primary data store", () => {
      const localChainsPatterns = [
        /useState<SavedSignalChain\[\]>\s*\(\s*\(\)\s*=>\s*createSeedChains/,
        /\[localChains,\s*setLocalChains\]/,
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...localChainsPatterns),
          (pattern) => {
            const hasLocalChains = pattern.test(presetsPageSource);
            // Expected: no localChains state initialized from seed data
            // On unfixed code: FAILS because localChains is the primary store
            expect(hasLocalChains).toBe(false);
          },
        ),
        { numRuns: localChainsPatterns.length },
      );
    });
  });

  describe("/presets page: mutations must use Convex as PRIMARY persistence, not fire-and-forget", () => {
    /**
     * The /presets page mutation handlers (save/rename/delete) update local state
     * first via setLocalChains, then fire-and-forget to Convex. This means:
     * - Local state is the source of truth
     * - Convex persistence is a side-effect that may silently fail
     * - Data is lost on page refresh if Convex call fails
     *
     * Expected: Convex mutations should be the primary persistence mechanism.
     * The UI should update reactively via useQuery, not via local state manipulation.
     */

    const mutationHandlerNames = ["handleSaveNew", "confirmRename", "confirmDelete"] as const;

    it("mutation handlers should not use setLocalChains as the primary update mechanism", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...mutationHandlerNames),
          (handlerName) => {
            // Extract the handler function body from source
            const handlerRegex = new RegExp(
              `const\\s+${handlerName}\\s*=\\s*useCallback\\s*\\(([\\s\\S]*?)\\}\\s*,\\s*\\[`,
            );
            const match = presetsPageSource.match(handlerRegex);

            if (!match) {
              // Handler not found — could be refactored, which is fine
              return;
            }

            const handlerBody = match[1];

            // Check if setLocalChains is called in the handler body
            const usesSetLocalChains = /setLocalChains\s*\(/.test(handlerBody);

            // Expected: handlers should NOT call setLocalChains as primary update
            // On unfixed code: FAILS because all handlers call setLocalChains first
            expect(usesSetLocalChains).toBe(false);
          },
        ),
        { numRuns: mutationHandlerNames.length },
      );
    });

    it("mutation handlers should not treat Convex mutations as fire-and-forget side effects", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...mutationHandlerNames),
          (handlerName) => {
            const handlerRegex = new RegExp(
              `const\\s+${handlerName}\\s*=\\s*useCallback\\s*\\(([\\s\\S]*?)\\}\\s*,\\s*\\[`,
            );
            const match = presetsPageSource.match(handlerRegex);

            if (!match) return;

            const handlerBody = match[1];

            // Check for the fire-and-forget pattern: "if (mutations.available) { mutations.xxx }"
            // This pattern means Convex is optional/secondary, not primary
            const hasFireAndForget = /if\s*\(\s*mutations\.available\s*\)/.test(handlerBody);

            // Expected: Convex mutations should be called unconditionally as primary action
            // On unfixed code: FAILS because mutations are wrapped in availability check
            expect(hasFireAndForget).toBe(false);
          },
        ),
        { numRuns: mutationHandlerNames.length },
      );
    });
  });
});
