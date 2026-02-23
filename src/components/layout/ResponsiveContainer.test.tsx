import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ResponsiveContainer } from "./ResponsiveContainer";

describe("ResponsiveContainer", () => {
  it("renders children correctly", () => {
    const { getByText } = render(
      <ResponsiveContainer>
        <div>Test Content</div>
      </ResponsiveContainer>
    );

    expect(getByText("Test Content")).toBeInTheDocument();
  });

  it("applies default classes", () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>Test</div>
      </ResponsiveContainer>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("max-w-full");
    expect(wrapper.className).toContain("px-4");
    expect(wrapper.className).toContain("md:px-6");
    expect(wrapper.className).toContain("lg:px-8");
    expect(wrapper.className).toContain("mx-auto");
  });

  it("applies custom maxWidth", () => {
    const { container } = render(
      <ResponsiveContainer maxWidth="lg">
        <div>Test</div>
      </ResponsiveContainer>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("max-w-lg");
  });

  it("applies custom className", () => {
    const { container } = render(
      <ResponsiveContainer className="custom-class">
        <div>Test</div>
      </ResponsiveContainer>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("custom-class");
  });

  it("applies safe area padding when enabled", () => {
    const { container } = render(
      <ResponsiveContainer enableSafeArea>
        <div>Test</div>
      </ResponsiveContainer>
    );

    const wrapper = container.firstChild as HTMLElement;
    // Check for safe area inset classes
    expect(wrapper.className).toContain("padding-top");
    expect(wrapper.className).toContain("safe-area-inset");
  });

  it("does not apply safe area padding by default", () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>Test</div>
      </ResponsiveContainer>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toContain("safe-area-inset");
  });
});
