/**
 * SciFiFrame — Wrapper around @arwes/react-frames
 * 
 * Isolates Arwes dependency so pages never import from @arwes/* directly.
 * If Arwes changes API or needs replacing, only this file changes.
 * 
 * Usage:
 *   <SciFiFrame variant="corners">Content here</SciFiFrame>
 *   <SciFiFrame variant="lines" styled animated>Content here</SciFiFrame>
 *   <SciFiFrame variant="nefrex" padding={4}>Content here</SciFiFrame>
 */
import { FrameCorners, FrameLines, FrameNefrex, FrameOctagon, FrameHeader } from '@arwes/react-frames';

const FRAME_COMPONENTS = {
  corners: FrameCorners,
  lines: FrameLines,
  nefrex: FrameNefrex,
  octagon: FrameOctagon,
  header: FrameHeader,
};

const DEFAULTS = {
  styled: true,
  animated: true,
  padding: 4,
  strokeWidth: 1,
  cornerLength: 16,
  smallLineLength: 16,
};

export default function SciFiFrame({
  variant = 'corners',
  children,
  className = '',
  style = {},
  ...frameProps
}) {
  const Frame = FRAME_COMPONENTS[variant] || FrameCorners;
  const mergedProps = { ...DEFAULTS, ...frameProps };

  return (
    <div className={`scifi-frame ${className}`} style={{ position: 'relative', ...style }}>
      <Frame {...mergedProps} />
      <div style={{ position: 'relative', zIndex: 1, padding: mergedProps.padding * 4 }}>
        {children}
      </div>
    </div>
  );
}
