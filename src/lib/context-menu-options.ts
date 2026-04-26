/**
 * Target types for the parameter context menu system.
 */
export type ParameterTargetType =
  | "knob"
  | "slider"
  | "switch"
  | "pedal"
  | "amp";

/** Knob/slider menu option labels (Requirement 26.2). */
export const KNOB_SLIDER_OPTIONS = [
  "Set to Default",
  "Enter Exact Value",
  "Copy Value",
  "Paste Value",
] as const;

/** FX pedal menu option labels (Requirement 26.3). */
export const PEDAL_OPTIONS = [
  "Enable/Disable",
  "Remove from Chain",
  "Duplicate",
  "View Settings",
] as const;

/**
 * Returns the list of context-menu option labels for a given target type.
 *
 * - knob / slider / switch / amp → Set to Default, Enter Exact Value, Copy Value, Paste Value
 * - pedal → Enable/Disable, Remove from Chain, Duplicate, View Settings
 */
export function getMenuOptionsForTarget(
  targetType: ParameterTargetType
): string[] {
  if (targetType === "pedal") {
    return [...PEDAL_OPTIONS];
  }
  return [...KNOB_SLIDER_OPTIONS];
}
