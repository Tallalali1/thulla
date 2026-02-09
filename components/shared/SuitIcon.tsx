"use client";

import { Suit } from "@/lib/types";
import { getSuitSymbol, getSuitColor } from "@/lib/utils";

interface SuitIconProps {
  suit: Suit;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
};

export function SuitIcon({ suit, size = "md" }: SuitIconProps) {
  return (
    <span className={`${getSuitColor(suit)} ${sizeClasses[size]}`}>
      {getSuitSymbol(suit)}
    </span>
  );
}
