/** 石の色 */
export type StoneColor = 'black' | 'white';

/** プレイヤー種別 */
export type PlayerType = 'human' | 'cpu';

/** 市区町村の隣接詳細 */
export type NeighborDetail = {
  name: string;
  borderLengthKm: number;
  type: 'land' | 'sea';
};

/** adjacency.json の市区町村エントリ */
export type Municipality = {
  code: string;
  name: string;
  centroid: [number, number];
  neighbors: string[];
  neighborDetails: NeighborDetail[];
};

/** adjacency.json のトップレベル構造 */
export type AdjacencyData = {
  municipalities: Municipality[];
  cycles4: string[][];
  cycles4Central: string[][];
  metadata: {
    prefecture: string;
    municipalityCount: number;
    adjacencyCount: number;
    cycle4Count: number;
    cycle4CentralCount: number;
  };
};

/** ゲーム内での各マスの状態 */
export type CellState = {
  name: string;
  stone: StoneColor | null;
};

/** ゲームの状態 */
export type GameState = {
  cells: Map<string, CellState>;
  currentTurn: StoneColor;
  legalMoves: Set<string>;
  lastPlaced: string | null;
  passCount: number;
  isGameOver: boolean;
  winner: StoneColor | 'draw' | null;
  blackCount: number;
  whiteCount: number;
};

/** 方向定義 */
export type Direction = {
  name: string;
  center: number;
};
