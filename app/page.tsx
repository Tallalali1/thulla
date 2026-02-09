"use client";

import { useGame } from "@/lib/GameContext";
import { SetupScreen } from "@/components/setup/SetupScreen";
import { GameScreen } from "@/components/game/GameScreen";
import { GameOverScreen } from "@/components/gameover/GameOverScreen";

export default function Home() {
  const { state } = useGame();

  switch (state.phase) {
    case "setup":
      return <SetupScreen />;
    case "playing":
      return <GameScreen />;
    case "gameOver":
      return <GameOverScreen />;
  }
}
