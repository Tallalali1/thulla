"use client";

import { createContext, useContext, useReducer, useEffect, type Dispatch, type ReactNode } from "react";
import { GameState, GameAction } from "./types";
import { gameReducer, initialState } from "./gameReducer";

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

const STORAGE_KEY = "thulla-game-state";

function loadState(): GameState {
  if (typeof window === "undefined") return initialState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with initialState to handle new fields added after save
      return { ...initialState, ...parsed };
    }
  } catch {}
  return initialState;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, () => loadState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
