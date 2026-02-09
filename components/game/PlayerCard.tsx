"use client";

import { Player, SUITS } from "@/lib/types";
import { getSuitSymbol } from "@/lib/utils";

interface PlayerCardProps {
  player: Player;
  isCurrentTurn: boolean;
  isLead: boolean;
  isMe?: boolean;
}

export function PlayerCard({ player, isCurrentTurn, isLead, isMe }: PlayerCardProps) {
  const missingSuits = player.missingSuits ?? [];

  return (
    <div
      className={`flex-shrink-0 px-3 py-2 rounded-xl border-2 transition-all min-w-[100px] ${
        player.isSafe
          ? "border-green-500/50 bg-green-500/10 opacity-60"
          : isCurrentTurn
          ? "border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800 scale-105"
          : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {isLead && <span className="text-xs">&#9733;</span>}
        <span className="text-sm font-medium truncate">{player.name}</span>
        {isMe && <span className="text-[10px] text-zinc-400 dark:text-zinc-500">(you)</span>}
      </div>
      <div className="text-center">
        {player.isSafe ? (
          <span className="text-green-600 dark:text-green-400 text-xs font-medium">SAFE</span>
        ) : (
          <span className="text-lg font-bold">{player.cardCount}</span>
        )}
      </div>
      {/* Missing suits */}
      {missingSuits.length > 0 && !player.isSafe && (
        <div className="flex items-center justify-center gap-1.5 mt-1.5">
          {SUITS.map((suit) => {
            if (!missingSuits.includes(suit)) return null;
            const isRed = suit === "hearts" || suit === "diamonds";
            return (
              <span
                key={suit}
                className={`text-sm font-bold line-through decoration-2 ${
                  isRed
                    ? "text-red-500 decoration-red-700"
                    : "text-zinc-600 dark:text-zinc-300 decoration-zinc-800 dark:decoration-zinc-100"
                }`}
              >
                {getSuitSymbol(suit)}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
