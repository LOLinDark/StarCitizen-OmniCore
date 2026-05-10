import React, { useRef, useEffect } from 'react';
import { Box, Title, Text } from '@mantine/core';
import Moveable from 'react-moveable';
import HOTASInputView from '../components/HOTASInputView.jsx';

// Path to the HOTAS image (place in public/assets or adjust as needed)
const HOTAS_IMAGE = '/assets/hotas/x52-hotas-transparent-background-omnicore-starcitizen.png';

export default function HC05LiveInputContainer({ overlays, onOverlayChange, keybindings, deviceMap, devEditMode = true, setDevEditMode, isDevMode = true, dragged, setDragged }) {
  // Overlay refs for Moveable
  const overlayRefs = useRef([]);
  const containerWidth = 700;
  const containerHeight = 700;
  // Convert percent to px for draggable default position
  const percentToPx = (percent, base) => (parseFloat(percent) / 100) * base;
  const pxToPercent = (px, base) => `${((px / base) * 100).toFixed(2)}%`;


  // Auto-save overlays to backend every minute in dev edit mode
  useEffect(() => {
    if (isDevMode && devEditMode) {
      const save = () => {
        fetch('/api/hotas-overlay-positions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(overlays),
        }).then(res => {
          if (!res.ok) throw new Error('Failed to save overlay positions');
        }).catch(e => console.error('Overlay auto-save error:', e));
      };
      save(); // Save immediately on enable
      const interval = setInterval(save, 60000);
      return () => clearInterval(interval);
    }
  }, [isDevMode, devEditMode, overlays]);

  // Export overlays to JSON (manual download)
  const handleExport = () => {
    const data = JSON.stringify(overlays, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hotas-overlay-positions.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', width: '100%' }}>
      {/* HOTAS Overlay Demo (from /hotas-overlay) */}
      <div style={{ flex: '0 0 740px', position: 'relative' }}>
        <Box p="lg">
          <Title order={3} mb="md">X52 HOTAS Overlay Demo</Title>
          <Text mb="md">This demo uses your HOTAS photo as a background with clickable overlay regions. All overlays are now resizable circles.</Text>
          <div
            style={{
              position: 'relative',
              width: 700,
              height: 700,
              background: `url(${HOTAS_IMAGE}) center/contain no-repeat`,
              margin: '0 auto',
              borderRadius: 16,
              boxShadow: '0 4px 32px #0004',
              overflow: 'hidden',
            }}
          >
            {overlays.map((overlay, idx) => {
              const leftPx = percentToPx(overlay.style.left, containerWidth);
              const topPx = percentToPx(overlay.style.top, containerHeight);
              const sizePx = percentToPx(overlay.style.size, containerWidth);
              return (
                <React.Fragment key={overlay.id}>
                  <div
                    ref={el => overlayRefs.current[idx] = el}
                    title={overlay.label}
                    style={{
                      position: 'absolute',
                      left: leftPx,
                      top: topPx,
                      width: sizePx,
                      height: sizePx,
                      background: 'rgba(0,200,255,0.18)',
                      border: '2px solid #00d9ff',
                      cursor: isDevMode && devEditMode ? 'move' : 'pointer',
                      transition: 'background 0.2s',
                      borderRadius: '50%',
                      zIndex: dragged === overlay.id ? 2 : 1,
                      boxSizing: 'border-box',
                    }}
                  />
                  {isDevMode && devEditMode && (
                    <Moveable
                      target={overlayRefs.current[idx]}
                      draggable={true}
                      resizable={true}
                      keepRatio={true}
                      throttleResize={1}
                      onDrag={({ left, top }) => {
                        const newLeft = pxToPercent(left, containerWidth);
                        const newTop = pxToPercent(top, containerHeight);
                        onOverlayChange(prev => prev.map((o, i) => i === idx ? {
                          ...o,
                          style: {
                            ...o.style,
                            left: newLeft,
                            top: newTop,
                          },
                        } : o));
                      }}
                      onResize={({ width, height, drag }) => {
                        const newSize = pxToPercent(width, containerWidth);
                        const newLeft = pxToPercent(drag.left, containerWidth);
                        const newTop = pxToPercent(drag.top, containerHeight);
                        onOverlayChange(prev => prev.map((o, i) => i === idx ? {
                          ...o,
                          style: {
                            ...o.style,
                            left: newLeft,
                            top: newTop,
                            size: newSize,
                          },
                        } : o));
                      }}
                      renderDirections={["nw", "ne", "sw", "se"]}
                      edge={false}
                      origin={false}
                      padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Export and Resize/Drag toggle buttons in dev mode */}
          {isDevMode && (
            <Box mt="md" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                style={{
                  padding: '6px 18px',
                  fontSize: 16,
                  borderRadius: 8,
                  border: '1px solid #00d9ff',
                  background: '#00d9ff',
                  color: '#222',
                  cursor: 'pointer',
                  marginBottom: 8,
                }}
                onClick={handleExport}
              >
                Export Overlay Positions to JSON
              </button>
              <button
                style={{
                  padding: '6px 18px',
                  fontSize: 16,
                  borderRadius: 8,
                  border: '1px solid #00d9ff',
                  background: devEditMode ? '#00d9ff' : '#222',
                  color: devEditMode ? '#222' : '#00d9ff',
                  cursor: 'pointer',
                  marginBottom: 8,
                }}
                onClick={() => setDevEditMode && setDevEditMode((v) => !v)}
              >
                {devEditMode ? 'Disable Resize/Drag' : 'Enable Resize/Drag'}
              </button>
            </Box>
          )}
        </Box>
      </div>
      {/* Live Input Table/Mapping */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <HOTASInputView deviceMap={deviceMap} keybindings={keybindings} />
      </div>
    </div>
  );
}
