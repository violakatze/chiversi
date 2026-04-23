import { Style, Fill, Stroke } from 'ol/style';
import Text from 'ol/style/Text';
import type { StoneColor } from '../types';

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

export function getCellStyle(
  name: string,
  stone: StoneColor | null,
  isLegal: boolean,
  isLast: boolean,
  isHovered: boolean,
  isFlipPreview: boolean,
  showLabel: boolean
): Style {
  if (isLast) {
    const c = stone === 'black' ? COLOR.lastBlack : COLOR.lastWhite;
    return makeStyle(c.fill, c.stroke, c.width, name, showLabel);
  }
  if (isHovered) {
    const c = isLegal ? COLOR.hoverLegal : COLOR.hoverEmpty;
    return makeStyle(c.fill, c.stroke, c.width, name, showLabel);
  }
  if (isFlipPreview) {
    return makeStyle(COLOR.flipPreview.fill, COLOR.flipPreview.stroke, COLOR.flipPreview.width, name, showLabel);
  }
  if (stone === 'black') return makeStyle(COLOR.black.fill, COLOR.black.stroke, COLOR.black.width, name, showLabel);
  if (stone === 'white') return makeStyle(COLOR.white.fill, COLOR.white.stroke, COLOR.white.width, name, showLabel);
  if (isLegal) return makeStyle(COLOR.legal.fill, COLOR.legal.stroke, COLOR.legal.width, name, showLabel);
  return makeStyle(COLOR.empty.fill, COLOR.empty.stroke, COLOR.empty.width, name, showLabel);
}
