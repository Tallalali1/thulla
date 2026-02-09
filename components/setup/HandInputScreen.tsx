"use client";

import { useState } from "react";
import { useGame } from "@/lib/GameContext";
import { Card, Suit, Rank, SUITS, RANKS } from "@/lib/types";
import { getSuitSymbol, getSuitColor } from "@/lib/utils";
import { Button } from "@/components/shared/Button";

function cardKey(card: Card): string {
  return `${card.suit}-${card.rank}`;
}

export function HandInputScreen() {
  const { state, dispatch } = useGame();
  const { players, myPlayerId } = state;

  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  // Step 1: Select which player you are
  if (!myPlayerId) {
    return (
      <div className="min-h-dvh flex flex-col px-4 py-8 max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Which player are you?</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Select yourself to track your cards
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {players.map((player) => (
            <Button
              key={player.id}
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => dispatch({ type: "SET_MY_PLAYER", playerId: player.id })}
            >
              {player.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Input your cards
  const myPlayer = players.find((p) => p.id === myPlayerId);
  const expectedCount = myPlayer?.cardCount ?? 0;

  const isSelected = (suit: Suit, rank: Rank) =>
    selectedCards.some((c) => c.suit === suit && c.rank === rank);

  const toggleCard = (suit: Suit, rank: Rank) => {
    if (isSelected(suit, rank)) {
      setSelectedCards(selectedCards.filter((c) => !(c.suit === suit && c.rank === rank)));
    } else {
      setSelectedCards([...selectedCards, { suit, rank }]);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col px-4 py-6 max-w-md mx-auto">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold mb-1">Your Cards</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Tap to select the cards in your hand
        </p>
        <p className={`text-sm font-medium mt-2 ${
          selectedCards.length === expectedCount
            ? "text-green-600 dark:text-green-400"
            : "text-zinc-500 dark:text-zinc-400"
        }`}>
          {selectedCards.length} / {expectedCount} selected
        </p>
      </div>

      {/* Card grid by suit */}
      <div className="flex-1 space-y-3">
        {SUITS.map((suit) => (
          <div key={suit}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`text-lg ${getSuitColor(suit)}`}>{getSuitSymbol(suit)}</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {RANKS.map((rank) => (
                <button
                  key={`${suit}-${rank}`}
                  onClick={() => toggleCard(suit, rank)}
                  className={`min-h-[38px] rounded-lg text-sm font-bold transition-all active:scale-95 ${
                    isSelected(suit, rank)
                      ? suit === "hearts" || suit === "diamonds"
                        ? "bg-red-500 text-white ring-2 ring-red-400"
                        : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 ring-2 ring-zinc-600 dark:ring-zinc-300"
                      : "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {rank}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Button
          size="lg"
          className="w-full"
          disabled={selectedCards.length !== expectedCount}
          onClick={() => dispatch({ type: "SET_MY_HAND", cards: selectedCards })}
        >
          {selectedCards.length === expectedCount
            ? "Confirm Cards"
            : `Select ${expectedCount - selectedCards.length} more`}
        </Button>
      </div>
    </div>
  );
}
