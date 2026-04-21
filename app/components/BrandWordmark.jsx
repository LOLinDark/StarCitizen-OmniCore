import { Text } from '@mantine/core';

export default function BrandWordmark({ onClick, size = '1.5rem', color = '#00d9ff' }) {
  return (
    <Text
      fw={700}
      onClick={onClick}
      style={{
        letterSpacing: '0.1em',
        color,
        margin: 0,
        fontSize: size,
        lineHeight: 1,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <span style={{ fontSize: '1.22em' }}>O</span>MNI<span style={{ fontSize: '1.22em' }}>C</span>ORE
    </Text>
  );
}
