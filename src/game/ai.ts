import type { GameState } from '../types';

/** ランダムCPU: 合法手からランダムに1手選ぶ */
export function chooseMoveRandom(state: GameState): string | null {
  const moves = [...state.legalMoves];
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}
