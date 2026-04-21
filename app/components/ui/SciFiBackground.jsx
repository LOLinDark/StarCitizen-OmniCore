/**
 * SciFiBackground — Wrapper around @arwes/react-bgs
 * 
 * Provides animated sci-fi background effects (dots, grid lines).
 * Positioned absolutely to sit behind content.
 * 
 * Usage:
 *   <SciFiBackground variant="dots" color="hsla(180,75%,50%,0.15)" />
 *   <SciFiBackground variant="gridLines" lineColor="hsla(180,75%,50%,0.07)" />
 */
import { Dots, GridLines } from '@arwes/react-bgs';

const BG_COMPONENTS = {
  dots: Dots,
  gridLines: GridLines,
};

const BG_STYLE = {
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
};

export default function SciFiBackground({
  variant = 'dots',
  style = {},
  ...props
}) {
  const Bg = BG_COMPONENTS[variant] || Dots;

  return <Bg style={{ ...BG_STYLE, ...style }} {...props} />;
}
