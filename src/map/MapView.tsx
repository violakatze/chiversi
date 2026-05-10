import { useEffect, useRef } from 'react';
import OlMap from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import type { FeatureLike } from 'ol/Feature';

import type { GameState, StoneColor } from '../types';
import { getFlippable } from '../game/engine';
import { getCellStyle, getFlipStyle, HIDDEN_STYLE } from './styles';

const ANIM_DURATION_MS = 400;

type AnimCell = {
  startTime: number;
  fromStone: StoneColor | null;
  toStone: StoneColor;
};

type Props = {
  gameState: GameState;
  onCellClick: (name: string) => void;
  disabled: boolean;
};

/** GeoJSONのプロパティから市区町村名を取得する */
function getMunicipalityName(feature: FeatureLike): string {
  const props = feature.getProperties();
  const city: string = props['N03_004'] ?? '';
  const ward: string = props['N03_005'] ?? '';
  if (ward) return `${city}${ward}`;
  return city;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export const MapView = ({ gameState, onCellClick, disabled }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const vectorSource = useRef<VectorSource | null>(null);
  // スタイル関数から参照するゲーム状態（React state は使わない）
  const gameStateRef = useRef<GameState>(gameState);
  const prevGameStateRef = useRef<GameState>(gameState);
  const hoveredNameRef = useRef<string | null>(null);
  const flipPreviewRef = useRef<Set<string>>(new Set());
  // アニメーション管理
  const animatingCells = useRef<Map<string, AnimCell>>(new Map());
  const rafRef = useRef<number | null>(null);
  // イベントハンドラ用
  const disabledRef = useRef(disabled);
  const onCellClickRef = useRef(onCellClick);
  // 飛び地
  const enclaveFeatures = useRef(new Set<object>());
  const tinyEnclaveFeatures = useRef(new Set<object>());

  useEffect(() => { disabledRef.current = disabled; }, [disabled]);
  useEffect(() => { onCellClickRef.current = onCellClick; }, [onCellClick]);

  // マップ初期化（一度だけ）
  useEffect(() => {
    if (!mapRef.current) return;

    const source = new VectorSource({
      url: `${import.meta.env.BASE_URL}geojson/chiba-simplified.geojson`,
      format: new GeoJSON(),
    });
    vectorSource.current = source;

    // VectorLayer のスタイルを関数として定義。
    // refs を通じて常に最新の状態を参照するため、一度だけ生成すればよい。
    const layer = new VectorLayer({
      source,
      style: (feature: FeatureLike) => {
        if (tinyEnclaveFeatures.current.has(feature)) return HIDDEN_STYLE;

        const name = getMunicipalityName(feature);
        const showLabel = !enclaveFeatures.current.has(feature);
        const anim = animatingCells.current.get(name);

        if (anim) {
          const elapsed = Date.now() - anim.startTime;
          const progress = easeInOut(Math.min(1, elapsed / ANIM_DURATION_MS));
          return getFlipStyle(name, anim.fromStone, anim.toStone, progress, showLabel);
        }

        const gs = gameStateRef.current;
        const cell = gs.cells.get(name);
        return getCellStyle(
          name,
          cell?.stone ?? null,
          gs.legalMoves.has(name),
          gs.lastPlaced === name,
          hoveredNameRef.current === name,
          flipPreviewRef.current.has(name),
          showLabel
        );
      },
    });

    const map = new OlMap({
      target: mapRef.current,
      layers: [layer],
      view: new View({
        center: fromLonLat([140.1, 35.6]),
        zoom: 9,
      }),
      controls: [],
    });

    // 同名フィーチャーのうち最大バウンディングボックス以外を飛び地として登録し、
    // 極小（面積比 0.01% 未満）のものは完全非表示とする
    const computeEnclaves = () => {
      const features = source.getFeatures();
      const byName: Record<string, typeof features> = {};
      for (const f of features) {
        const n = getMunicipalityName(f);
        if (!byName[n]) byName[n] = [];
        byName[n].push(f);
      }
      for (const group of Object.values(byName)) {
        if (group.length <= 1) continue;
        let maxArea = -1;
        let main: (typeof features)[0] | null = null;
        for (const f of group) {
          const ext = f.getGeometry()?.getExtent() ?? [0, 0, 0, 0];
          const area = (ext[2] - ext[0]) * (ext[3] - ext[1]);
          if (area > maxArea) { maxArea = area; main = f; }
        }
        for (const f of group) {
          if (f !== main) {
            enclaveFeatures.current.add(f);
            const ext = f.getGeometry()?.getExtent() ?? [0, 0, 0, 0];
            const enclaveArea = (ext[2] - ext[0]) * (ext[3] - ext[1]);
            if (enclaveArea / maxArea < 0.0001) {
              tinyEnclaveFeatures.current.add(f);
            }
          }
        }
      }
      source.changed();
    };

    source.on('featuresloadend', computeEnclaves);

    map.on('click', (e) => {
      if (disabledRef.current) return;
      const features = map.getFeaturesAtPixel(e.pixel);
      const feature = features.find(f => !tinyEnclaveFeatures.current.has(f));
      if (!feature) return;
      const name = getMunicipalityName(feature);
      if (name) onCellClickRef.current(name);
    });

    map.on('pointermove', (e) => {
      const features = map.getFeaturesAtPixel(e.pixel);
      const feature = features.find(f => !tinyEnclaveFeatures.current.has(f));
      const name = feature ? getMunicipalityName(feature) : null;

      if (name !== hoveredNameRef.current) {
        hoveredNameRef.current = name;
        const gs = gameStateRef.current;
        const preview = new Set<string>();
        if (name && gs.legalMoves.has(name)) {
          getFlippable(name, gs.currentTurn, gs.cells).forEach(n => preview.add(n));
        }
        flipPreviewRef.current = preview;
        source.changed();
      }

      map.getTargetElement().style.cursor = feature ? 'pointer' : '';
    });

    return () => {
      source.un('featuresloadend', computeEnclaves);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      map.setTarget(undefined);
    };
  }, []);

  // RAF ループ: アニメーション中は毎フレーム source.changed() を呼んでスタイルを更新する
  const startRafLoop = () => {
    if (rafRef.current !== null) return;
    const tick = () => {
      const now = Date.now();
      let hasActive = false;
      for (const [name, anim] of animatingCells.current) {
        if (now - anim.startTime >= ANIM_DURATION_MS) {
          animatingCells.current.delete(name);
        } else {
          hasActive = true;
        }
      }
      vectorSource.current?.changed();
      rafRef.current = hasActive ? requestAnimationFrame(tick) : null;
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  // gameState 変化時: ref 更新 + 反転セルのアニメーション開始
  useEffect(() => {
    const prev = prevGameStateRef.current;
    const curr = gameState;
    gameStateRef.current = curr;

    // リスタート（lastPlaced = null）はアニメーションをクリアして即時更新
    if (curr.lastPlaced === null) {
      animatingCells.current.clear();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      vectorSource.current?.changed();
      prevGameStateRef.current = curr;
      return;
    }

    if (curr.lastPlaced !== prev.lastPlaced) {
      // 着手があった: 石が変化したセルをアニメーション対象に登録
      const now = Date.now();
      for (const [name, cell] of curr.cells) {
        const prevCell = prev.cells.get(name);
        if (!prevCell || prevCell.stone === cell.stone || cell.stone === null) continue;
        animatingCells.current.set(name, {
          startTime: now,
          fromStone: prevCell.stone,
          toStone: cell.stone,
        });
      }
      // 手番変化に伴いホバー中マスの反転予測も再計算
      const name = hoveredNameRef.current;
      const preview = new Set<string>();
      if (name && curr.legalMoves.has(name)) {
        getFlippable(name, curr.currentTurn, curr.cells).forEach(n => preview.add(n));
      }
      flipPreviewRef.current = preview;
      startRafLoop();
    } else {
      // パス・ゲーム終了など着手なし → 即時スタイル更新
      vectorSource.current?.changed();
    }

    prevGameStateRef.current = curr;
  }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
