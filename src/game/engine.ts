import type { GameState, StoneColor } from '../types';
import { adjacencyData, municipalityMap } from '../graph/adjacency';
import { DIRECTIONS, scanDirection } from './direction';

/** ゲーム初期状態を生成する（石なし・黒番） */
export function createInitialGameState(): GameState {
  const cells = new Map(
    adjacencyData.municipalities.map((m) => [
      m.name,
      { name: m.name, stone: null },
    ])
  );
  return {
    cells,
    currentTurn: 'black',
    legalMoves: new Set(),
    lastPlaced: null,
    passCount: 0,
    isGameOver: false,
    winner: null,
    blackCount: 0,
    whiteCount: 0,
  };
}

/** 指定したマスに石を置いたとき反転する市区町村名リストを返す */
export function getFlippable(
  name: string,
  color: StoneColor,
  cells: Map<string, { stone: StoneColor | null }>
): string[] {
  const getStone = (n: string) => cells.get(n)?.stone ?? null;
  const flippable: string[] = [];

  for (const dir of DIRECTIONS) {
    const line = scanDirection(name, dir.center, color, getStone);
    flippable.push(...line);
  }
  return flippable;
}

/** colorにとっての合法手セットを返す */
export function calcLegalMoves(
  color: StoneColor,
  cells: Map<string, { stone: StoneColor | null }>
): Set<string> {
  const legal = new Set<string>();
  for (const [name, cell] of cells) {
    if (cell.stone !== null) continue;
    if (getFlippable(name, color, cells).length > 0) {
      legal.add(name);
    }
  }
  return legal;
}

/** スコアを集計する */
function countStones(cells: Map<string, { stone: StoneColor | null }>) {
  let black = 0;
  let white = 0;
  for (const cell of cells.values()) {
    if (cell.stone === 'black') black++;
    else if (cell.stone === 'white') white++;
  }
  return { black, white };
}

/**
 * マスに石を置き、反転処理・手番更新を行った新しい GameState を返す。
 * 着手不可マスへの呼び出しは呼び出し元で防ぐこと。
 */
export function applyMove(state: GameState, name: string): GameState {
  const cells = new Map(
    [...state.cells.entries()].map(([k, v]) => [k, { ...v }])
  );

  const flippable = getFlippable(name, state.currentTurn, cells);
  cells.set(name, { name, stone: state.currentTurn });
  for (const f of flippable) {
    cells.set(f, { name: f, stone: state.currentTurn });
  }

  const nextTurn: StoneColor = state.currentTurn === 'black' ? 'white' : 'black';
  const nextLegal = calcLegalMoves(nextTurn, cells);

  const { black, white } = countStones(cells);
  const totalPlaced = black + white;
  const totalCells = municipalityMap.size;

  if (totalPlaced === totalCells) {
    const winner = black > white ? 'black' : white > black ? 'white' : 'draw';
    return { ...state, cells, lastPlaced: name, legalMoves: new Set(), passCount: 0, isGameOver: true, winner, blackCount: black, whiteCount: white };
  }

  if (nextLegal.size === 0) {
    const oppositeColor = nextTurn === 'black' ? 'white' : 'black';
    const oppositeLegal = calcLegalMoves(oppositeColor, cells);
    if (oppositeLegal.size === 0) {
      const winner = black > white ? 'black' : white > black ? 'white' : 'draw';
      return { ...state, cells, lastPlaced: name, legalMoves: new Set(), passCount: state.passCount + 1, isGameOver: true, winner, blackCount: black, whiteCount: white };
    }
    return { ...state, cells, currentTurn: nextTurn, legalMoves: nextLegal, lastPlaced: name, passCount: state.passCount + 1, isGameOver: false, winner: null, blackCount: black, whiteCount: white };
  }

  return { ...state, cells, currentTurn: nextTurn, legalMoves: nextLegal, lastPlaced: name, passCount: 0, isGameOver: false, winner: null, blackCount: black, whiteCount: white };
}

/** パス処理: 合法手がないとき手番を交代する */
export function applyPass(state: GameState): GameState {
  const nextTurn: StoneColor = state.currentTurn === 'black' ? 'white' : 'black';
  const nextLegal = calcLegalMoves(nextTurn, state.cells);
  const { black, white } = countStones(state.cells);

  if (nextLegal.size === 0) {
    const winner = black > white ? 'black' : white > black ? 'white' : 'draw';
    return { ...state, currentTurn: nextTurn, legalMoves: new Set(), passCount: state.passCount + 1, isGameOver: true, winner, blackCount: black, whiteCount: white };
  }

  return { ...state, currentTurn: nextTurn, legalMoves: nextLegal, passCount: state.passCount + 1, blackCount: black, whiteCount: white };
}
