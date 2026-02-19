"use client";

import {
  HeroSection,
  ProductIntroSection,
  PainPointsSection,
  CoreFeaturesSection,
  WorkflowSection,
  PromptOptimizerSection,
  AgentMatrixSection,
  CTASection,
} from "./sections";

export function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProductIntroSection />
      <PainPointsSection />
      <CoreFeaturesSection />
      <WorkflowSection />
      <PromptOptimizerSection />
      <AgentMatrixSection />
      <CTASection />
    </div>
  );
}
