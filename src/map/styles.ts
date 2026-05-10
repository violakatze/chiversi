import { Style, Fill, Stroke } from 'ol/style';
import Text from 'ol/style/Text';
import type { StoneColor } from '../types';

/** 完全非表示用スタイル（小さすぎる飛び地に使用） */
export const HIDDEN_STYLE = new Style();

type RGBA = [number, number, number, number];

function lerpRGBA(a: RGBA, b: RGBA, t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  const alpha = +(a[3] + (b[3] - a[3]) * t).toFixed(3);
  return `rgba(${r},${g},${bl},${alpha})`;
}

const ANIM_FILL: Record<'black' | 'white' | 'empty', RGBA> = {
  black: [40, 40, 40, 0.9],
  white: [255, 255, 255, 0.9],
  empty: [255, 152, 0, 0.4],
};
const ANIM_STROKE: Record<'black' | 'white' | 'empty', RGBA> = {
  black: [0, 0, 0, 1],
  white: [180, 180, 180, 0.8],
  empty: [230, 81, 0, 0.9],
};
const FLASH_FILL: RGBA = [255, 235, 59, 0.9];
const FLASH_STROKE: RGBA = [249, 168, 37, 1];

const COLOR = {
  empty:       { fill: 'rgba(67,160,71,0.3)',   stroke: 'rgba(56,142,60,0.55)', width: 1 },
  black:       { fill: 'rgba(40,40,40,0.9)',    stroke: '#000000',              width: 1.5 },
  white:       { fill: 'rgba(255,255,255,0.9)', stroke: 'rgba(180,180,180,0.8)', width: 1.5 },
  legal:       { fill: 'rgba(255,152,0,0.4)',   stroke: 'rgba(230,81,0,0.9)',   width: 1.5 },
  flipPreview: { fill: 'rgba(255,235,59,0.55)', stroke: 'rgba(249,168,37,1)',   width: 2 },
  lastBlack:   { fill: 'rgba(40,40,40,0.9)',    stroke: '#FFA726',              width: 3 },
  lastWhite:   { fill: 'rgba(255,255,255,0.9)', stroke: '#FFA726',              width: 3 },
  hoverEmpty:  { fill: 'rgba(67,160,71,0.55)',  stroke: 'rgba(27,94,32,1)',     width: 2 },
  hoverLegal:  { fill: 'rgba(255,152,0,0.65)',  stroke: 'rgba(230,81,0,1)',     width: 2 },
};

function makeText(name: string): Text {
  return new Text({
    text: name,
    font: 'bold 10px sans-serif',
    fill: new Fill({ color: '#1a1a1a' }),
    stroke: new Stroke({ color: 'rgba(255,255,255,0.85)', width: 3 }),
    overflow: true,
  });
}

function makeStyle(fill: string, stroke: string, width: number, name: string, showLabel: boolean): Style {
  return new Style({
    fill: new Fill({ color: fill }),
    stroke: new Stroke({ color: stroke, width }),
    text: showLabel ? makeText(name) : undefined,
  });
}

/**
 * 反転アニメーション用スタイル。
 * progress 0→0.5: fromStone色 → 黄フラッシュ
 * progress 0.5→1: 黄フラッシュ → toStone色
 */
export function getFlipStyle(
  name: string,
  fromStone: StoneColor | null,
  toStone: StoneColor,
  progress: number,
  showLabel: boolean
): Style {
  const fromKey = fromStone ?? 'empty';
  const fromFill = ANIM_FILL[fromKey];
  const fromStroke = ANIM_STROKE[fromKey];
  const toFill = ANIM_FILL[toStone];
  const toStroke = ANIM_STROKE[toStone];

  let fillColor: string;
  let strokeColor: string;
  if (progress < 0.5) {
    const t = progress / 0.5;
    fillColor = lerpRGBA(fromFill, FLASH_FILL, t);
    strokeColor = lerpRGBA(fromStroke, FLASH_STROKE, t);
  } else {
    const t = (progress - 0.5) / 0.5;
    fillColor = lerpRGBA(FLASH_FILL, toFill, t);
    strokeColor = lerpRGBA(FLASH_STROKE, toStroke, t);
  }
  return makeStyle(fillColor, strokeColor, 2.5, name, showLabel);
}

export function getCellStyle(
  name: string,
  stone: StoneColor | null,
  isLegal: boolean,
  isLast: boolean,
  isHovered: boolean,
  isFlipPreview: boolean,
  showLabel: boolean
): Style {
  if (isHovered) {
    const c = isLegal ? COLOR.hoverLegal : COLOR.hoverEmpty;
    return makeStyle(c.fill, c.stroke, c.width, name, showLabel);
  }
  if (isFlipPreview) {
    return makeStyle(COLOR.flipPreview.fill, COLOR.flipPreview.stroke, COLOR.flipPreview.width, name, showLabel);
  }
  if (isLast) {
    const c = stone === 'black' ? COLOR.lastBlack : COLOR.lastWhite;
    return makeStyle(c.fill, c.stroke, c.width, name, showLabel);
  }
  if (stone === 'black') return makeStyle(COLOR.black.fill, COLOR.black.stroke, COLOR.black.width, name, showLabel);
  if (stone === 'white') return makeStyle(COLOR.white.fill, COLOR.white.stroke, COLOR.white.width, name, showLabel);
  if (isLegal) return makeStyle(COLOR.legal.fill, COLOR.legal.stroke, COLOR.legal.width, name, showLabel);
  return makeStyle(COLOR.empty.fill, COLOR.empty.stroke, COLOR.empty.width, name, showLabel);
}
