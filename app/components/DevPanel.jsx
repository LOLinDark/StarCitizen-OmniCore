import { Stack, Button, Text, Paper } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { routeConfig } from '../config/routes';
import useAppStore from '../stores/useAppStore';

export default function DevPanel() {
  const navigate = useNavigate();
  const devMode = useAppStore((s) => s.devMode);
  const [isMinimized, setIsMinimized] = useState(true);
  const panelWidth = 294;

  // Hide panel when Dev Mode is off
  if (!devMode) return null;

  const getSectionColor = (color) => {
    if (color === 'orange') return '#ff6b00';
    if (color === 'grape') return '#b300ff';
    if (color === 'teal') return '#00d9ff';
    return '#00ff88';
  };

  const handleMouseDown = (e) => {
    const paper = e.currentTarget;
    const rect = paper.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    const onMouseMove = (e) => {
      paper.style.left = (e.clientX - startX) + 'px';
      paper.style.top = (e.clientY - startY + window.scrollY) + 'px';
      paper.style.bottom = 'auto';
      paper.style.right = 'auto';
      paper.style.transform = 'none';
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
      <Paper
        p="md"
        radius="sm"
        style={{
          position: 'fixed',
          top: '132px',
          left: '10px',
          transform: 'none',
          width: `${panelWidth}px`,
          maxHeight: isMinimized ? 'auto' : '600px',
          zIndex: 999,
          background: 'rgba(11, 20, 40, 0.95)',
          border: '2px solid #00d9ff',
          boxShadow: '0 0 20px rgba(0, 217, 255, 0.3), inset 0 0 20px rgba(0, 217, 255, 0.1)',
          cursor: 'default',
          overflow: isMinimized ? 'visible' : 'auto',
          userSelect: 'none',
        }}
      >
        <Stack gap="xs">
          {/* Header */}
          <div
            style={{
              borderBottom: '1px solid rgba(0, 217, 255, 0.3)',
              paddingBottom: '0.5rem',
              marginBottom: isMinimized ? '0' : '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'move',
            }}
            onMouseDown={handleMouseDown}
          >
            <div>
              <Text size="xs" fw={700} style={{ color: '#00d9ff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                🔬 Developer Panel
              </Text>
              {!isMinimized && (
                <Text size="xs" c="dimmed" style={{ fontSize: '0.65rem' }}>
                  Drag to move • Click links to navigate
                </Text>
              )}
            </div>
            <Button
              size="xs"
              variant="subtle"
              color="cyan"
              p={4}
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Expand panel' : 'Minimize panel'}
            >
              {isMinimized ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </Button>
          </div>

          {/* Content - only show when not minimized */}
          {!isMinimized && (
            <>
              {/* Dynamic Route Sections */}
              {Object.entries(routeConfig).map(([key, routes], idx) => (
                <div
                  key={key}
                  style={idx > 0 ? { borderTop: '1px solid rgba(0, 217, 255, 0.2)', paddingTop: '0.5rem' } : {}}
                >
                  <Text
                    size="xs"
                    fw={600}
                    style={{
                      color: getSectionColor(routes[0]?.color),
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {routes[0]?.category || key}
                  </Text>
                  <Stack gap="xs">
                    {routes.map((route) => (
                      <Button
                        key={route.path}
                        size="xs"
                        variant="outline"
                        color={route.color}
                        fullWidth
                        onClick={() => navigate(route.path)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {route.label}
                      </Button>
                    ))}
                  </Stack>
                </div>
              ))}

              {/* Info */}
              <div style={{ borderTop: '1px solid rgba(0, 217, 255, 0.2)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <Text size="xs" c="dimmed" style={{ fontSize: '0.65rem', lineHeight: 1.4 }}>
                  💡 Tip: Drag to undock from footer. Panel stays on top.
                </Text>
              </div>
            </>
          )}
        </Stack>
      </Paper>
  );
}
