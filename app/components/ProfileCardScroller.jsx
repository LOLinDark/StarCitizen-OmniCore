import { useRef } from 'react';
import { ActionIcon, Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconRocket, IconSword, IconDiamond, IconSettings, IconSteeringWheel } from '@tabler/icons-react';

const MODE_ICONS = {
  combat: IconSword,
  mining: IconDiamond,
  racing: IconSteeringWheel,
  exploration: IconRocket,
  default: IconSettings,
};

const DEFAULT_COLORS = [
  '#1e90ff', '#ff6b00', '#22d17b', '#b300ff', '#ff3366',
  '#00bcd4', '#ff9800', '#8bc34a', '#e91e63', '#607d8b',
];

function getProfileColor(meta, index) {
  return meta?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

function getProfileIcon(meta) {
  const Icon = MODE_ICONS[meta?.gameMode] || MODE_ICONS.default;
  return <Icon size={20} />;
}

export default function ProfileCardScroller({ profiles, selectedProfile, onSelect, aiProfiles = [] }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  const allCards = [
    ...aiProfiles.map((p, i) => ({ ...p, isAI: true, index: i })),
    ...profiles.map((p, i) => ({ ...p, isAI: false, index: i + aiProfiles.length })),
  ];

  if (allCards.length === 0) {
    return (
      <div style={{ padding: '1rem', border: '1px dashed rgba(0,217,255,0.2)', borderRadius: 8, textAlign: 'center' }}>
        <Text size="sm" c="dimmed">No profiles found. Place XML files in your Star Citizen mappings folder.</Text>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Scroll buttons */}
      <ActionIcon
        variant="filled"
        size="sm"
        onClick={() => scroll(-1)}
        style={{ position: 'absolute', left: -12, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(0,0,0,0.7)' }}
      >
        <IconChevronLeft size={14} />
      </ActionIcon>
      <ActionIcon
        variant="filled"
        size="sm"
        onClick={() => scroll(1)}
        style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(0,0,0,0.7)' }}
      >
        <IconChevronRight size={14} />
      </ActionIcon>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '0.75rem',
          overflowX: 'auto',
          padding: '0.5rem 1rem',
          scrollbarWidth: 'thin',
          scrollBehavior: 'smooth',
        }}
      >
        {allCards.map((card) => {
          const meta = card.meta || {};
          const color = getProfileColor(meta, card.index);
          const isActive = selectedProfile === card.name || selectedProfile === card.value;
          const label = meta.label || card.label || card.name;
          const description = meta.description || '';
          const gameMode = meta.gameMode || (card.isAI ? 'default' : '');

          return (
            <Tooltip key={card.value || card.name} label={description || label} position="bottom" disabled={!description}>
              <div
                onClick={() => onSelect(card.value || card.name)}
                style={{
                  flex: '0 0 220px',
                  height: 100,
                  borderRadius: 10,
                  padding: '0.75rem',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  border: isActive ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
                  background: isActive
                    ? `linear-gradient(135deg, ${color}22 0%, rgba(0,0,0,0.6) 100%)`
                    : 'rgba(0,0,0,0.4)',
                  boxShadow: isActive ? `0 0 16px ${color}44` : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = `${color}66`; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                {/* Ship background image (future) */}
                {meta.shipImage && (
                  <img
                    src={meta.shipImage}
                    alt=""
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0.15,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Top row: icon + name */}
                <Group gap="xs" wrap="nowrap" style={{ position: 'relative' }}>
                  <div style={{ color, flexShrink: 0 }}>
                    {getProfileIcon(meta)}
                  </div>
                  <Text size="xs" fw={700} lineClamp={1} style={{ color: '#e0eaf4' }}>
                    {label}
                  </Text>
                </Group>

                {/* Bottom row: badges */}
                <Group gap={4} style={{ position: 'relative' }}>
                  {card.isAI && (
                    <Badge size="xs" color="grape" variant="filled">AI</Badge>
                  )}
                  {gameMode && gameMode !== 'default' && (
                    <Badge size="xs" color={color} variant="light" style={{ textTransform: 'capitalize' }}>
                      {gameMode}
                    </Badge>
                  )}
                  {isActive && (
                    <Badge size="xs" color="green" variant="filled">Active</Badge>
                  )}
                </Group>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
