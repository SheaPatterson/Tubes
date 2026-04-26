import { describe, it, expect } from "vitest";
import {
  getMenuOptionsForTarget,
  type ParameterTargetType,
} from "@/lib/context-menu-options";

describe("getMenuOptionsForTarget", () => {
  it("returns knob/slider options for 'knob' target", () => {
    const options = getMenuOptionsForTarget("knob");
    expect(options).toEqual([
      "Set to Default",
      "Enter Exact Value",
      "Copy Value",
      "Paste Value",
    ]);
  });

  it("returns knob/slider options for 'slider' target", () => {
    const options = getMenuOptionsForTarget("slider");
    expect(options).toEqual([
      "Set to Default",
      "Enter Exact Value",
      "Copy Value",
      "Paste Value",
    ]);
  });

  it("returns knob/slider options for 'switch' target", () => {
    const options = getMenuOptionsForTarget("switch");
    expect(options).toEqual([
      "Set to Default",
      "Enter Exact Value",
      "Copy Value",
      "Paste Value",
    ]);
  });

  it("returns knob/slider options for 'amp' target", () => {
    const options = getMenuOptionsForTarget("amp");
    expect(options).toEqual([
      "Set to Default",
      "Enter Exact Value",
      "Copy Value",
      "Paste Value",
    ]);
  });

  it("returns pedal options for 'pedal' target", () => {
    const options = getMenuOptionsForTarget("pedal");
    expect(options).toEqual([
      "Enable/Disable",
      "Remove from Chain",
      "Duplicate",
      "View Settings",
    ]);
  });

  it("returns exactly 4 options for every target type", () => {
    const targets: ParameterTargetType[] = [
      "knob",
      "slider",
      "switch",
      "pedal",
      "amp",
    ];
    for (const t of targets) {
      expect(getMenuOptionsForTarget(t)).toHaveLength(4);
    }
  });
});
