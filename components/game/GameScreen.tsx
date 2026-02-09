"use client";

import { useGame } from "@/lib/GameContext";
import { PlayerList } from "./PlayerList";
import { RoundTracker } from "./RoundTracker";
import { Button } from "@/components/shared/Button";

export function GameScreen() {
  const { state, dispatch } = useGame();
  const { currentRound, players, roundNumber, pendingAceOfSpadesSelection } = state;

  const currentTurnPlayerId = currentRound
    ? players[currentRound.currentTurnPlayerIndex]?.id ?? null
    : null;
  const leadPlayerId = currentRound?.leadPlayerId ?? null;

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

      {/* Player status bar */}
      <PlayerList
        players={players}
        currentTurnPlayerId={currentTurnPlayerId}
        leadPlayerId={leadPlayerId}
      />

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
