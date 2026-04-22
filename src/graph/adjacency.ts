import type { AdjacencyData, Municipality } from '../types';
import adjacencyJson from '../../data/generated/adjacency.json';

export const adjacencyData = adjacencyJson as AdjacencyData;

/** 名前 → Municipality のマップ */
export const municipalityMap: Map<string, Municipality> = new Map(
  adjacencyData.municipalities.map((m) => [m.name, m])
);

/** 名前 → 隣接名リスト */
export const neighborsOf = (name: string): string[] =>
  municipalityMap.get(name)?.neighbors ?? [];

/** 重心座標を返す */
export const centroidOf = (name: string): [number, number] | undefined =>
  municipalityMap.get(name)?.centroid;
