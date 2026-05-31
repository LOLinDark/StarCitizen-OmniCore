import React, { useState, useEffect } from 'react';
import { Box, Title, Text } from '@mantine/core';
import HC05LiveInputContainer from '../containers/HC05LiveInputContainer.jsx';
import { X52_BUTTONS, X52_AXES, X52_MODES, X52_POV_DIRECTIONS } from '../libraries/hotas/devices/LogitechX52.js';
import DevTag from '../components/DevTag';

// Example: import keybindings and deviceMap from your data sources
// import keybindings from '../data/starcitizen-keybindings.js';
// import deviceMap from '../libraries/hotas/devices/LogitechX52.js';


// Initial overlays (copied from HOTASOverlayPage)
const initialOverlays = [
  { id: 'hair-trigger', label: 'Hair Trigger', style: { left: '60%', top: '35%', size: '7%' } },
  { id: 'trigger-full', label: 'Trigger Full', style: { left: '66%', top: '35%', size: '7%' } },
  { id: 'safe', label: 'Safe Button', style: { left: '62%', top: '30%', size: '6%' } },
  { id: 'button-a', label: 'Button A', style: { left: '68%', top: '28%', size: '6%' } },
  { id: 'button-b', label: 'Button B', style: { left: '70%', top: '32%', size: '6%' } },
  { id: 'button-c', label: 'Button C', style: { left: '65%', top: '25%', size: '6%' } },
  { id: 'pinkie-switch', label: 'Pinkie Switch', style: { left: '58%', top: '45%', size: '7%' } },
  { id: 'pov-hat-1-n', label: 'POV Hat 1 North', style: { left: '62%', top: '20%', size: '6%' } },
  { id: 'pov-hat-1-e', label: 'POV Hat 1 East', style: { left: '68%', top: '22%', size: '6%' } },
  { id: 'pov-hat-1-s', label: 'POV Hat 1 South', style: { left: '65%', top: '28%', size: '6%' } },
  { id: 'pov-hat-1-w', label: 'POV Hat 1 West', style: { left: '60%', top: '25%', size: '6%' } },
  { id: 'throttle', label: 'Throttle', style: { left: '7%', top: '55%', size: '30%' } },
  { id: 'button-d', label: 'Button D', style: { left: '20%', top: '60%', size: '6%' } },
  { id: 'fire-d', label: 'Fire D', style: { left: '25%', top: '65%', size: '6%' } },
  { id: 'button-e', label: 'Button E', style: { left: '15%', top: '70%', size: '6%' } },
  { id: 'mouse-button', label: 'Mouse Button', style: { left: '10%', top: '80%', size: '6%' } },
  { id: 'mini-stick', label: 'Mini Stick', style: { left: '30%', top: '80%', size: '7%' } },
  { id: 'rotary-1', label: 'Rotary 1', style: { left: '35%', top: '90%', size: '7%' } },
  { id: 'rotary-2', label: 'Rotary 2', style: { left: '40%', top: '95%', size: '7%' } },
  { id: 'slider', label: 'Slider', style: { left: '45%', top: '85%', size: '7%' } },
  { id: 'pov-hat-2-n', label: 'POV Hat 2 North', style: { left: '12%', top: '60%', size: '6%' } },
  { id: 'pov-hat-2-e', label: 'POV Hat 2 East', style: { left: '18%', top: '62%', size: '6%' } },
  { id: 'pov-hat-2-s', label: 'POV Hat 2 South', style: { left: '15%', top: '68%', size: '6%' } },
  { id: 'pov-hat-2-w', label: 'POV Hat 2 West', style: { left: '10%', top: '65%', size: '6%' } },
  { id: 'pov-hat-3-n', label: 'POV Hat 3 North', style: { left: '25%', top: '70%', size: '6%' } },
  { id: 'pov-hat-3-e', label: 'POV Hat 3 East', style: { left: '30%', top: '72%', size: '6%' } },
  { id: 'pov-hat-3-s', label: 'POV Hat 3 South', style: { left: '28%', top: '78%', size: '6%' } },
  { id: 'pov-hat-3-w', label: 'POV Hat 3 West', style: { left: '23%', top: '75%', size: '6%' } },
  { id: 'toggle-t1', label: 'Toggle T1', style: { left: '50%', top: '60%', size: '6%' } },
  { id: 'toggle-t2', label: 'Toggle T2', style: { left: '55%', top: '62%', size: '6%' } },
  { id: 'toggle-t3', label: 'Toggle T3', style: { left: '60%', top: '64%', size: '6%' } },
  { id: 'toggle-t4', label: 'Toggle T4', style: { left: '65%', top: '66%', size: '6%' } },
  { id: 'toggle-t5', label: 'Toggle T5', style: { left: '70%', top: '68%', size: '6%' } },
  { id: 'toggle-t6', label: 'Toggle T6', style: { left: '75%', top: '70%', size: '6%' } },
  { id: 'mode-m1', label: 'Mode Switch M1', style: { left: '80%', top: '20%', size: '6%' } },
  { id: 'mode-m2', label: 'Mode Switch M2', style: { left: '85%', top: '22%', size: '6%' } },
  { id: 'mode-m3', label: 'Mode Switch M3', style: { left: '90%', top: '24%', size: '6%' } },
  { id: 'mfd-function', label: 'Function', style: { left: '34.29%', top: '47.14%', size: '4.29%' } },
  { id: 'mfd-timer-toggle', label: 'Start/Stop Timer', style: { left: '37.14%', top: '45.71%', size: '4.29%' } },
  { id: 'mfd-timer-reset', label: 'Reset Timer', style: { left: '40.14%', top: '48.14%', size: '4.29%' } },
  { id: 'clutch', label: 'Clutch', style: { left: '95%', top: '90%', size: '6%' } },
  { id: 'wheel-mouse-btn-2', label: 'Wheel Mouse Button 2', style: { left: '20%', top: '85%', size: '6%' } },
];
const keybindings = [];
const deviceMap = { X52_BUTTONS, X52_AXES, X52_MODES, X52_POV_DIRECTIONS };
const PAGE_DEV_TAG = 'HC07';

export default function HOTASLiveInputPage() {
  // Overlay state (initialize with initialOverlays, fallback to localStorage)
  const [overlays, setOverlays] = useState(() => {
    try {
      const saved = localStorage.getItem('hotasOverlayPositions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialOverlays;
  });

  useEffect(() => {
    try {
      localStorage.setItem('hotasOverlayPositions', JSON.stringify(overlays));
    } catch (e) {}
  }, [overlays]);

  return (
    <Box p="lg">
      <Title order={2} mb="md"><DevTag tag={PAGE_DEV_TAG} />HOTAS Live Input</Title>
      <Text mb="md">All HOTAS mapping, overlays, and live input are unified here for easy access and editing.</Text>
      <HC05LiveInputContainer
        overlays={overlays}
        onOverlayChange={setOverlays}
        keybindings={keybindings}
        deviceMap={deviceMap}
      />
    </Box>
  );
}
