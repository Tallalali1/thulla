"use client";

import { useState } from "react";
import { Card, Suit, Rank, SUITS, RANKS } from "@/lib/types";
import { getSuitSymbol, getSuitColor } from "@/lib/utils";

interface CardPickerProps {
  onSelect: (card: Card) => void;
  preselectedSuit?: Suit | null;
}

export function CardPicker({ onSelect, preselectedSuit }: CardPickerProps) {
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(preselectedSuit ?? null);

  const handleRankSelect = (rank: Rank) => {
    if (!selectedSuit) return;
    onSelect({ suit: selectedSuit, rank });
    // Reset suit to preselected for next play
    setSelectedSuit(preselectedSuit ?? null);
  };

  return (
    <div>
      {/* Suit row */}
      <div className="flex gap-2 mb-3">
        {SUITS.map((suit) => (
          <button
            key={suit}
            onClick={() => setSelectedSuit(suit)}
            className={`flex-1 min-h-[44px] rounded-lg flex items-center justify-center transition-all
              ${selectedSuit === suit
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
        ))}
      </div>

      {/* Rank grid */}
      <div className="grid grid-cols-5 gap-2">
        {RANKS.map((rank) => (
          <button
            key={rank}
            onClick={() => handleRankSelect(rank)}
            disabled={!selectedSuit}
            className="min-h-[44px] rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-base transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 disabled:opacity-30"
          >
            {rank}
          </button>
        ))}
      </div>

      {!selectedSuit && (
        <p className="text-xs text-zinc-400 text-center mt-2">Select a suit first</p>
      )}
    </div>
  );
}
