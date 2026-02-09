import {
  GameState,
  GameAction,
  CurrentRound,
  Round,
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
      const newPlay = {
        playerId: action.playerId,
        card: action.card,
        isOffSuit,
      };

      const newPlays = [...state.currentRound.plays, newPlay];
      const isThulla = state.currentRound.isThulla || isOffSuit;

      // Update player card count
      const newPlayers = state.players.map((p) => {
        if (p.id === action.playerId) {
          const newCount = p.cardCount - 1;
          return {
            ...p,
            cardCount: newCount,
            isSafe: newCount === 0,
            finishedRound: newCount === 0 ? state.roundNumber : p.finishedRound,
          };
        }
        return p;
      });

      // If thulla, round is complete immediately
      // Otherwise, check if all active players have played
      const activePlayers = newPlayers.filter((p) => !p.isSafe || newPlays.some((play) => play.playerId === p.id));
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
        newPlayers = newPlayers.map((p) => {
          if (p.id === winnerId) {
            return {
              ...p,
              cardCount: p.cardCount + cardsToPickUp,
              isSafe: false,
              finishedRound: null,
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

      // Restore player card count
      const newPlayers = state.players.map((p) => {
        if (p.id === lastPlay.playerId) {
          return {
            ...p,
            cardCount: p.cardCount + 1,
            isSafe: false,
            finishedRound: p.finishedRound === state.roundNumber ? null : p.finishedRound,
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
