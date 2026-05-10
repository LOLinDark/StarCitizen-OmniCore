import React, { useState, useRef, useEffect } from 'react';
import overlaysData from '../data/hotas-overlay-positions.json';
import { Box, Title, Text } from '@mantine/core';
import Draggable from 'react-draggable';
import Moveable from 'react-moveable';

// Path to the HOTAS image (place in public/assets or adjust as needed)
const HOTAS_IMAGE = '/assets/hotas/x52-hotas-transparent-background-omnicore-starcitizen.png';

// All overlays are now circles (width = height, borderRadius = 50%)
const initialOverlays = overlaysData;


export default function HOTASOverlayPage() {
  // Detect dev mode from .env (Vite exposes import.meta.env)
  const isDevMode = import.meta.env.DEVELOPMENT_MODE === 'true' || import.meta.env.MODE === 'development' || import.meta.env.NODE_ENV === 'development';

  // Load overlays from JSON file (bundled)
  const [overlays, setOverlays] = useState(initialOverlays);
  const [dragged, setDragged] = useState(null);
  // Dev mode: toggle resize/drag handles, persist in localStorage
  const [devEditMode, setDevEditMode] = useState(() => {
    try {
      const saved = localStorage.getItem('hotasOverlayDevEditMode');
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return true;
  });

  // In dev mode, show a button to export overlays to JSON (manual save)
  useEffect(() => {
    if (isDevMode && window) {
      window.exportHotasOverlayPositions = () => {
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
    }
  }, [overlays, isDevMode]);

  // Save devEditMode to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('hotasOverlayDevEditMode', devEditMode ? 'true' : 'false');
    } catch (e) {}
  }, [devEditMode]);

  const handleOverlayClick = (id) => {
    alert(`Clicked: ${id}`);
  };

  // Convert percent to px for draggable default position
  const percentToPx = (percent, base) => (parseFloat(percent) / 100) * base;
  const pxToPercent = (px, base) => `${((px / base) * 100).toFixed(2)}%`;

  const containerWidth = 500;
  const containerHeight = 500;

  // Refs for moveable targets
  const overlayRefs = useRef([]);

  return (
    <Box p="lg">
      <Title order={2} mb="md">X52 HOTAS Overlay Demo</Title>
      <Text mb="md">This demo uses your HOTAS photo as a background with clickable overlay regions. All overlays are now resizable circles.</Text>
      {isDevMode && (
        <Box mb="md">
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
            onClick={() => setDevEditMode((v) => !v)}
          >
            {devEditMode ? 'Disable Resize/Drag' : 'Enable Resize/Drag'}
          </button>
        </Box>
      )}
      <div
        style={{
          position: 'relative',
          width: 500,
          height: 500,
          background: `url(${HOTAS_IMAGE}) center/contain no-repeat`,
          margin: '0 auto',
          borderRadius: 16,
          boxShadow: '0 4px 32px #0004',
          overflow: 'hidden',
        }}
      >
        {overlays.map((overlay, idx) => {
          // Convert percent to px for draggable
          const leftPx = percentToPx(overlay.style.left, containerWidth);
          const topPx = percentToPx(overlay.style.top, containerHeight);
          const sizePx = percentToPx(overlay.style.size, containerWidth);

          return (
            <React.Fragment key={overlay.id}>
              <div
                ref={el => overlayRefs.current[idx] = el}
                title={overlay.label}
                onClick={() => handleOverlayClick(overlay.id)}
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
                    // Convert px back to percent
                    const newLeft = pxToPercent(left, containerWidth);
                    const newTop = pxToPercent(top, containerHeight);
                    setOverlays(prev => prev.map((o, i) => i === idx ? {
                      ...o,
                      style: {
                        ...o.style,
                        left: newLeft,
                        top: newTop,
                      },
                    } : o));
                  }}
                  onResize={({ width, height, drag }) => {
                    // Only use width (circle)
                    const newSize = pxToPercent(width, containerWidth);
                    const newLeft = pxToPercent(drag.left, containerWidth);
                    const newTop = pxToPercent(drag.top, containerHeight);
                    setOverlays(prev => prev.map((o, i) => i === idx ? {
                      ...o,
                      style: {
                        ...o.style,
                        left: newLeft,
                        top: newTop,
                        size: newSize,
                      },
                    } : o));
                    // Log new size and position
                    console.log(`Overlay '${overlay.id}' new: left: ${newLeft}, top: ${newTop}, size: ${newSize}`);
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
      {isDevMode && devEditMode && (
        <Box mt="md">
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
            onClick={() => window.exportHotasOverlayPositions()}
          >
            Export Overlay Positions to JSON
          </button>
        </Box>
      )}
    </Box>
  );
}
