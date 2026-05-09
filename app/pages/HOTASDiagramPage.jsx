import React from 'react';
import HOTASX52Diagram from '../components/HOTASX52Diagram';
import { Box, Title, Text } from '@mantine/core';

export default function HOTASDiagramPage() {
  // Demo: highlight nothing, log clicks
  const handleControlClick = (control) => {
    alert(`Clicked: ${control}`);
  };

  return (
    <Box p="lg">
      <Title order={2} mb="md">X52 HOTAS Diagram (Demo)</Title>
      <Text mb="md">
        This is a starter SVG/React version of the X52 HOTAS. Click any control to test interactivity.
      </Text>
      <HOTASX52Diagram onControlClick={handleControlClick} highlighted={{}} />
    </Box>
  );
}
