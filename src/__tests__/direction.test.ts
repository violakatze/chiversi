import { describe, it, expect, vi } from 'vitest';
import { nearestNeighborInDirection, scanDirection } from '../game/direction';

/**
 * テスト用グラフ:
 *   N
 *   |
 * D-A-B-C
 *
 * A=[0,0], B=[1,0](東), C=[2,0](Bの東), D=[-1,0](西), N=[0,1](北)
 */
vi.mock('../graph/adjacency', () => ({
  centroidOf: (name: string): [number, number] | undefined => {
    const map: Record<string, [number, number]> = {
      A: [0, 0],
      B: [1, 0],
      C: [2, 0],
      D: [-1, 0],
      N: [0, 1],
    };
    return map[name];
  },
  neighborsOf: (name: string): string[] => {
    const map: Record<string, string[]> = {
      A: ['B', 'D', 'N'],
      B: ['A', 'C'],
      C: ['B'],
      D: ['A'],
      N: ['A'],
    };
    return map[name] ?? [];
  },
}));

describe('nearestNeighborInDirection', () => {
  it('東方向(0°)で隣接 B を返す', () => {
    expect(nearestNeighborInDirection('A', 0)).toBe('B');
  });

  it('西方向(180°)で隣接 D を返す', () => {
    expect(nearestNeighborInDirection('A', 180)).toBe('D');
  });

  it('北方向(90°)で隣接 N を返す', () => {
    expect(nearestNeighborInDirection('A', 90)).toBe('N');
  });

  it('南方向(-90°)に隣接がなければ null を返す', () => {
    expect(nearestNeighborInDirection('A', -90)).toBeNull();
  });

  it('B から東方向で C を返す', () => {
    expect(nearestNeighborInDirection('B', 0)).toBe('C');
  });

  it('C から東方向に隣接がなければ null を返す', () => {
    expect(nearestNeighborInDirection('C', 0)).toBeNull();
  });
});

describe('scanDirection', () => {
  it('B=白・C=黒 のとき東方向で B が反転対象', () => {
    const stones: Record<string, string | null> = { B: 'white', C: 'black' };
    const result = scanDirection('A', 0, 'black', (n) => stones[n] ?? null);
    expect(result).toEqual(['B']);
  });

  it('B=白・C=null のとき自色で閉じないため空', () => {
    const stones: Record<string, string | null> = { B: 'white', C: null };
    const result = scanDirection('A', 0, 'black', (n) => stones[n] ?? null);
    expect(result).toEqual([]);
  });

  it('B=null のとき空マスで即終了、空を返す', () => {
    const stones: Record<string, string | null> = { B: null };
    const result = scanDirection('A', 0, 'black', (n) => stones[n] ?? null);
    expect(result).toEqual([]);
  });

  it('B=黒（同色）のとき挟めず空を返す', () => {
    const stones: Record<string, string | null> = { B: 'black' };
    const result = scanDirection('A', 0, 'black', (n) => stones[n] ?? null);
    expect(result).toEqual([]);
  });

  it('B=白・C=白・(Cの東に隣接なし) のとき自色で閉じないため空', () => {
    const stones: Record<string, string | null> = { B: 'white', C: 'white' };
    const result = scanDirection('A', 0, 'black', (n) => stones[n] ?? null);
    expect(result).toEqual([]);
  });

  it('南方向に隣接なければ空を返す', () => {
    const result = scanDirection('A', -90, 'black', () => null);
    expect(result).toEqual([]);
  });
});
