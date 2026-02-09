"use client";

import { Suit, SUITS } from "@/lib/types";
import { getSuitSymbol, getSuitColor } from "@/lib/utils";

interface SuitPickerProps {
  onSelect: (suit: Suit) => void;
  forcedSuit?: Suit | null;
}

const suitNames: Record<Suit, string> = {
  spades: "Spades",
  hearts: "Hearts",
  diamonds: "Diamonds",
  clubs: "Clubs",
};

export function SuitPicker({ onSelect, forcedSuit }: SuitPickerProps) {
  return (
    <div className="text-center">
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
        {forcedSuit ? "First round — must play" : "Pick a suit to lead"}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {SUITS.map((suit) => (
          <button
            key={suit}
            onClick={() => onSelect(suit)}
            disabled={forcedSuit !== undefined && forcedSuit !== null && suit !== forcedSuit}
            className={`min-h-[60px] rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all
              ${forcedSuit && suit !== forcedSuit
                ? "opacity-30 border-zinc-200 dark:border-zinc-700"
                : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-500 dark:hover:border-zinc-400 active:scale-95"
              }`}
          >
            <span className={`text-2xl ${getSuitColor(suit)}`}>{getSuitSymbol(suit)}</span>
            <span className="text-xs font-medium">{suitNames[suit]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
