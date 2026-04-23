import { useEffect, useRef, useState } from 'react';
import OlMap from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import type { FeatureLike } from 'ol/Feature';

import type { GameState } from '../types';
import { getFlippable } from '../game/engine';
import { getCellStyle } from './styles';

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

export const MapView = ({ gameState, onCellClick, disabled }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<OlMap | null>(null);
  const vectorSource = useRef<VectorSource | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const disabledRef = useRef(disabled);
  const onCellClickRef = useRef(onCellClick);
  // GeoJSON読み込み時に同名フィーチャーのうち最大面積以外（飛び地）を保持
  const enclaveFeatures = useRef(new Set<object>());

  useEffect(() => { disabledRef.current = disabled; }, [disabled]);
  useEffect(() => { onCellClickRef.current = onCellClick; }, [onCellClick]);

  useEffect(() => {
    if (!mapRef.current) return;

    const source = new VectorSource({
      url: `${import.meta.env.BASE_URL}geojson/chiba-simplified.geojson`,
      format: new GeoJSON(),
    });
    vectorSource.current = source;

    const layer = new VectorLayer({ source });

    const map = new OlMap({
      target: mapRef.current,
      layers: [layer],
      view: new View({
        center: fromLonLat([140.1, 35.6]),
        zoom: 9,
      }),
      controls: [],
    });
    mapInstance.current = map;

    // 同名フィーチャーのうち最大バウンディングボックス以外を飛び地として登録
    const computeEnclaves = () => {
      const features = source.getFeatures();
      const byName = new Map<string, Feature[]>();
      for (const f of features) {
        const name = getMunicipalityName(f);
        if (!byName.has(name)) byName.set(name, []);
        byName.get(name)!.push(f);
      }
      for (const [, group] of byName) {
        if (group.length <= 1) continue;
        let maxArea = -1;
        let main: Feature | null = null;
        for (const f of group) {
          const ext = f.getGeometry()?.getExtent() ?? [0, 0, 0, 0];
          const area = (ext[2] - ext[0]) * (ext[3] - ext[1]);
          if (area > maxArea) { maxArea = area; main = f; }
        }
        for (const f of group) {
          if (f !== main) enclaveFeatures.current.add(f);
        }
      }
    };

    if (source.getState() === 'ready') {
      computeEnclaves();
    } else {
      source.once('change', () => {
        if (source.getState() === 'ready') computeEnclaves();
      });
    }

    map.on('click', (e) => {
      if (disabledRef.current) return;
      const features = map.getFeaturesAtPixel(e.pixel);
      if (features.length === 0) return;
      const name = getMunicipalityName(features[0]);
      if (name) onCellClickRef.current(name);
    });

    map.on('pointermove', (e) => {
      const features = map.getFeaturesAtPixel(e.pixel);
      const name = features.length > 0 ? getMunicipalityName(features[0]) : null;
      setHoveredName(name);
      map.getTargetElement().style.cursor = features.length > 0 ? 'pointer' : '';
    });

    return () => map.setTarget(undefined);
  }, []);

  // スタイルをゲーム状態に応じて更新
  useEffect(() => {
    const source = vectorSource.current;
    if (!source) return;

    const applyStyles = () => {
      const flipPreview = new Set<string>();
      if (hoveredName && gameState.legalMoves.has(hoveredName)) {
        getFlippable(hoveredName, gameState.currentTurn, gameState.cells)
          .forEach((n) => flipPreview.add(n));
      }

      source.getFeatures().forEach((feature) => {
        const name = getMunicipalityName(feature);
        const cell = gameState.cells.get(name);
        const stone = cell?.stone ?? null;
        const isLegal = gameState.legalMoves.has(name);
        const isLast = gameState.lastPlaced === name;
        const isHovered = hoveredName === name;
        const isFlipPreview = flipPreview.has(name);
        const showLabel = !enclaveFeatures.current.has(feature);
        feature.setStyle(getCellStyle(name, stone, isLegal, isLast, isHovered, isFlipPreview, showLabel));
      });
    };

    if (source.getState() === 'ready') {
      applyStyles();
    } else {
      source.once('change', () => {
        if (source.getState() === 'ready') applyStyles();
      });
    }
  }, [gameState, hoveredName]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
