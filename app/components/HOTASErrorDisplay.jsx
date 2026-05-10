import React from 'react';
import { Box, Text } from '@mantine/core';

/**
 * Error display for HOTAS config page.
 * Props:
 * - error: error message string
 */
export default function HOTASErrorDisplay({ error }) {
  if (!error) return null;
  return (
    <Box
      p="md"
      style={{
        background: 'rgba(255, 107, 107, 0.1)',
        border: '1px solid rgba(255, 107, 107, 0.3)',
        borderRadius: '8px',
      }}
    >
      <Text size="sm" style={{ color: '#ff6b6b' }}>
        ⚠️ {error}
      </Text>
    </Box>
  );
}
