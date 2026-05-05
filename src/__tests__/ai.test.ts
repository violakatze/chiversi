import { describe, it, expect } from 'vitest';
import { chooseMoveRandom, chooseMove } from '../game/ai';
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

describe('chooseMove', () => {
  it('easy: 合法手を返す', () => {
    const state = buildInitialState(createInitialGameState());
    const move = chooseMove(state, 'easy');
    expect(move).not.toBeNull();
    expect(state.legalMoves.has(move!)).toBe(true);
  });

  it('normal: 合法手を返す', () => {
    const state = buildInitialState(createInitialGameState());
    const move = chooseMove(state, 'normal');
    expect(move).not.toBeNull();
    expect(state.legalMoves.has(move!)).toBe(true);
  });

  it('hard: 合法手を返す', () => {
    const state = buildInitialState(createInitialGameState());
    const move = chooseMove(state, 'hard');
    expect(move).not.toBeNull();
    expect(state.legalMoves.has(move!)).toBe(true);
  });

  it('合法手が空のとき全難易度で null を返す', () => {
    const state = { ...createInitialGameState(), legalMoves: new Set<string>() };
    expect(chooseMove(state, 'easy')).toBeNull();
    expect(chooseMove(state, 'normal')).toBeNull();
    expect(chooseMove(state, 'hard')).toBeNull();
  });
});
