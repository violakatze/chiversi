import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../game/engine';
import { buildInitialState } from '../game/initialPlacement';

describe('buildInitialState', () => {
  it('石が正確に4つ配置される', () => {
    const state = buildInitialState(createInitialGameState());
    let placed = 0;
    for (const cell of state.cells.values()) {
      if (cell.stone !== null) placed++;
    }
    expect(placed).toBe(4);
  });

  it('黒2つ・白2つが配置される', () => {
    const state = buildInitialState(createInitialGameState());
    expect(state.blackCount).toBe(2);
    expect(state.whiteCount).toBe(2);
  });

  it('黒番で開始する', () => {
    const state = buildInitialState(createInitialGameState());
    expect(state.currentTurn).toBe('black');
  });

  it('黒の合法手が1以上ある', () => {
    const state = buildInitialState(createInitialGameState());
    expect(state.legalMoves.size).toBeGreaterThan(0);
  });

  it('合法手はすべて空マスである', () => {
    const state = buildInitialState(createInitialGameState());
    for (const move of state.legalMoves) {
      expect(state.cells.get(move)?.stone).toBeNull();
    }
  });

  it('複数回呼んでも常に有効な初期状態を返す', () => {
    for (let i = 0; i < 5; i++) {
      const state = buildInitialState(createInitialGameState());
      expect(state.blackCount).toBe(2);
      expect(state.whiteCount).toBe(2);
      expect(state.legalMoves.size).toBeGreaterThan(0);
    }
  });
});
