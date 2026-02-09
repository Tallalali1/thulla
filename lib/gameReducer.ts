import {
  GameState,
  GameAction,
  CurrentRound,
  Round,
  Card,
  Suit,
} from "./types";
import {
  calculateCardDistribution,
  findRoundWinner,
  getNextActivePlayerIndex,
  countActivePlayers,
} from "./utils";

export const initialState: GameState = {
  phase: "setup",
  players: [],
  rounds: [],
  currentRound: null,
  currentLeadPlayerIndex: 0,
  roundNumber: 0,
  isFirstRound: true,
  pendingAceOfSpadesSelection: false,
  usedCards: [],
  myPlayerId: null,
  pendingHandInput: false,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      const distribution = calculateCardDistribution(action.playerNames.length);
      const players = action.playerNames.map((name, i) => ({
        id: crypto.randomUUID(),
        name,
        cardCount: distribution[i],
        isSafe: false,
        isLoser: false,
        finishedRound: null,
        hand: [] as Card[],
        missingSuits: [] as Suit[],
      }));

      const currentRound: CurrentRound = {
        ledSuit: "spades",
        plays: [],
        leadPlayerId: players[0].id,
        currentTurnPlayerIndex: 0,
        isThulla: false,
        isComplete: false,
      };

      return {
        ...state,
        phase: "playing",
        players,
        rounds: [],
        currentRound,
        currentLeadPlayerIndex: 0,
        roundNumber: 1,
        isFirstRound: true,
        pendingAceOfSpadesSelection: false,
        usedCards: [],
        myPlayerId: null,
        pendingHandInput: true,
      };
    }

    case "SET_MY_PLAYER": {
      return {
        ...state,
        myPlayerId: action.playerId,
      };
    }

    case "SET_MY_HAND": {
      if (!state.myPlayerId) return state;
      const actualCount = action.cards.length;
      const myPlayer = state.players.find((p) => p.id === state.myPlayerId);
      const prevCount = myPlayer?.cardCount ?? actualCount;
      // Adjust card count difference across other players if needed
      const diff = actualCount - prevCount;
      const otherPlayers = state.players.filter((p) => p.id !== state.myPlayerId);
      // Distribute the opposite diff across other players (some had wrong extra/fewer cards)
      let remaining = -diff;
      const newPlayers = state.players.map((p) => {
        if (p.id === state.myPlayerId) {
          return { ...p, hand: action.cards, cardCount: actualCount };
        }
        if (remaining !== 0) {
          const adjust = remaining > 0 ? 1 : -1;
          remaining -= adjust;
          return { ...p, cardCount: p.cardCount + adjust };
        }
        return p;
      });
      return {
        ...state,
        players: newPlayers,
        pendingHandInput: false,
      };
    }

    case "SET_LED_SUIT": {
      if (!state.currentRound) return state;
      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          ledSuit: action.suit,
        },
      };
    }

    case "PLAY_CARD": {
      if (!state.currentRound || state.currentRound.isComplete) return state;
      if (!state.currentRound.ledSuit) return state;

      const isOffSuit = action.card.suit !== state.currentRound.ledSuit;
      // First round: no thulla possible, off-suit cards just get discarded
      const triggersThulla = isOffSuit && !state.isFirstRound;
      const newPlay = {
        playerId: action.playerId,
        card: action.card,
        isOffSuit: triggersThulla,
      };

      const newPlays = [...state.currentRound.plays, newPlay];
      const isThulla = state.currentRound.isThulla || triggersThulla;

      // Update player card count, hand, and missing suits
      const ledSuitForMissing = state.currentRound.ledSuit;
      const newPlayers = state.players.map((p) => {
        if (p.id === action.playerId) {
          const newCount = p.cardCount - 1;
          // Remove card from hand if tracked
          const newHand = p.hand.filter(
            (c) => !(c.suit === action.card.suit && c.rank === action.card.rank)
          );
          // Track missing suit: if off-suit and not first round, player doesn't have the led suit
          const newMissingSuits =
            triggersThulla && !p.missingSuits.includes(ledSuitForMissing)
              ? [...p.missingSuits, ledSuitForMissing]
              : p.missingSuits;
          return {
            ...p,
            cardCount: newCount,
            isSafe: newCount === 0,
            finishedRound: newCount === 0 ? state.roundNumber : p.finishedRound,
            hand: newHand,
            missingSuits: newMissingSuits,
          };
        }
        return p;
      });

      // If thulla, round is complete immediately
      // Otherwise, check if all active players have played
      const activePlayerCount = state.players.filter((p) => !p.isSafe).length;
      const isComplete = isThulla || newPlays.length >= activePlayerCount;

      // Advance turn to next active player
      let nextTurnIndex = state.currentRound.currentTurnPlayerIndex;
      if (!isComplete) {
        nextTurnIndex = getNextActivePlayerIndex(newPlayers, state.currentRound.currentTurnPlayerIndex);
      }

      return {
        ...state,
        players: newPlayers,
        currentRound: {
          ...state.currentRound,
          plays: newPlays,
          isThulla,
          isComplete,
          currentTurnPlayerIndex: nextTurnIndex,
        },
      };
    }

    case "FINALIZE_ROUND": {
      if (!state.currentRound || !state.currentRound.ledSuit) return state;

      const ledSuit = state.currentRound.ledSuit;
      const plays = state.currentRound.plays;
      const winnerId = findRoundWinner(plays, ledSuit);
      const wasThulla = state.currentRound.isThulla;

      let newPlayers = [...state.players];

      if (wasThulla) {
        // Winner picks up all cards played in this round
        const cardsToPickUp = plays.length;
        const pickedUpCards = plays.map((p) => p.card);
        newPlayers = newPlayers.map((p) => {
          if (p.id === winnerId) {
            return {
              ...p,
              cardCount: p.cardCount + cardsToPickUp,
              isSafe: false,
              finishedRound: null,
              hand: [...p.hand, ...pickedUpCards],
            };
          }
          return p;
        });
      }

      const completedRound: Round = {
        roundNumber: state.roundNumber,
        leadPlayerId: state.currentRound.leadPlayerId,
        ledSuit,
        plays,
        wasThulla,
        winnerId,
        cardsPickedUp: wasThulla ? plays.length : 0,
      };

      const newRounds = [...state.rounds, completedRound];
      const newRoundNumber = state.roundNumber + 1;

      // Track used cards: only cards from clean rounds are permanently out
      // Thulla'd cards go back to a player's hand
      let newUsedCards = [...state.usedCards];
      if (!wasThulla) {
        newUsedCards = [...newUsedCards, ...plays.map((p) => p.card)];
      }

      // Check for game over
      const activePlayers = newPlayers.filter((p) => !p.isSafe);
      if (activePlayers.length <= 1) {
        if (activePlayers.length === 1) {
          newPlayers = newPlayers.map((p) =>
            p.id === activePlayers[0].id ? { ...p, isLoser: true } : p
          );
        }
        return {
          ...state,
          phase: "gameOver",
          players: newPlayers,
          rounds: newRounds,
          currentRound: null,
          roundNumber: newRoundNumber,
          usedCards: newUsedCards,
        };
      }

      // After round 1, need to select Ace of Spades holder
      if (state.isFirstRound) {
        return {
          ...state,
          players: newPlayers,
          rounds: newRounds,
          currentRound: null,
          roundNumber: newRoundNumber,
          isFirstRound: false,
          pendingAceOfSpadesSelection: true,
          usedCards: newUsedCards,
        };
      }

      // Set up next round — winner leads
      const winnerIndex = newPlayers.findIndex((p) => p.id === winnerId);
      const nextRound: CurrentRound = {
        ledSuit: null,
        plays: [],
        leadPlayerId: winnerId,
        currentTurnPlayerIndex: winnerIndex,
        isThulla: false,
        isComplete: false,
      };

      return {
        ...state,
        players: newPlayers,
        rounds: newRounds,
        currentRound: nextRound,
        currentLeadPlayerIndex: winnerIndex,
        roundNumber: newRoundNumber,
        usedCards: newUsedCards,
      };
    }

    case "SELECT_ACE_OF_SPADES_HOLDER": {
      const holderIndex = state.players.findIndex((p) => p.id === action.playerId);
      if (holderIndex === -1) return state;

      const nextRound: CurrentRound = {
        ledSuit: null,
        plays: [],
        leadPlayerId: action.playerId,
        currentTurnPlayerIndex: holderIndex,
        isThulla: false,
        isComplete: false,
      };

      return {
        ...state,
        currentRound: nextRound,
        currentLeadPlayerIndex: holderIndex,
        pendingAceOfSpadesSelection: false,
      };
    }

    case "UNDO_LAST_PLAY": {
      if (!state.currentRound || state.currentRound.plays.length === 0) return state;

      const lastPlay = state.currentRound.plays[state.currentRound.plays.length - 1];
      const newPlays = state.currentRound.plays.slice(0, -1);

      // Restore player card count and hand
      const undoLedSuit = state.currentRound.ledSuit;
      const newPlayers = state.players.map((p) => {
        if (p.id === lastPlay.playerId) {
          // Restore card to hand if this player had tracked cards
          const restoredHand = (p.hand.length > 0 || p.id === state.myPlayerId)
            ? [...p.hand, lastPlay.card]
            : p.hand;
          // Remove missing suit if the undone play was the one that caused it
          const restoredMissingSuits =
            lastPlay.isOffSuit && undoLedSuit
              ? p.missingSuits.filter((s) => s !== undoLedSuit)
              : p.missingSuits;
          return {
            ...p,
            cardCount: p.cardCount + 1,
            isSafe: false,
            finishedRound: p.finishedRound === state.roundNumber ? null : p.finishedRound,
            hand: restoredHand,
            missingSuits: restoredMissingSuits,
          };
        }
        return p;
      });

      // Recheck thulla status
      const isThulla = newPlays.some((p) => p.isOffSuit);

      // Find the previous player's index
      const prevPlayerIndex = state.players.findIndex((p) => p.id === lastPlay.playerId);

      return {
        ...state,
        players: newPlayers,
        currentRound: {
          ...state.currentRound,
          plays: newPlays,
          isThulla,
          isComplete: false,
          currentTurnPlayerIndex: prevPlayerIndex,
        },
      };
    }

    case "NEW_GAME": {
      return initialState;
    }

    default:
      return state;
  }
}
