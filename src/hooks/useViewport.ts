"use client";

import { useSyncExternalStore } from "react";

/**
 * Viewport orientation type
 */
export type Orientation = "portrait" | "landscape";

/**
 * Safe area insets interface
 */
export interface SafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Viewport state interface
 */
export interface ViewportState {
  width: number;
  height: number;
  orientation: Orientation;
  isTouchDevice: boolean;
  hasNotch: boolean;
  safeArea: SafeArea;
}

/**
 * Get safe area inset value from CSS environment variable
 */
function getSafeAreaInset(position: "top" | "right" | "bottom" | "left"): number {
  if (typeof window === "undefined" || !CSS.supports) return 0;

  try {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`env(safe-area-inset-${position})`)
      .trim();

    if (!value) return 0;

    // Parse pixel value
    const pixels = parseFloat(value);
    return isNaN(pixels) ? 0 : pixels;
  } catch {
    return 0;
  }
}

/**
 * Get current viewport state
 */
function getViewportState(): ViewportState {
  // SSR fallback
  if (typeof window === "undefined") {
    return {
      width: 1024,
      height: 768,
      orientation: "landscape",
      isTouchDevice: false,
      hasNotch: false,
      safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const orientation: Orientation = width > height ? "landscape" : "portrait";

  // Detect touch device
  const isTouchDevice =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - legacy property
    navigator.msMaxTouchPoints > 0;

  // Get safe area insets
  const safeArea: SafeArea = {
    top: getSafeAreaInset("top"),
    right: getSafeAreaInset("right"),
    bottom: getSafeAreaInset("bottom"),
    left: getSafeAreaInset("left"),
  };

  // Detect notch (if any safe area inset is greater than 0)
  const hasNotch =
    safeArea.top > 0 ||
    safeArea.right > 0 ||
    safeArea.bottom > 0 ||
    safeArea.left > 0;

  return {
    width,
    height,
    orientation,
    isTouchDevice,
    hasNotch,
    safeArea,
  };
}

/**
 * Subscribe to viewport changes (resize and orientation change)
 */
function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  let timeoutId: NodeJS.Timeout;

  const handleChange = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, 150); // 150ms debounce
  };

  window.addEventListener("resize", handleChange);
  window.addEventListener("orientationchange", handleChange);

  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener("resize", handleChange);
    window.removeEventListener("orientationchange", handleChange);
  };
}

/**
 * Hook to manage viewport state including dimensions, orientation, and safe areas
 * 
 * @returns ViewportState object with viewport information
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { width, height, orientation, isTouchDevice, hasNotch, safeArea } = useViewport();
 *   
 *   return (
 *     <div style={{ paddingTop: safeArea.top }}>
 *       <p>Viewport: {width}x{height}</p>
 *       <p>Orientation: {orientation}</p>
 *       <p>Touch device: {isTouchDevice ? 'Yes' : 'No'}</p>
 *       <p>Has notch: {hasNotch ? 'Yes' : 'No'}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useViewport(): ViewportState {
  // Use useSyncExternalStore for consistency between server and client
  const state = useSyncExternalStore(
    subscribe,
    getViewportState,
    () => ({
      width: 1024,
      height: 768,
      orientation: "landscape" as Orientation,
      isTouchDevice: false,
      hasNotch: false,
      safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
    })
  );

  return state;
}
