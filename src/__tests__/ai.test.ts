import { describe, it, expect } from 'vitest';
import { chooseMoveRandom } from '../game/ai';
import { createInitialGameState } from '../game/engine';
import { buildInitialState } from '../game/initialPlacement';

describe('chooseMoveRandom', () => {
  it('合法手の中から1つを返す', () => {
    const state = buildInitialState(createInitialGameState());
    const move = chooseMoveRandom(state);
    expect(move).not.toBeNull();
    expect(state.legalMoves.has(move!)).toBe(true);
  });

  it('合法手が空のとき null を返す', () => {
    const state = { ...createInitialGameState(), legalMoves: new Set<string>() };
    expect(chooseMoveRandom(state)).toBeNull();
  });

  it('複数回呼んでも常に合法手を返す', () => {
    const state = buildInitialState(createInitialGameState());
    for (let i = 0; i < 10; i++) {
      const move = chooseMoveRandom(state);
      expect(move).not.toBeNull();
      expect(state.legalMoves.has(move!)).toBe(true);
    }
  });
});
