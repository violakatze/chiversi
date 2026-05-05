import type { GameState, Difficulty } from '../types';
import { municipalityMap } from '../graph/adjacency';
import { getFlippable } from './engine';

/** ランダムCPU: 合法手からランダムに1手選ぶ */
export function chooseMoveRandom(state: GameState): string | null {
  const moves = [...state.legalMoves];
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

/** 貪欲CPU: 最も多く反転できる手を選ぶ（同点はランダム） */
function chooseMoveGreedy(state: GameState): string | null {
  const moves = [...state.legalMoves];
  if (moves.length === 0) return null;
  let best = -1;
  let candidates: string[] = [];
  for (const move of moves) {
    const flips = getFlippable(move, state.currentTurn, state.cells).length;
    if (flips > best) { best = flips; candidates = [move]; }
    else if (flips === best) { candidates.push(move); }
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * 指定マスに置いたときのスコアを計算する。
 * 反転数 + 配置先の安定ボーナス（隣接数が少ないほど「角」に近い）
 */
function scoreMove(move: string, flips: number): number {
  const neighborCount = municipalityMap.get(move)?.neighbors.length ?? 5;
  const stabilityBonus =
    neighborCount <= 1 ? 20 :
    neighborCount <= 2 ? 8 :
    neighborCount <= 3 ? 3 :
    neighborCount >= 7 ? -5 : 0;
  return flips + stabilityBonus;
}

/** 評価関数CPU: 反転数と安定性ボーナスによるスコアで手を選ぶ（同点はランダム） */
function chooseMoveEval(state: GameState): string | null {
  const moves = [...state.legalMoves];
  if (moves.length === 0) return null;
  let bestScore = -Infinity;
  let candidates: string[] = [];
  for (const move of moves) {
    const flips = getFlippable(move, state.currentTurn, state.cells).length;
    const score = scoreMove(move, flips);
    if (score > bestScore) { bestScore = score; candidates = [move]; }
    else if (score === bestScore) { candidates.push(move); }
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/** 難易度に応じてCPUの手を選ぶ */
export function chooseMove(state: GameState, difficulty: Difficulty): string | null {
  if (difficulty === 'easy') return chooseMoveRandom(state);
  if (difficulty === 'normal') return chooseMoveGreedy(state);
  return chooseMoveEval(state);
}
