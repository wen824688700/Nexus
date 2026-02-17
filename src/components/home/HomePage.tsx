"use client";

import {
  HeroSection,
  PainPointsSection,
  CoreFeaturesSection,
  WorkflowSection,
  PromptOptimizerSection,
  CTASection,
} from "./sections";

export function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PainPointsSection />
      <CoreFeaturesSection />
      <WorkflowSection />
      <PromptOptimizerSection />
      <CTASection />
    </div>
  );
}
