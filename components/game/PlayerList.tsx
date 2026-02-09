"use client";

import { Player } from "@/lib/types";
import { PlayerCard } from "./PlayerCard";

interface PlayerListProps {
  players: Player[];
  currentTurnPlayerId: string | null;
  leadPlayerId: string | null;
  myPlayerId?: string | null;
}

export function PlayerList({ players, currentTurnPlayerId, leadPlayerId, myPlayerId }: PlayerListProps) {
  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4">
      <div className="flex gap-2" style={{ scrollSnapType: "x mandatory" }}>
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isCurrentTurn={player.id === currentTurnPlayerId}
            isLead={player.id === leadPlayerId}
            isMe={player.id === myPlayerId}
          />
        ))}
      </div>
    </div>
  );
}
