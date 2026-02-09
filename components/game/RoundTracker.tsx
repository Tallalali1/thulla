"use client";

import { useGame } from "@/lib/GameContext";
import { SuitPicker } from "./SuitPicker";
import { CardPicker } from "./CardPicker";
import { PlayedCardsList } from "./PlayedCardsList";
import { Button } from "@/components/shared/Button";
import { SuitIcon } from "@/components/shared/SuitIcon";
import { findRoundWinner } from "@/lib/utils";
import { Card } from "@/lib/types";
import { useMemo } from "react";

export function RoundTracker() {
  const { state, dispatch } = useGame();
  const { currentRound, players, isFirstRound, usedCards = [] } = state;

  // All unavailable cards: permanently used + currently played in this round
  const disabledCards = useMemo(() => {
    const currentPlays = currentRound?.plays.map((p) => p.card) ?? [];
    return [...usedCards, ...currentPlays];
  }, [usedCards, currentRound?.plays]);

  if (!currentRound) return null;

  const currentTurnPlayer = players[currentRound.currentTurnPlayerIndex];
  const leadPlayer = players.find((p) => p.id === currentRound.leadPlayerId);

  // Phase 1: Suit selection (only if suit not yet chosen and not first round where it's forced)
  if (!currentRound.ledSuit) {
    return (
      <div>
        <div className="text-center mb-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-900 dark:text-white">{leadPlayer?.name}</span> leads this round
          </p>
        </div>
        <SuitPicker
          onSelect={(suit) => dispatch({ type: "SET_LED_SUIT", suit })}
          forcedSuit={isFirstRound ? "spades" : null}
        />
      </div>
    );
  }

  // Phase 2: Playing cards
  if (!currentRound.isComplete) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Led suit:</span>
            <SuitIcon suit={currentRound.ledSuit} size="lg" />
          </div>
          {currentRound.plays.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => dispatch({ type: "UNDO_LAST_PLAY" })}
            >
              Undo
            </Button>
          )}
        </div>

        <PlayedCardsList plays={currentRound.plays} players={players} />

        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
          <p className="text-sm mb-3">
            <span className="font-medium">{currentTurnPlayer?.name}</span>
            <span className="text-zinc-500 dark:text-zinc-400">&apos;s turn</span>
          </p>
          <CardPicker
            onSelect={(card: Card) =>
              dispatch({
                type: "PLAY_CARD",
                playerId: currentTurnPlayer.id,
                card,
              })
            }
            preselectedSuit={currentRound.ledSuit}
            disabledCards={disabledCards}
          />
        </div>
      </div>
    );
  }

  // Phase 3: Round complete — show result
  const winnerId = findRoundWinner(currentRound.plays, currentRound.ledSuit);
  const winner = players.find((p) => p.id === winnerId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Led suit:</span>
          <SuitIcon suit={currentRound.ledSuit} size="lg" />
        </div>
      </div>

      <PlayedCardsList plays={currentRound.plays} players={players} />

      <div
        className={`p-4 rounded-xl text-center ${
          currentRound.isThulla
            ? "bg-red-500/10 border border-red-500/30"
            : "bg-green-500/10 border border-green-500/30"
        }`}
      >
        {currentRound.isThulla ? (
          <>
            <p className="text-lg font-bold text-red-500 mb-1">THULLA!</p>
            <p className="text-sm">
              <span className="font-medium">{winner?.name}</span> picks up{" "}
              {currentRound.plays.length} cards
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
              Clean Round
            </p>
            <p className="text-sm">
              Cards removed. <span className="font-medium">{winner?.name}</span> leads next.
            </p>
          </>
        )}
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={() => dispatch({ type: "FINALIZE_ROUND" })}
      >
        Next Round
      </Button>
    </div>
  );
}
