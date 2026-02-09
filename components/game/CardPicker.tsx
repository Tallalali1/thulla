"use client";

import { useState } from "react";
import { Card, Suit, Rank, SUITS, RANKS } from "@/lib/types";
import { getSuitSymbol, getSuitColor } from "@/lib/utils";

interface CardPickerProps {
  onSelect: (card: Card) => void;
  preselectedSuit?: Suit | null;
  disabledCards?: Card[];
}

function isCardDisabled(suit: Suit, rank: Rank, disabledCards: Card[]): boolean {
  return disabledCards.some((c) => c.suit === suit && c.rank === rank);
}

export function CardPicker({ onSelect, preselectedSuit, disabledCards = [] }: CardPickerProps) {
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(preselectedSuit ?? null);

  const handleRankSelect = (rank: Rank) => {
    if (!selectedSuit) return;
    onSelect({ suit: selectedSuit, rank });
    // Reset suit to preselected for next play
    setSelectedSuit(preselectedSuit ?? null);
  };

  // Count available cards per suit
  const getAvailableCount = (suit: Suit) =>
    RANKS.filter((r) => !isCardDisabled(suit, r, disabledCards)).length;

  return (
    <div>
      {/* Suit row */}
      <div className="flex gap-2 mb-3">
        {SUITS.map((suit) => {
          const available = getAvailableCount(suit);
          return (
            <button
              key={suit}
              onClick={() => setSelectedSuit(suit)}
              disabled={available === 0}
              className={`flex-1 min-h-[44px] rounded-lg flex items-center justify-center transition-all
                ${available === 0
                  ? "opacity-20 pointer-events-none"
                  : selectedSuit === suit
                  ? "bg-zinc-900 dark:bg-white ring-2 ring-zinc-900 dark:ring-white"
                  : "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                }`}
            >
              <span
                className={`text-xl ${
                  selectedSuit === suit
                    ? suit === "hearts" || suit === "diamonds"
                      ? "text-red-400"
                      : "text-white dark:text-zinc-900"
                    : getSuitColor(suit)
                }`}
              >
                {getSuitSymbol(suit)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Rank grid */}
      <div className="grid grid-cols-5 gap-2">
        {RANKS.map((rank) => {
          const disabled = !selectedSuit || isCardDisabled(selectedSuit, rank, disabledCards);
          return (
            <button
              key={rank}
              onClick={() => handleRankSelect(rank)}
              disabled={disabled}
              className={`min-h-[44px] rounded-lg border font-bold text-base transition-all active:scale-95
                ${disabled
                  ? "opacity-20 pointer-events-none bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                  : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
            >
              {rank}
            </button>
          );
        })}
      </div>

      {!selectedSuit && (
        <p className="text-xs text-zinc-400 text-center mt-2">Select a suit first</p>
      )}
    </div>
  );
}
