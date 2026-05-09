import React from 'react';
import { Box, Title, Text } from '@mantine/core';

// Path to the HOTAS image (place in public/assets or adjust as needed)
const HOTAS_IMAGE = '/assets/hotas/x52-photo.jpg';

// Example overlay regions (absolute positioning, tweak as needed)
const overlays = [
  {
    id: 'trigger',
    label: 'Trigger',
    style: {
      left: '62%',
      top: '38%',
      width: '6%',
      height: '10%',
      borderRadius: '50%',
    },
  },
  {
    id: 'throttle',
    label: 'Throttle',
    style: {
      left: '7%',
      top: '55%',
      width: '30%',
      height: '30%',
      borderRadius: '40%',
    },
  },
  // Add more overlays for each control as needed
];

export default function HOTASOverlayPage() {
  const handleOverlayClick = (id) => {
    alert(`Clicked: ${id}`);
  };

  return (
    <Box p="lg">
      <Title order={2} mb="md">X52 HOTAS Overlay Demo</Title>
      <Text mb="md">This demo uses your HOTAS photo as a background with clickable overlay regions. Add more overlays as needed!</Text>
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
        {overlays.map((overlay) => (
          <div
            key={overlay.id}
            title={overlay.label}
            onClick={() => handleOverlayClick(overlay.id)}
            style={{
              position: 'absolute',
              background: 'rgba(0,200,255,0.18)',
              border: '2px solid #00d9ff',
              cursor: 'pointer',
              transition: 'background 0.2s',
              ...overlay.style,
            }}
          />
        ))}
      </div>
    </Box>
  );
}
