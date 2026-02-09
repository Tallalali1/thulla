"use client";

import { useState } from "react";
import { useGame } from "@/lib/GameContext";
import { PlayerList } from "./PlayerList";
import { RoundTracker } from "./RoundTracker";
import { Button } from "@/components/shared/Button";
import { SuitIcon } from "@/components/shared/SuitIcon";
import { HandInputScreen } from "@/components/setup/HandInputScreen";
import { SUITS, RANK_VALUES, Player } from "@/lib/types";

function PlayerHandView({ player, isMe }: { player: Player; isMe: boolean }) {
  const hand = player.hand ?? [];
  if (hand.length === 0) return null;

  const handBySuit = SUITS.map((suit) => ({
    suit,
    cards: hand
      .filter((c) => c.suit === suit)
      .sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]),
  })).filter((g) => g.cards.length > 0);

  return (
    <div className="flex flex-wrap gap-1.5">
      {handBySuit.map(({ suit, cards }) =>
        cards.map((card) => (
          <span
            key={`${card.suit}-${card.rank}`}
            className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-medium"
          >
            <span className="font-bold">{card.rank}</span>
            <SuitIcon suit={suit} size="sm" />
          </span>
        ))
      )}
    </div>
  );
}

export function GameScreen() {
  const { state, dispatch } = useGame();
  const { currentRound, players, roundNumber, pendingAceOfSpadesSelection, pendingHandInput, myPlayerId } = state;
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(myPlayerId);

  // Show hand input screen if pending
  if (pendingHandInput) {
    return <HandInputScreen />;
  }

  const currentTurnPlayerId = currentRound
    ? players[currentRound.currentTurnPlayerIndex]?.id ?? null
    : null;
  const leadPlayerId = currentRound?.leadPlayerId ?? null;

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
  const selectedHand = selectedPlayer?.hand ?? [];
  const isSelectedMe = selectedPlayerId === myPlayerId;

  return (
    <div className="min-h-dvh flex flex-col px-4 py-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Round {roundNumber}</h2>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            if (confirm("End this game and start over?")) {
              dispatch({ type: "NEW_GAME" });
            }
          }}
        >
          End Game
        </Button>
      </div>

      {/* Player status bar — tappable */}
      <PlayerList
        players={players}
        currentTurnPlayerId={currentTurnPlayerId}
        leadPlayerId={leadPlayerId}
        myPlayerId={myPlayerId}
        selectedPlayerId={selectedPlayerId}
        onSelectPlayer={(id) =>
          setSelectedPlayerId(id === selectedPlayerId ? null : id)
        }
      />

      {/* Selected player's known cards */}
      {selectedPlayer && selectedHand.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
            {isSelectedMe ? "My" : `${selectedPlayer.name}'s`} Known Cards ({selectedHand.length}
            {!isSelectedMe && ` of ${selectedPlayer.cardCount}`})
          </p>
          <PlayerHandView player={selectedPlayer} isMe={isSelectedMe} />
        </div>
      )}
      {selectedPlayer && selectedHand.length === 0 && !isSelectedMe && !selectedPlayer.isSafe && (
        <div className="mt-3">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
            No known cards for {selectedPlayer.name}
          </p>
        </div>
      )}

      {/* Ace of Spades selection */}
      {pendingAceOfSpadesSelection && (
        <div className="mt-4 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <p className="text-sm font-medium text-center mb-3">
            Who has the Ace of Spades?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {players
              .filter((p) => !p.isSafe)
              .map((player) => (
                <Button
                  key={player.id}
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    dispatch({
                      type: "SELECT_ACE_OF_SPADES_HOLDER",
                      playerId: player.id,
                    })
                  }
                >
                  {player.name}
                </Button>
              ))}
          </div>
        </div>
      )}

      {/* Round tracker */}
      {!pendingAceOfSpadesSelection && (
        <div className="mt-4 flex-1">
          <RoundTracker />
        </div>
      )}
    </div>
  );
}
