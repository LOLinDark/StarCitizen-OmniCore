import { useAppStore } from '../stores';

/**
 * DevTag — displays a developer reference tag when Dev Mode is enabled.
 *
 * Usage:
 *   <Title><DevTag tag="DEV01" /> Developer Tools</Title>
 *
 * Tags are registered in src/config/devTags.js
 */
export default function DevTag({ tag }) {
  const devMode = useAppStore((s) => s.devMode);
  if (!devMode) return null;
  return <span style={{ color: '#ff9800' }}>[{tag}] </span>;
}
