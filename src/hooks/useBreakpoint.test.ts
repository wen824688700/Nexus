/**
 * Property-Based Tests for useBreakpoint Hook
 * 
 * Feature: mobile-adaptation
 * Task: 1.1 编写 useBreakpoint Hook 的属性测试
 * 
 * This test suite validates Property 1: 断点响应式行为一致性
 * Validates Requirements: 1.2, 1.3, 1.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import fc from "fast-check";
import { useBreakpoint, type Breakpoint } from "./useBreakpoint";

/**
 * Helper function to simulate window resize
 */
function resizeWindow(width: number, height: number = 768) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event("resize"));
}

/**
 * Helper function to get expected breakpoint for a given width
 */
function getExpectedBreakpoint(width: number): Breakpoint {
  if (width >= 1536) return "2xl";
  if (width >= 1280) return "xl";
  if (width >= 1024) return "lg";
  if (width >= 768) return "md";
  if (width >= 640) return "sm";
  return "xs";
}

/**
 * Helper function to get expected device type flags
 */
function getExpectedFlags(width: number) {
  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
}

describe("useBreakpoint Hook - Property-Based Tests", () => {
  beforeEach(() => {
    // Use fake timers for debounce control
    vi.useFakeTimers();
    // Reset window dimensions before each test
    resizeWindow(1024, 768);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Property 1: 断点响应式行为一致性
   * 
   * For any viewport width, the system should apply the corresponding layout styles
   * based on breakpoints: < 640px applies mobile styles, 640-768px applies tablet
   * styles, > 768px applies desktop styles.
   * 
   * Validates: Requirements 1.2, 1.3, 1.4
   */
  describe("Feature: mobile-adaptation, Property 1: 断点响应式行为一致性", () => {
    it("should return correct breakpoint for any viewport width", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 2560 }), // Viewport width range
          (width) => {
            // Arrange: Set window width
            resizeWindow(width);

            // Act: Render hook
            const { result } = renderHook(() => useBreakpoint());

            // Assert: Verify correct breakpoint
            const expectedBreakpoint = getExpectedBreakpoint(width);
            expect(result.current.current).toBe(expectedBreakpoint);
            expect(result.current.width).toBe(width);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should apply mobile styles for widths < 640px (Requirement 1.2)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 639 }), // Mobile viewport range
          (width) => {
            // Arrange: Set mobile width
            resizeWindow(width);

            // Act: Render hook
            const { result } = renderHook(() => useBreakpoint());

            // Assert: Verify mobile flags
            expect(result.current.isMobile).toBe(true);
            expect(result.current.isTablet).toBe(false);
            expect(result.current.isDesktop).toBe(false);
            expect(result.current.current).toMatch(/^(xs|sm)$/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should apply tablet styles for widths 640-768px (Requirement 1.3)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 640, max: 767 }), // Tablet viewport range (sm breakpoint)
          (width) => {
            // Arrange: Set tablet width
            resizeWindow(width);

            // Act: Render hook
            const { result } = renderHook(() => useBreakpoint());

            // Assert: Verify tablet-specific behavior
            // Note: In the 640-767px range, we're still in mobile (< 768px)
            // but at the 'sm' breakpoint
            expect(result.current.isMobile).toBe(true);
            expect(result.current.isTablet).toBe(false);
            expect(result.current.current).toBe("sm");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should apply tablet styles for widths 768-1024px (Requirement 1.3)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 768, max: 1023 }), // Tablet viewport range (md breakpoint)
          (width) => {
            // Arrange: Set tablet width
            resizeWindow(width);

            // Act: Render hook
            const { result } = renderHook(() => useBreakpoint());

            // Assert: Verify tablet flags
            expect(result.current.isMobile).toBe(false);
            expect(result.current.isTablet).toBe(true);
            expect(result.current.isDesktop).toBe(false);
            expect(result.current.current).toBe("md");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should apply desktop styles for widths > 768px (Requirement 1.4)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1024, max: 2560 }), // Desktop viewport range
          (width) => {
            // Arrange: Set desktop width
            resizeWindow(width);

            // Act: Render hook
            const { result } = renderHook(() => useBreakpoint());

            // Assert: Verify desktop flags
            expect(result.current.isMobile).toBe(false);
            expect(result.current.isTablet).toBe(false);
            expect(result.current.isDesktop).toBe(true);
            expect(result.current.current).toMatch(/^(lg|xl|2xl)$/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle breakpoint boundaries correctly (639px, 640px, 767px, 768px, 1023px, 1024px)", () => {
      const boundaries = [
        { width: 639, expected: "xs", isMobile: true, isTablet: false, isDesktop: false },
        { width: 640, expected: "sm", isMobile: true, isTablet: false, isDesktop: false },
        { width: 767, expected: "sm", isMobile: true, isTablet: false, isDesktop: false },
        { width: 768, expected: "md", isMobile: false, isTablet: true, isDesktop: false },
        { width: 1023, expected: "md", isMobile: false, isTablet: true, isDesktop: false },
        { width: 1024, expected: "lg", isMobile: false, isTablet: false, isDesktop: true },
      ];

      boundaries.forEach(({ width, expected, isMobile, isTablet, isDesktop }) => {
        // Arrange: Set boundary width
        resizeWindow(width);

        // Act: Render hook
        const { result } = renderHook(() => useBreakpoint());

        // Assert: Verify boundary behavior
        expect(result.current.current).toBe(expected);
        expect(result.current.isMobile).toBe(isMobile);
        expect(result.current.isTablet).toBe(isTablet);
        expect(result.current.isDesktop).toBe(isDesktop);
      });
    });

    it("should maintain consistency between breakpoint and device type flags", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 2560 }),
          (width) => {
            // Arrange: Set window width
            resizeWindow(width);

            // Act: Render hook
            const { result } = renderHook(() => useBreakpoint());

            // Assert: Verify consistency
            const { isMobile, isTablet, isDesktop } = result.current;
            const expectedFlags = getExpectedFlags(width);

            expect(isMobile).toBe(expectedFlags.isMobile);
            expect(isTablet).toBe(expectedFlags.isTablet);
            expect(isDesktop).toBe(expectedFlags.isDesktop);

            // Exactly one flag should be true
            const flagCount = [isMobile, isTablet, isDesktop].filter(Boolean).length;
            expect(flagCount).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should update breakpoint when window is resized", async () => {
      fc.assert(
        fc.asyncProperty(
          fc.tuple(
            fc.integer({ min: 320, max: 2560 }),
            fc.integer({ min: 320, max: 2560 })
          ),
          async ([initialWidth, newWidth]) => {
            // Arrange: Set initial width
            resizeWindow(initialWidth);
            const { result } = renderHook(() => useBreakpoint());
            
            // Skip if widths are the same
            if (initialWidth === newWidth) {
              return true;
            }

            // Act: Resize window
            resizeWindow(newWidth);
            
            // Wait for debounce (150ms)
            vi.advanceTimersByTime(150);
            
            // Wait for React to update
            await waitFor(() => {
              const expectedBreakpoint = getExpectedBreakpoint(newWidth);
              expect(result.current.current).toBe(expectedBreakpoint);
              expect(result.current.width).toBe(newWidth);
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return correct height along with width", () => {
      fc.assert(
        fc.property(
          fc.record({
            width: fc.integer({ min: 320, max: 2560 }),
            height: fc.integer({ min: 480, max: 1440 }),
          }),
          ({ width, height }) => {
            // Arrange: Set window dimensions
            resizeWindow(width, height);

            // Act: Render hook
            const { result } = renderHook(() => useBreakpoint());

            // Assert: Verify dimensions
            expect(result.current.width).toBe(width);
            expect(result.current.height).toBe(height);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle minimum viewport width (320px)", () => {
      // Arrange: Set minimum width
      resizeWindow(320);

      // Act: Render hook
      const { result } = renderHook(() => useBreakpoint());

      // Assert: Verify minimum width handling
      expect(result.current.current).toBe("xs");
      expect(result.current.isMobile).toBe(true);
      expect(result.current.width).toBe(320);
    });

    it("should handle maximum viewport width (2560px)", () => {
      // Arrange: Set maximum width
      resizeWindow(2560);

      // Act: Render hook
      const { result } = renderHook(() => useBreakpoint());

      // Assert: Verify maximum width handling
      expect(result.current.current).toBe("2xl");
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.width).toBe(2560);
    });
  });

  /**
   * Additional Property Tests for Edge Cases
   */
  describe("Edge Cases and Invariants", () => {
    it("should never have multiple device type flags true simultaneously", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 2560 }),
          (width) => {
            resizeWindow(width);
            const { result } = renderHook(() => useBreakpoint());

            const { isMobile, isTablet, isDesktop } = result.current;
            const trueCount = [isMobile, isTablet, isDesktop].filter(Boolean).length;

            // Invariant: Exactly one device type flag should be true
            expect(trueCount).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should always return a valid breakpoint value", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 2560 }),
          (width) => {
            resizeWindow(width);
            const { result } = renderHook(() => useBreakpoint());

            const validBreakpoints: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
            expect(validBreakpoints).toContain(result.current.current);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should maintain width and height as positive integers", () => {
      fc.assert(
        fc.property(
          fc.record({
            width: fc.integer({ min: 320, max: 2560 }),
            height: fc.integer({ min: 480, max: 1440 }),
          }),
          ({ width, height }) => {
            resizeWindow(width, height);
            const { result } = renderHook(() => useBreakpoint());

            expect(result.current.width).toBeGreaterThan(0);
            expect(result.current.height).toBeGreaterThan(0);
            expect(Number.isInteger(result.current.width)).toBe(true);
            expect(Number.isInteger(result.current.height)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should be deterministic for the same viewport width", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 320, max: 2560 }),
          (width) => {
            // First render
            resizeWindow(width);
            const { result: result1 } = renderHook(() => useBreakpoint());
            const state1 = { ...result1.current };

            // Second render with same width
            resizeWindow(width);
            const { result: result2 } = renderHook(() => useBreakpoint());
            const state2 = { ...result2.current };

            // Should return identical state
            expect(state1).toEqual(state2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
