import { Style, Fill, Stroke } from 'ol/style';
import type { StoneColor } from '../types';

const COLOR = {
  empty:         { fill: 'rgba(200,200,200,0.5)', stroke: 'rgba(150,150,150,0.8)', width: 1 },
  black:         { fill: 'rgba(40,40,40,0.9)',    stroke: '#000000',              width: 1.5 },
  white:         { fill: 'rgba(255,255,255,0.9)', stroke: 'rgba(180,180,180,0.8)', width: 1.5 },
  legal:         { fill: 'rgba(76,175,80,0.35)',  stroke: 'rgba(56,142,60,0.9)',  width: 1.5 },
  lastBlack:     { fill: 'rgba(40,40,40,0.9)',    stroke: '#FFA726',              width: 3 },
  lastWhite:     { fill: 'rgba(255,255,255,0.9)', stroke: '#FFA726',              width: 3 },
  hoverEmpty:    { fill: 'rgba(200,200,200,0.7)', stroke: 'rgba(100,100,100,1)',  width: 2 },
  hoverLegal:    { fill: 'rgba(76,175,80,0.55)',  stroke: 'rgba(27,94,32,1)',     width: 2 },
};

function makeStyle(fill: string, stroke: string, width: number): Style {
  return new Style({ fill: new Fill({ color: fill }), stroke: new Stroke({ color: stroke, width }) });
}

export function getCellStyle(
  stone: StoneColor | null,
  isLegal: boolean,
  isLast: boolean,
  isHovered: boolean
): Style {
  if (isLast) {
    return makeStyle(
      stone === 'black' ? COLOR.lastBlack.fill : COLOR.lastWhite.fill,
      COLOR.lastBlack.stroke,
      COLOR.lastBlack.width
    );
  }
  if (isHovered) {
    const c = isLegal ? COLOR.hoverLegal : COLOR.hoverEmpty;
    return makeStyle(c.fill, c.stroke, c.width);
  }
  if (stone === 'black') return makeStyle(COLOR.black.fill, COLOR.black.stroke, COLOR.black.width);
  if (stone === 'white') return makeStyle(COLOR.white.fill, COLOR.white.stroke, COLOR.white.width);
  if (isLegal) return makeStyle(COLOR.legal.fill, COLOR.legal.stroke, COLOR.legal.width);
  return makeStyle(COLOR.empty.fill, COLOR.empty.stroke, COLOR.empty.width);
}
