import { useState } from 'react';
import { Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconRocket, IconSword, IconDiamond, IconSettings, IconSteeringWheel, IconChevronDown } from '@tabler/icons-react';

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

const MIN_PROFILE_CARD_WIDTH = 320;

function getProfileColor(meta, index) {
  return meta?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

function getProfileIcon(meta) {
  const Icon = MODE_ICONS[meta?.gameMode] || MODE_ICONS.default;
  return <Icon size={20} />;
}

function normalizeProfileLabel(rawName) {
  const text = String(rawName || '').trim();
  if (!text) return '';

  return text
    .replace(/^layout_/i, '')
    .replace(/_exported$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function ProfileCardScroller({ profiles, selectedProfile, onSelect }) {
  const [showChoices, setShowChoices] = useState(false);

  const allCards = profiles.map((p, i) => ({ ...p, index: i }));

  if (allCards.length === 0) {
    return (
      <div style={{ padding: '1rem', border: '1px dashed rgba(0,217,255,0.2)', borderRadius: 8, textAlign: 'center' }}>
        <Text size="sm" c="dimmed">No profiles found. Place XML files in your Star Citizen mappings folder.</Text>
      </div>
    );
  }

  const activeCard = allCards.find((card) => selectedProfile === card.name || selectedProfile === card.value) || null;
  const meta = activeCard?.meta || {};
  const color = activeCard ? getProfileColor(meta, activeCard.index) : '#00bcd4';
  const label = activeCard
    ? (meta.label || activeCard.label || normalizeProfileLabel(activeCard.name) || activeCard.name)
    : 'Select a profile';
  const description = activeCard ? (meta.description || '') : 'Choose an imported HOTAS profile to begin editing.';
  const gameMode = activeCard ? (meta.gameMode || '') : '';
  const activeKey = activeCard ? (activeCard.value || activeCard.name) : null;
  const alternativeCards = activeKey
    ? allCards.filter((card) => (card.value || card.name) !== activeKey)
    : allCards;

  const handleSelect = (card) => {
    onSelect(card.value || card.name);
    setShowChoices(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: MIN_PROFILE_CARD_WIDTH, maxWidth: 640 }}>
      <Tooltip label={description || label} position="bottom" disabled={!description}>
        <div
          onClick={() => setShowChoices((current) => !current)}
          style={{
            width: '100%',
            minHeight: 92,
            borderRadius: 10,
            padding: '0.75rem',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            border: `2px solid ${color}`,
            background: activeCard
              ? `linear-gradient(135deg, ${color}22 0%, rgba(0,0,0,0.6) 100%)`
              : 'linear-gradient(135deg, rgba(0,188,212,0.14) 0%, rgba(0,0,0,0.6) 100%)',
            boxShadow: `0 0 16px ${color}44`,
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {activeCard && meta.shipImage && (
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

          <Group gap="xs" wrap="nowrap" justify="space-between" style={{ position: 'relative' }}>
            <Group gap="xs" wrap="nowrap">
              <div style={{ color, flexShrink: 0 }}>
                {getProfileIcon(meta)}
              </div>
              <Text size="sm" fw={700} lineClamp={1} style={{ color: '#e0eaf4' }}>
                {label}
              </Text>
            </Group>
            <IconChevronDown size={16} color="#e0eaf4" />
          </Group>

          <Group gap={4} style={{ position: 'relative' }}>
            {gameMode && gameMode !== 'default' && (
              <Badge size="xs" color={color} variant="light" style={{ textTransform: 'capitalize' }}>
                {gameMode}
              </Badge>
            )}
            {activeCard ? (
              <Badge size="xs" color="green" variant="filled">Active</Badge>
            ) : (
              <Badge size="xs" color="cyan" variant="light">Not selected</Badge>
            )}
          </Group>
        </div>
      </Tooltip>

      {showChoices && alternativeCards.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: 0,
            width: '100%',
            zIndex: 20,
            borderRadius: 10,
            border: '1px solid rgba(0, 217, 255, 0.3)',
            background: 'rgba(9, 12, 20, 0.97)',
            boxShadow: '0 14px 28px rgba(0, 0, 0, 0.35)',
            padding: '0.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          {alternativeCards.map((card) => {
            const optionMeta = card.meta || {};
            const optionColor = getProfileColor(optionMeta, card.index);
            const optionLabel = optionMeta.label || card.label || normalizeProfileLabel(card.name) || card.name;
            const optionMode = optionMeta.gameMode || '';

            return (
              <div
                key={card.value || card.name}
                onClick={() => handleSelect(card)}
                style={{
                  border: `1px solid ${optionColor}55`,
                  borderRadius: 8,
                  padding: '0.55rem 0.6rem',
                  cursor: 'pointer',
                  background: `${optionColor}16`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <Group gap="xs" wrap="nowrap">
                  <div style={{ color: optionColor, flexShrink: 0 }}>
                    {getProfileIcon(optionMeta)}
                  </div>
                  <Text size="xs" fw={700} lineClamp={1} style={{ color: '#dce7f3' }}>
                    {optionLabel}
                  </Text>
                </Group>
                <Group gap={4}>
                  {optionMode && optionMode !== 'default' && (
                    <Badge size="xs" color={optionColor} variant="light" style={{ textTransform: 'capitalize' }}>
                      {optionMode}
                    </Badge>
                  )}
                </Group>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
