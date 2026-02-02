"use client";

import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface OnboardingTooltipProps {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  onDismiss?: () => void;
}

export function OnboardingTooltip({
  id,
  title,
  description,
  children,
  side = "bottom",
  onDismiss,
}: OnboardingTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if this tooltip has been dismissed
    const dismissed = localStorage.getItem(`onboarding_${id}`);
    if (!dismissed) {
      // Small delay to prevent flash
      const timer = setTimeout(() => {
        setShouldShow(true);
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [id]);

  const handleDismiss = () => {
    localStorage.setItem(`onboarding_${id}`, "true");
    setIsOpen(false);
    setShouldShow(false);
    onDismiss?.();
  };

  if (!shouldShow) {
    return <>{children}</>;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side={side} className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          <Button size="sm" onClick={handleDismiss}>
            Got it
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  useEffect(() => {
    // Check if any onboarding tooltips haven't been seen
    const tooltips = ["rating-buttons", "streak-counter", "problem-queue"];
    const unseenTooltips = tooltips.filter(
      (id) => !localStorage.getItem(`onboarding_${id}`)
    );
    if (unseenTooltips.length > 0) {
      setHasSeenOnboarding(false);
    }
  }, []);

  const markOnboardingComplete = () => {
    setHasSeenOnboarding(true);
  };

  return { hasSeenOnboarding, markOnboardingComplete };
}
