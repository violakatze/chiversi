import type { GameState, StoneColor } from '../types';
import { adjacencyData } from '../graph/adjacency';
import { calcLegalMoves } from './engine';

/** 4環リストからランダムに1つ選んで初期配置を試みる */
function tryPlaceCycle(
  cycles: string[][],
  state: GameState
): GameState | null {
  const shuffled = [...cycles].sort(() => Math.random() - 0.5);

  for (const cycle of shuffled) {
    const cells = new Map(
      [...state.cells.entries()].map(([k, v]) => [k, { ...v }])
    );

    const colors: StoneColor[] = ['black', 'white', 'black', 'white'];
    for (let i = 0; i < 4; i++) {
      const name = cycle[i];
      if (!cells.has(name)) break;
      cells.set(name, { name, stone: colors[i] });
    }

    const blackLegal = calcLegalMoves('black', cells);
    const whiteLegal = calcLegalMoves('white', cells);
    if (blackLegal.size === 0 || whiteLegal.size === 0) continue;

    let black = 0;
    let white = 0;
    for (const c of cells.values()) {
      if (c.stone === 'black') black++;
      else if (c.stone === 'white') white++;
    }

    return {
      ...state,
      cells,
      currentTurn: 'black',
      legalMoves: blackLegal,
      blackCount: black,
      whiteCount: white,
    };
  }
  return null;
}

/**
 * cycles4Central → cycles4 の順で初期配置を試みる。
 * フォールバック: 隣接する2市区町村に黒・白を1つずつ配置する。
 */
export function buildInitialState(state: GameState): GameState {
  const anyResult = tryPlaceCycle(adjacencyData.cycles4, state);
  if (anyResult) return anyResult;

  // フォールバック: 隣接ペアに配置
  for (const m of adjacencyData.municipalities) {
    if (m.neighbors.length === 0) continue;
    const neighbor = m.neighbors[0];
    const cells = new Map(
      [...state.cells.entries()].map(([k, v]) => [k, { ...v }])
    );
    cells.set(m.name, { name: m.name, stone: 'black' });
    cells.set(neighbor, { name: neighbor, stone: 'white' });

    const blackLegal = calcLegalMoves('black', cells);
    const whiteLegal = calcLegalMoves('white', cells);
    if (blackLegal.size > 0 && whiteLegal.size > 0) {
      return { ...state, cells, currentTurn: 'black', legalMoves: blackLegal, blackCount: 1, whiteCount: 1 };
    }
  }

  return state;
}
