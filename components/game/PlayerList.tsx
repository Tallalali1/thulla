"use client";

import { Player } from "@/lib/types";
import { PlayerCard } from "./PlayerCard";

interface PlayerListProps {
  players: Player[];
  currentTurnPlayerId: string | null;
  leadPlayerId: string | null;
  myPlayerId?: string | null;
  selectedPlayerId?: string | null;
  onSelectPlayer?: (playerId: string) => void;
}

export function PlayerList({ players, currentTurnPlayerId, leadPlayerId, myPlayerId, selectedPlayerId, onSelectPlayer }: PlayerListProps) {
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
            isSelected={player.id === selectedPlayerId}
            onTap={onSelectPlayer ? () => onSelectPlayer(player.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
