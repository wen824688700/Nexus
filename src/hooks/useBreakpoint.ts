"use client";

import { useSyncExternalStore } from "react";

/**
 * Breakpoint types matching Tailwind CSS breakpoints
 */
export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * Breakpoint state interface
 */
export interface BreakpointState {
  current: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

/**
 * Breakpoint definitions matching Tailwind CSS
 */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Get current breakpoint based on window width
 */
function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
}

/**
 * Cached breakpoint state to prevent infinite loops
 */
let cachedState: BreakpointState | null = null;

/**
 * Get breakpoint state from window dimensions
 */
function getBreakpointState(): BreakpointState {
  // SSR fallback
  if (typeof window === "undefined") {
    return {
      current: "lg",
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      width: 1024,
      height: 768,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const current = getBreakpoint(width);

  const newState = {
    current,
    isMobile: width < BREAKPOINTS.md, // < 768px
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg, // 768px - 1024px
    isDesktop: width >= BREAKPOINTS.lg, // >= 1024px
    width,
    height,
  };

  // Cache the state to prevent infinite loops
  // Only update cache if values actually changed
  if (
    !cachedState ||
    cachedState.width !== newState.width ||
    cachedState.height !== newState.height
  ) {
    cachedState = newState;
  }

  return cachedState;
}

/**
 * Subscribe to window resize events with debouncing
 */
function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  let timeoutId: NodeJS.Timeout;

  const handleResize = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      // Invalidate cache on resize
      cachedState = null;
      callback();
    }, 150); // 150ms debounce
  };

  window.addEventListener("resize", handleResize);

  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener("resize", handleResize);
  };
}

/**
 * Hook to detect current viewport breakpoint
 * 
 * @returns BreakpointState object with current breakpoint and device type flags
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMobile, isTablet, isDesktop, current } = useBreakpoint();
 *   
 *   return (
 *     <div>
 *       {isMobile && <MobileView />}
 *       {isTablet && <TabletView />}
 *       {isDesktop && <DesktopView />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBreakpoint(): BreakpointState {
  // Use useSyncExternalStore for consistency between server and client
  const state = useSyncExternalStore(
    subscribe,
    getBreakpointState,
    () => ({
      current: "lg" as Breakpoint,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      width: 1024,
      height: 768,
    })
  );

  return state;
}
