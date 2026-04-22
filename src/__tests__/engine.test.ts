import { describe, it, expect } from 'vitest';
import { createInitialGameState, getFlippable, calcLegalMoves, applyMove, applyPass } from '../game/engine';
import { buildInitialState } from '../game/initialPlacement';

describe('createInitialGameState', () => {
  it('全セルが石なし・黒番・未終了で初期化される', () => {
    const state = createInitialGameState();
    expect(state.currentTurn).toBe('black');
    expect(state.isGameOver).toBe(false);
    expect(state.winner).toBeNull();
    expect(state.blackCount).toBe(0);
    expect(state.whiteCount).toBe(0);
    expect(state.legalMoves.size).toBe(0);
    for (const cell of state.cells.values()) {
      expect(cell.stone).toBeNull();
    }
  });

  it('千葉県59市区町村が登録されている', () => {
    const state = createInitialGameState();
    expect(state.cells.size).toBe(59);
  });
});

describe('calcLegalMoves', () => {
  it('空の盤面では合法手が0', () => {
    const state = createInitialGameState();
    expect(calcLegalMoves('black', state.cells).size).toBe(0);
    expect(calcLegalMoves('white', state.cells).size).toBe(0);
  });

  it('初期配置後は黒の合法手が1以上', () => {
    const state = buildInitialState(createInitialGameState());
    expect(state.legalMoves.size).toBeGreaterThan(0);
  });
});

describe('getFlippable', () => {
  it('合法手はすべて1つ以上の石を反転する', () => {
    const state = buildInitialState(createInitialGameState());
    for (const move of state.legalMoves) {
      const flippable = getFlippable(move, 'black', state.cells);
      expect(flippable.length).toBeGreaterThan(0);
    }
  });

  it('石が1つだけの盤面では反転なし', () => {
    const state = createInitialGameState();
    const cells = new Map(state.cells);
    const firstName = [...cells.keys()][0];
    cells.set(firstName, { name: firstName, stone: 'black' });
    for (const [name, cell] of cells) {
      if (cell.stone !== null) continue;
      expect(getFlippable(name, 'white', cells).length).toBe(0);
    }
  });
});

describe('applyMove', () => {
  it('着手した市区町村に石が置かれる', () => {
    const initial = buildInitialState(createInitialGameState());
    const move = [...initial.legalMoves][0];
    const next = applyMove(initial, move);
    expect(next.cells.get(move)?.stone).toBe('black');
  });

  it('手番が黒→白に交代する', () => {
    const initial = buildInitialState(createInitialGameState());
    const move = [...initial.legalMoves][0];
    const next = applyMove(initial, move);
    expect(next.currentTurn).toBe('white');
  });

  it('lastPlaced が更新される', () => {
    const initial = buildInitialState(createInitialGameState());
    const move = [...initial.legalMoves][0];
    const next = applyMove(initial, move);
    expect(next.lastPlaced).toBe(move);
  });

  it('着手後に盤面の石が1つ増える', () => {
    const initial = buildInitialState(createInitialGameState());
    const move = [...initial.legalMoves][0];
    const next = applyMove(initial, move);
    expect(next.blackCount + next.whiteCount).toBe(initial.blackCount + initial.whiteCount + 1);
  });

  it('黒白の石数の合計は59以下', () => {
    const initial = buildInitialState(createInitialGameState());
    const move = [...initial.legalMoves][0];
    const next = applyMove(initial, move);
    expect(next.blackCount + next.whiteCount).toBeLessThanOrEqual(59);
  });
});

describe('applyPass', () => {
  it('黒→白に手番交代する', () => {
    const state = buildInitialState(createInitialGameState());
    expect(applyPass(state).currentTurn).toBe('white');
  });

  it('白→黒に手番交代する', () => {
    const state = { ...buildInitialState(createInitialGameState()), currentTurn: 'white' as const };
    expect(applyPass(state).currentTurn).toBe('black');
  });

  it('パスカウントが1増える', () => {
    const state = buildInitialState(createInitialGameState());
    expect(applyPass(state).passCount).toBe(state.passCount + 1);
  });
});
