/**
 * SciFiText — Wrapper around @arwes/react-text
 * 
 * Provides animated typewriter/glitch text effects.
 * Falls back to plain text if Arwes is removed.
 * 
 * Usage:
 *   <SciFiText as="h1">OMNI-CORE</SciFiText>
 *   <SciFiText blink>Loading systems...</SciFiText>
 *   <SciFiText fixed>Static sci-fi styled text</SciFiText>
 */
import { Text } from '@arwes/react-text';

export default function SciFiText({
  as = 'span',
  children,
  className = '',
  style = {},
  blink = false,
  fixed = false,
  manager,
  ...rest
}) {
  return (
    <Text
      as={as}
      className={className}
      style={style}
      blink={blink}
      fixed={fixed}
      manager={manager}
      {...rest}
    >
      {children}
    </Text>
  );
}
