import React from 'react';

/**
 * X52 HOTAS SVG Diagram (Starter Component)
 *
 * - This is a simplified, scalable SVG layout for the X52 HOTAS stick and throttle.
 * - Each major control is a <g> group with a unique id and can be made interactive.
 * - Replace the placeholder shapes with more accurate paths as you refine the design.
 * - You can add props for highlighting, click handlers, etc.
 */

const HOTASX52Diagram = ({ onControlClick, highlighted = {} }) => (
  <svg
    viewBox="0 0 900 1100"
    width="100%"
    height="auto"
    style={{ maxWidth: 600, display: 'block', margin: '0 auto' }}
  >
    {/* Stick Base */}
    <g id="stick-base">
      <ellipse cx="300" cy="900" rx="120" ry="60" fill="#bbb" stroke="#888" strokeWidth="4" />
    </g>
    {/* Stick Body */}
    <g id="stick-body">
      <rect x="260" y="500" width="80" height="400" rx="40" fill="#888" stroke="#444" strokeWidth="4" />
    </g>
    {/* Trigger */}
    <g
      id="trigger"
      onClick={() => onControlClick && onControlClick('trigger')}
      style={{ cursor: 'pointer' }}
    >
      <rect x="320" y="520" width="20" height="60" rx="8" fill={highlighted.trigger ? '#ff0' : '#ccc'} stroke="#888" strokeWidth="2" />
    </g>
    {/* Second Trigger */}
    <g
      id="second-trigger"
      onClick={() => onControlClick && onControlClick('second-trigger')}
      style={{ cursor: 'pointer' }}
    >
      <rect x="295" y="540" width="15" height="40" rx="6" fill={highlighted['second-trigger'] ? '#ff0' : '#ccc'} stroke="#888" strokeWidth="2" />
    </g>
    {/* POV Hat 1 */}
    <g
      id="pov-hat-1"
      onClick={() => onControlClick && onControlClick('pov-hat-1')}
      style={{ cursor: 'pointer' }}
    >
      <circle cx="300" cy="480" r="18" fill={highlighted['pov-hat-1'] ? '#ff0' : '#eee'} stroke="#888" strokeWidth="2" />
    </g>
    {/* Fire A Button */}
    <g
      id="fire-a"
      onClick={() => onControlClick && onControlClick('fire-a')}
      style={{ cursor: 'pointer' }}
    >
      <circle cx="340" cy="470" r="12" fill={highlighted['fire-a'] ? '#ff0' : '#f88'} stroke="#888" strokeWidth="2" />
    </g>
    {/* Pinkie Trigger */}
    <g
      id="pinkie-trigger"
      onClick={() => onControlClick && onControlClick('pinkie-trigger')}
      style={{ cursor: 'pointer' }}
    >
      <rect x="260" y="600" width="20" height="40" rx="8" fill={highlighted['pinkie-trigger'] ? '#ff0' : '#eee'} stroke="#888" strokeWidth="2" />
    </g>
    {/* Throttle Base */}
    <g id="throttle-base">
      <ellipse cx="650" cy="900" rx="140" ry="70" fill="#bbb" stroke="#888" strokeWidth="4" />
    </g>
    {/* Throttle Body */}
    <g id="throttle-body">
      <rect x="570" y="600" width="160" height="300" rx="60" fill="#888" stroke="#444" strokeWidth="4" />
    </g>
    {/* Slider */}
    <g
      id="slider"
      onClick={() => onControlClick && onControlClick('slider')}
      style={{ cursor: 'pointer' }}
    >
      <rect x="700" y="800" width="30" height="80" rx="10" fill={highlighted['slider'] ? '#ff0' : '#eee'} stroke="#888" strokeWidth="2" />
    </g>
    {/* Rotary 1 */}
    <g
      id="rotary-1"
      onClick={() => onControlClick && onControlClick('rotary-1')}
      style={{ cursor: 'pointer' }}
    >
      <circle cx="600" cy="850" r="16" fill={highlighted['rotary-1'] ? '#ff0' : '#eee'} stroke="#888" strokeWidth="2" />
    </g>
    {/* Rotary 2 */}
    <g
      id="rotary-2"
      onClick={() => onControlClick && onControlClick('rotary-2')}
      style={{ cursor: 'pointer' }}
    >
      <circle cx="700" cy="850" r="16" fill={highlighted['rotary-2'] ? '#ff0' : '#eee'} stroke="#888" strokeWidth="2" />
    </g>
    {/* Mini Stick */}
    <g
      id="mini-stick"
      onClick={() => onControlClick && onControlClick('mini-stick')}
      style={{ cursor: 'pointer' }}
    >
      <circle cx="650" cy="700" r="14" fill={highlighted['mini-stick'] ? '#ff0' : '#eee'} stroke="#888" strokeWidth="2" />
    </g>
    {/* Add more controls as needed... */}
    {/* Labels (for demo, you can style/position as needed) */}
    <text x="300" y="950" fontSize="18" textAnchor="middle" fill="#333">Stick</text>
    <text x="650" y="980" fontSize="18" textAnchor="middle" fill="#333">Throttle</text>
  </svg>
);

export default HOTASX52Diagram;
