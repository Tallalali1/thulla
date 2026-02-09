"use client";

import { useState } from "react";
import { useGame } from "@/lib/GameContext";
import { Button } from "@/components/shared/Button";
import { PlayerNameInput } from "./PlayerNameInput";

export function SetupScreen() {
  const { dispatch } = useGame();
  const [playerCount, setPlayerCount] = useState(4);
  const [names, setNames] = useState<string[]>(Array(8).fill(""));

  const handleCountChange = (count: number) => {
    setPlayerCount(Math.min(8, Math.max(2, count)));
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleStart = () => {
    const playerNames = Array.from({ length: playerCount }, (_, i) =>
      names[i].trim() || `Player ${i + 1}`
    );
    dispatch({ type: "START_GAME", playerNames });
  };

  return (
    <div className="min-h-dvh flex flex-col px-4 py-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Thulla</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Card game tracker
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-3 text-zinc-700 dark:text-zinc-300">
          Number of Players
        </label>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCountChange(playerCount - 1)}
            disabled={playerCount <= 2}
          >
            -
          </Button>
          <span className="text-2xl font-bold w-12 text-center">{playerCount}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCountChange(playerCount + 1)}
            disabled={playerCount >= 8}
          >
            +
          </Button>
        </div>
      </div>

      <div className="flex-1 mb-6">
        <label className="block text-sm font-medium mb-3 text-zinc-700 dark:text-zinc-300">
          Player Names
        </label>
        <div className="flex flex-col gap-2">
          {Array.from({ length: playerCount }, (_, i) => (
            <PlayerNameInput
              key={i}
              index={i}
              value={names[i]}
              onChange={(v) => handleNameChange(i, v)}
            />
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 mb-4">
        {52 % playerCount === 0
          ? `${52 / playerCount} cards each`
          : `${Math.floor(52 / playerCount)}-${Math.floor(52 / playerCount) + 1} cards each`}
        {" "}&middot; First round is Spades
      </div>

      <Button size="lg" className="w-full" onClick={handleStart}>
        Start Game
      </Button>
    </div>
  );
}
