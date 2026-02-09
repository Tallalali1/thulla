"use client";

import { Player } from "@/lib/types";

interface PlayerCardProps {
  player: Player;
  isCurrentTurn: boolean;
  isLead: boolean;
}

export function PlayerCard({ player, isCurrentTurn, isLead }: PlayerCardProps) {
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
      </div>
      <div className="text-center">
        {player.isSafe ? (
          <span className="text-green-600 dark:text-green-400 text-xs font-medium">SAFE</span>
        ) : (
          <span className="text-lg font-bold">{player.cardCount}</span>
        )}
      </div>
    </div>
  );
}
