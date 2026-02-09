"use client";

import { PlayedCard, Player } from "@/lib/types";
import { SuitIcon } from "@/components/shared/SuitIcon";

interface PlayedCardsListProps {
  plays: PlayedCard[];
  players: Player[];
}

export function PlayedCardsList({ plays, players }: PlayedCardsListProps) {
  if (plays.length === 0) return null;

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name ?? "Unknown";

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        Cards Played
      </p>
      <div className="space-y-1.5">
        {plays.map((play, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-3 py-2 rounded-lg ${
              play.isOffSuit
                ? "bg-red-500/10 border border-red-500/30"
                : "bg-zinc-50 dark:bg-zinc-800/50"
            }`}
          >
            <span className="text-sm font-medium">{getPlayerName(play.playerId)}</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold">{play.card.rank}</span>
              <SuitIcon suit={play.card.suit} size="sm" />
              {play.isOffSuit && (
                <span className="text-xs font-bold text-red-500 ml-1">THULLA!</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
