import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import type { FeatureLike } from 'ol/Feature';

import type { GameState } from '../types';
import { getCellStyle } from './styles';

type Props = {
  gameState: GameState;
  onCellClick: (name: string) => void;
  disabled: boolean;
};

/** GeoJSONのプロパティから市区町村名を取得する */
function getMunicipalityName(feature: FeatureLike): string {
  const props = feature.getProperties();
  // 国土数値情報: N03_004 が市区町村名、N03_003 が郡名（合わせると正確）
  const city: string = props['N03_004'] ?? '';
  const ward: string = props['N03_005'] ?? '';
  // 政令市の区は N03_004 が市名、N03_005 が区名
  if (ward) return `${city}${ward}`;
  return city;
}

export const MapView = ({ gameState, onCellClick, disabled }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const vectorSource = useRef<VectorSource | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const disabledRef = useRef(disabled);
  const onCellClickRef = useRef(onCellClick);

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

    const map = new Map({
      target: mapRef.current,
      layers: [layer],
      view: new View({
        center: fromLonLat([140.1, 35.6]),
        zoom: 8,
      }),
      controls: [],
    });
    mapInstance.current = map;

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
      source.getFeatures().forEach((feature) => {
        const name = getMunicipalityName(feature);
        const cell = gameState.cells.get(name);
        const stone = cell?.stone ?? null;
        const isLegal = gameState.legalMoves.has(name);
        const isLast = gameState.lastPlaced === name;
        const isHovered = hoveredName === name;
        feature.setStyle(getCellStyle(stone, isLegal, isLast, isHovered));
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
