import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getMenuOptionsForTarget,
  type ParameterTargetType,
} from "@/lib/context-menu-options";

// ── Property 13: Context menu option completeness ──

/**
 * Property 13: Context menu option completeness
 * **Validates: Requirements 14.5, 26.1, 26.2, 26.3**
 *
 * For any target type (knob, slider, switch, amp, pedal),
 * getMenuOptionsForTarget always returns exactly 4 options.
 * For knob/slider/switch/amp targets, the options always include
 * "Set to Default", "Enter Exact Value", "Copy Value", "Paste Value".
 * For pedal targets, the options always include
 * "Enable/Disable", "Remove from Chain", "Duplicate", "View Settings".
 * No duplicate options exist for any target type.
 */

const allTargetTypes: ParameterTargetType[] = [
  "knob",
  "slider",
  "switch",
  "amp",
  "pedal",
];

const targetTypeArb = fc.constantFrom<ParameterTargetType>(...allTargetTypes);

const knobSliderTargetArb = fc.constantFrom<ParameterTargetType>(
  "knob",
  "slider",
  "switch",
  "amp"
);

const pedalTargetArb = fc.constant<ParameterTargetType>("pedal");

describe("Property 13: Context menu option completeness", () => {
  it("always returns exactly 4 options for any target type", () => {
    fc.assert(
      fc.property(targetTypeArb, (targetType) => {
        const options = getMenuOptionsForTarget(targetType);
        expect(options).toHaveLength(4);
      }),
      { numRuns: 200 }
    );
  });

  it("knob/slider/switch/amp targets always include Set to Default, Enter Exact Value, Copy Value, Paste Value", () => {
    fc.assert(
      fc.property(knobSliderTargetArb, (targetType) => {
        const options = getMenuOptionsForTarget(targetType);
        expect(options).toContain("Set to Default");
        expect(options).toContain("Enter Exact Value");
        expect(options).toContain("Copy Value");
        expect(options).toContain("Paste Value");
      }),
      { numRuns: 200 }
    );
  });

  it("pedal targets always include Enable/Disable, Remove from Chain, Duplicate, View Settings", () => {
    fc.assert(
      fc.property(pedalTargetArb, (targetType) => {
        const options = getMenuOptionsForTarget(targetType);
        expect(options).toContain("Enable/Disable");
        expect(options).toContain("Remove from Chain");
        expect(options).toContain("Duplicate");
        expect(options).toContain("View Settings");
      }),
      { numRuns: 200 }
    );
  });

  it("no duplicate options exist for any target type", () => {
    fc.assert(
      fc.property(targetTypeArb, (targetType) => {
        const options = getMenuOptionsForTarget(targetType);
        const uniqueOptions = new Set(options);
        expect(uniqueOptions.size).toBe(options.length);
      }),
      { numRuns: 200 }
    );
  });
});
