/**
 * Responsive utility functions for mobile adaptation
 */

import type { Breakpoint } from "@/hooks/useBreakpoint";

/**
 * Breakpoint values matching Tailwind CSS
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Check if current width is mobile viewport (< 768px)
 */
export function isMobileViewport(width: number): boolean {
  return width < BREAKPOINTS.md;
}

/**
 * Check if current width is tablet viewport (768px - 1024px)
 */
export function isTabletViewport(width: number): boolean {
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
}

/**
 * Check if current width is desktop viewport (>= 1024px)
 */
export function isDesktopViewport(width: number): boolean {
  return width >= BREAKPOINTS.lg;
}

/**
 * Get breakpoint from width
 */
export function getBreakpointFromWidth(width: number): Breakpoint {
  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
}

/**
 * Check if breakpoint is mobile
 */
export function isBreakpointMobile(breakpoint: Breakpoint): boolean {
  return breakpoint === "xs" || breakpoint === "sm";
}

/**
 * Check if breakpoint is tablet
 */
export function isBreakpointTablet(breakpoint: Breakpoint): boolean {
  return breakpoint === "md";
}

/**
 * Check if breakpoint is desktop
 */
export function isBreakpointDesktop(breakpoint: Breakpoint): boolean {
  return breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl";
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate responsive font size using fluid typography
 * 
 * @param minSize - Minimum font size in pixels
 * @param maxSize - Maximum font size in pixels
 * @param minWidth - Minimum viewport width (default: 320px)
 * @param maxWidth - Maximum viewport width (default: 1280px)
 * @returns CSS calc() string for fluid typography
 * 
 * @example
 * ```tsx
 * const fontSize = fluidTypography(16, 24, 320, 1280);
 * // Returns: "clamp(16px, calc(16px + (24 - 16) * ((100vw - 320px) / (1280 - 320))), 24px)"
 * ```
 */
export function fluidTypography(
  minSize: number,
  maxSize: number,
  minWidth: number = 320,
  maxWidth: number = 1280
): string {
  const slope = (maxSize - minSize) / (maxWidth - minWidth);
  const yAxisIntersection = -minWidth * slope + minSize;

  return `clamp(${minSize}px, ${yAxisIntersection}px + ${slope * 100}vw, ${maxSize}px)`;
}

/**
 * Get responsive padding based on viewport width
 * 
 * @param width - Current viewport width
 * @returns Padding value in pixels
 */
export function getResponsivePadding(width: number): number {
  if (width < BREAKPOINTS.sm) return 16; // Mobile: 16px
  if (width < BREAKPOINTS.md) return 24; // Small tablet: 24px
  if (width < BREAKPOINTS.lg) return 32; // Tablet: 32px
  return 48; // Desktop: 48px
}

/**
 * Get responsive grid columns based on viewport width
 * 
 * @param width - Current viewport width
 * @param maxColumns - Maximum number of columns (default: 4)
 * @returns Number of columns
 */
export function getResponsiveColumns(width: number, maxColumns: number = 4): number {
  if (width < BREAKPOINTS.sm) return 1; // Mobile: 1 column
  if (width < BREAKPOINTS.md) return 2; // Small tablet: 2 columns
  if (width < BREAKPOINTS.lg) return 3; // Tablet: 3 columns
  return Math.min(maxColumns, 4); // Desktop: up to maxColumns
}

/**
 * Check if element is in single-hand zone (bottom 60% of screen)
 * 
 * @param elementY - Y position of element
 * @param viewportHeight - Viewport height
 * @returns True if element is in single-hand zone
 */
export function isInSingleHandZone(elementY: number, viewportHeight: number): boolean {
  const singleHandZoneStart = viewportHeight * 0.4; // Top 40% is out of reach
  return elementY >= singleHandZoneStart;
}

/**
 * Calculate optimal line length for readability (45-75 characters)
 * 
 * @param fontSize - Font size in pixels
 * @param containerWidth - Container width in pixels
 * @returns Optimal max-width in pixels
 */
export function getOptimalLineLength(fontSize: number, containerWidth: number): number {
  const optimalCharacters = 65; // Optimal: 65 characters per line
  const characterWidth = fontSize * 0.5; // Approximate character width
  const optimalWidth = optimalCharacters * characterWidth;

  return Math.min(optimalWidth, containerWidth);
}

/**
 * Debounce function for performance optimization
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Throttle function for performance optimization
 * 
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;

  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - legacy property
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get safe area inset value
 * 
 * @param position - Position (top, right, bottom, left)
 * @returns Safe area inset in pixels
 */
export function getSafeAreaInset(
  position: "top" | "right" | "bottom" | "left"
): number {
  if (typeof window === "undefined" || !CSS.supports) return 0;

  try {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`env(safe-area-inset-${position})`)
      .trim();

    if (!value) return 0;

    const pixels = parseFloat(value);
    return isNaN(pixels) ? 0 : pixels;
  } catch {
    return 0;
  }
}

/**
 * Format bytes to human-readable string
 * 
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
