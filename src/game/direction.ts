import type { Direction } from '../types';
import { centroidOf, neighborsOf } from '../graph/adjacency';

export const DIRECTIONS: Direction[] = [
  { name: 'E',  center: 0 },
  { name: 'NE', center: 45 },
  { name: 'N',  center: 90 },
  { name: 'NW', center: 135 },
  { name: 'W',  center: 180 },
  { name: 'SW', center: -135 },
  { name: 'S',  center: -90 },
  { name: 'SE', center: -45 },
];

const HALF_SECTOR = 22.5;

/** 2点間の角度を返す（度数法、東=0°、反時計回り） */
function angleBetween(a: [number, number], b: [number, number]): number {
  return Math.atan2(b[1] - a[1], b[0] - a[0]) * (180 / Math.PI);
}

/** 角度差を -180〜180 に正規化 */
function normalizeAngleDiff(diff: number): number {
  let d = diff % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/**
 * 基点 from の隣接のうち、指定方向（center ± HALF_SECTOR）にある最近傍を返す
 */
export function nearestNeighborInDirection(
  from: string,
  dirCenter: number
): string | null {
  const fromCentroid = centroidOf(from);
  if (!fromCentroid) return null;

  const neighbors = neighborsOf(from);
  let best: string | null = null;
  let bestDiff = Infinity;

  for (const n of neighbors) {
    const nc = centroidOf(n);
    if (!nc) continue;
    const angle = angleBetween(fromCentroid, nc);
    const diff = Math.abs(normalizeAngleDiff(angle - dirCenter));
    if (diff <= HALF_SECTOR && diff < bestDiff) {
      bestDiff = diff;
      best = n;
    }
  }
  return best;
}

/**
 * from を起点に指定方向へ隣接グラフを辿り、相手色が連続した後に自分色が見つかれば
 * 反転対象の市区町村名リストを返す。なければ空配列。
 */
export function scanDirection(
  from: string,
  dirCenter: number,
  myColor: string,
  getStone: (name: string) => string | null
): string[] {
  const flippable: string[] = [];
  let current = from;

  while (true) {
    const next = nearestNeighborInDirection(current, dirCenter);
    if (!next) break;

    const stone = getStone(next);
    if (stone === null) break;
    if (stone !== myColor) {
      flippable.push(next);
      current = next;
    } else {
      return flippable;
    }
  }
  return [];
}
