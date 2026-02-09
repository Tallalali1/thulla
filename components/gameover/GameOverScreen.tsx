"use client";

import { useGame } from "@/lib/GameContext";
import { Button } from "@/components/shared/Button";

export function GameOverScreen() {
  const { state, dispatch } = useGame();
  const { players, rounds } = state;

  const loser = players.find((p) => p.isLoser);
  const safePlayers = players
    .filter((p) => p.isSafe && !p.isLoser)
    .sort((a, b) => (a.finishedRound ?? 0) - (b.finishedRound ?? 0));

  const totalThullas = rounds.filter((r) => r.wasThulla).length;

  return (
    <div className="min-h-dvh flex flex-col px-4 py-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Game Over</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          {rounds.length} rounds played &middot; {totalThullas} thullas
        </p>
      </div>

      {/* Loser */}
      {loser && (
        <div className="text-center p-6 rounded-2xl bg-red-500/10 border border-red-500/30 mb-6">
          <p className="text-sm text-red-500 font-medium mb-1">LOSER</p>
          <p className="text-3xl font-bold">{loser.name}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Stuck with {loser.cardCount} cards
          </p>
        </div>
      )}

      {/* Rankings */}
      <div className="mb-8">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Rankings
        </p>
        <div className="space-y-2">
          {safePlayers.map((player, i) => (
            <div
              key={player.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-zinc-400 w-6">#{i + 1}</span>
                <span className="font-medium">{player.name}</span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Safe at round {player.finishedRound}
              </span>
            </div>
          ))}
          {loser && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-red-400 w-6">#{safePlayers.length + 1}</span>
                <span className="font-medium text-red-500">{loser.name}</span>
              </div>
              <span className="text-xs text-red-400">LOSER</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <Button
          size="lg"
          className="w-full"
          onClick={() => dispatch({ type: "NEW_GAME" })}
        >
          Play Again
        </Button>
      </div>
    </div>
  );
}
