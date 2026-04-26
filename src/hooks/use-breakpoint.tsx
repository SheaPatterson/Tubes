"use client";

import * as React from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

const BREAKPOINTS = {
  /** < 768px */
  mobile: 0,
  /** 768px – 1023px */
  tablet: 768,
  /** ≥ 1024px */
  desktop: 1024,
} as const;

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.desktop) return "desktop";
  if (width >= BREAKPOINTS.tablet) return "tablet";
  return "mobile";
}

/**
 * Returns the current viewport breakpoint: "mobile" | "tablet" | "desktop".
 * Uses matchMedia listeners for efficient updates without resize polling.
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>("desktop");

  React.useEffect(() => {
    // Set initial value
    setBreakpoint(getBreakpoint(window.innerWidth));

    const tabletMql = window.matchMedia(
      `(min-width: ${BREAKPOINTS.tablet}px)`
    );
    const desktopMql = window.matchMedia(
      `(min-width: ${BREAKPOINTS.desktop}px)`
    );

    const update = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    tabletMql.addEventListener("change", update);
    desktopMql.addEventListener("change", update);

    return () => {
      tabletMql.removeEventListener("change", update);
      desktopMql.removeEventListener("change", update);
    };
  }, []);

  return breakpoint;
}

/**
 * Returns true when the viewport is below the desktop breakpoint (< 1024px).
 * Useful for toggling between full and collapsible layouts.
 */
export function useIsCompact(): boolean {
  return useBreakpoint() !== "desktop";
}
