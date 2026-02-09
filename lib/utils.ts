import { Card, Player, PlayedCard, Suit, RANK_VALUES } from "./types";

export function calculateCardDistribution(playerCount: number): number[] {
  const base = Math.floor(52 / playerCount);
  const remainder = 52 % playerCount;
  return Array.from({ length: playerCount }, (_, i) =>
    i < remainder ? base + 1 : base
  );
}

export function compareCards(a: Card, b: Card): number {
  return RANK_VALUES[a.rank] - RANK_VALUES[b.rank];
}

export function findRoundWinner(plays: PlayedCard[], ledSuit: Suit): string {
  const onSuitPlays = plays.filter((p) => p.card.suit === ledSuit);
  onSuitPlays.sort((a, b) => compareCards(b.card, a.card));
  return onSuitPlays[0].playerId;
}

export function getNextActivePlayerIndex(
  players: Player[],
  currentIndex: number
): number {
  let next = (currentIndex + 1) % players.length;
  while (players[next].isSafe) {
    next = (next + 1) % players.length;
    if (next === currentIndex) break;
  }
  return next;
}

export function countActivePlayers(players: Player[]): number {
  return players.filter((p) => !p.isSafe).length;
}

export function getSuitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    spades: "\u2660",
    hearts: "\u2665",
    diamonds: "\u2666",
    clubs: "\u2663",
  };
  return symbols[suit];
}

export function getSuitColor(suit: Suit): string {
  return suit === "hearts" || suit === "diamonds"
    ? "text-red-500"
    : "text-zinc-900 dark:text-zinc-100";
}

export function formatCard(card: Card): string {
  return `${card.rank}${getSuitSymbol(card.suit)}`;
}
