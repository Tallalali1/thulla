export type Suit = "spades" | "hearts" | "diamonds" | "clubs";

export type Rank =
  | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
  | "J" | "Q" | "K" | "A";

export const RANK_VALUES: Record<Rank, number> = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
  "8": 8, "9": 9, "10": 10, "J": 11, "Q": 12, "K": 13, "A": 14,
};

export const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
export const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string;
  name: string;
  cardCount: number;
  isSafe: boolean;
  isLoser: boolean;
  finishedRound: number | null;
}

export interface PlayedCard {
  playerId: string;
  card: Card;
  isOffSuit: boolean;
}

export interface Round {
  roundNumber: number;
  leadPlayerId: string;
  ledSuit: Suit;
  plays: PlayedCard[];
  wasThulla: boolean;
  winnerId: string;
  cardsPickedUp: number;
}

export type GamePhase = "setup" | "playing" | "gameOver";

export interface CurrentRound {
  ledSuit: Suit | null;
  plays: PlayedCard[];
  leadPlayerId: string;
  currentTurnPlayerIndex: number;
  isThulla: boolean;
  isComplete: boolean;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  rounds: Round[];
  currentRound: CurrentRound | null;
  currentLeadPlayerIndex: number;
  roundNumber: number;
  isFirstRound: boolean;
  pendingAceOfSpadesSelection: boolean;
}

export type GameAction =
  | { type: "START_GAME"; playerNames: string[] }
  | { type: "SET_LED_SUIT"; suit: Suit }
  | { type: "PLAY_CARD"; playerId: string; card: Card }
  | { type: "FINALIZE_ROUND" }
  | { type: "UNDO_LAST_PLAY" }
  | { type: "SELECT_ACE_OF_SPADES_HOLDER"; playerId: string }
  | { type: "NEW_GAME" };
