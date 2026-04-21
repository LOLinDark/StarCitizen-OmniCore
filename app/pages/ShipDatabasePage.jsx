import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Checkbox,
  Container,
  Group,
  Loader,
  Modal,
  Pagination,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconExternalLink,
  IconLayoutColumns,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import DevTag from '../components/DevTag';
import { fetchShips, getCachedShips, warmShipsImageCache } from '../core/api/providers/ships';
import { ROLES, getRoles } from '../data/shipRoles';
import { getShipPricing, fmtPledgeUSD, fmtAUEC } from '../data/shipPricing';
import { getShipArtwork } from '../data/shipArtwork';

// ─── constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;
const SHIP_IMAGE_WARM_KEY = 'omnicore.ships.image-warm.lastAt';
const SHIP_IMAGE_WARM_TTL_MS = 12 * 60 * 60 * 1000;

const STATUS_COLORS = {
  'flight-ready': '#22d17b',
  'in-concept': '#ffb648',
  'in-production': '#5bc0f8',
};

const STATUS_LABELS = {
  'flight-ready': 'FLIGHT READY',
  'in-concept': 'CONCEPT',
  'in-production': 'IN PRODUCTION',
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtNum(n) {
  return n ? Number(n).toLocaleString() : '—';
}

function fmtDim(n) {
  return n ? `${n}m` : '—';
}

function fmtCargo(n) {
  return n ? `${n} SCU` : '—';
}

function fmtSpeed(n) {
  return n ? `${n} m/s` : '—';
}

function fmtCrew(ship) {
  const min = ship.crew?.min;
  const max = ship.crew?.max;
  if (!min && !max) return '—';
  if (min === max) return String(max);
  return `${min}–${max}`;
}

// ─── ShipDossier ─────────────────────────────────────────────────────────────

function YouTubeEmbed({ videoId, title }) {
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 6,
        overflow: 'hidden',
        aspectRatio: '16/9',
        background: '#000',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title || 'Official Ship Video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}

function ShipDossier({ ship }) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = ship.media || [];
  const hasVideo = Boolean(ship.youtubeId);

  const statusColor = STATUS_COLORS[ship.productionStatus] || '#7a9ab0';
  const statusLabel = STATUS_LABELS[ship.productionStatus] || ship.productionStatus;

  const specs = [
    ['Length', fmtDim(ship.dimensions?.length)],
    ['Beam', fmtDim(ship.dimensions?.beam)],
    ['Height', fmtDim(ship.dimensions?.height)],
    ['Mass', ship.mass ? `${fmtNum(ship.mass)} kg` : '—'],
    ['Crew', fmtCrew(ship)],
    ['Cargo', fmtCargo(ship.cargo)],
    ['SCM Speed', fmtSpeed(ship.speed?.scm)],
    ['Max Speed', fmtSpeed(ship.speed?.afterburner)],
    ['Size', ship.size ? ship.size.charAt(0).toUpperCase() + ship.size.slice(1) : '—'],
    ['Pledge Cost', ship.pledgeCost || '—'],
  ];

  return (
    <Stack gap="xl" style={{ color: '#e8eaf0' }}>
      {/* Ship identity */}
      <div>
        <Text size="xs" c="dimmed" fw={700} style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {ship.manufacturer?.name}
        </Text>
        <Text size="2rem" fw={700} lh={1.1} style={{ color: '#e8eaf0' }}>
          {ship.name}
        </Text>
        <Group gap="xs" mt={6}>
          {ship.focus && (
            <Badge size="sm" variant="outline" color="cyan">
              {ship.focus}
            </Badge>
          )}
          {ship.productionStatus && (
            <Badge size="sm" variant="dot" style={{ '--badge-dot-color': statusColor }}>
              {statusLabel}
            </Badge>
          )}
        </Group>
      </div>

      {/* Gallery + Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: images.length > 0 ? '1fr 1fr' : '1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Image gallery / Video */}
        {(hasVideo || images.length > 0) && (
          <div>
            {/* Main media area: YouTube embed if available, else first image */}
            {hasVideo ? (
              <>
                <YouTubeEmbed videoId={ship.youtubeId} title={`${ship.name} – Official Video`} />
                {images.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <Text size="xs" c="dimmed" mb={6} style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Gallery
                    </Text>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  position: 'relative',
                  borderRadius: 6,
                  overflow: 'hidden',
                  aspectRatio: '16/9',
                  background: '#050a18',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <img
                  key={imgIdx}
                  src={images[imgIdx]}
                  alt={`${ship.name} view ${imgIdx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.opacity = '0.2';
                  }}
                />
                {images.length > 1 && (
                  <>
                    <ActionIcon
                      size="sm"
                      variant="filled"
                      disabled={imgIdx === 0}
                      onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                      style={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.7)',
                      }}
                      aria-label="Previous image"
                    >
                      <IconArrowLeft size={12} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="filled"
                      disabled={imgIdx === images.length - 1}
                      onClick={() => setImgIdx((i) => Math.min(images.length - 1, i + 1))}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.7)',
                      }}
                      aria-label="Next image"
                    >
                      <IconArrowRight size={12} />
                    </ActionIcon>
                    {/* Dot indicators */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 5,
                      }}
                    >
                      {images.slice(0, 10).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          aria-label={`Image ${i + 1}`}
                          style={{
                            width: i === imgIdx ? 18 : 6,
                            height: 6,
                            borderRadius: 3,
                            background: i === imgIdx ? '#22d17b' : 'rgba(255,255,255,0.3)',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Thumbnail strip — shown regardless of whether video is playing */}
            {images.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  marginTop: 8,
                  overflowX: 'auto',
                  paddingBottom: 4,
                }}
              >
                {images.slice(0, 12).map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    aria-label={`Select image ${i + 1}`}
                    style={{
                      width: 68,
                      height: 44,
                      flexShrink: 0,
                      padding: 0,
                      border: i === imgIdx ? '2px solid #22d17b' : '2px solid rgba(255,255,255,0.12)',
                      borderRadius: 4,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      opacity: i === imgIdx ? 1 : 0.5,
                      background: '#050a18',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img
                      src={url}
                      alt={`${ship.name} thumbnail ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.opacity = '0.1';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Specifications */}
        <div>
          <Text
            size="xs"
            fw={700}
            c="dimmed"
            mb="sm"
            style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            Specifications
          </Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem 1.2rem' }}>
            {specs.map(([label, value]) => (
              <div key={label}>
                <Text size="xs" c="dimmed">
                  {label}
                </Text>
                <Text size="sm" fw={600} style={{ color: '#b8cfe0' }}>
                  {value}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lore */}
      {ship.description && (
        <div>
          <Text
            size="xs"
            fw={700}
            c="dimmed"
            mb="xs"
            style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            Lore &amp; Background
          </Text>
          <Text size="sm" style={{ lineHeight: 1.75, color: '#a8b8c8' }}>
            {ship.description}
          </Text>
        </div>
      )}

      {/* Videos */}
      {ship.videos?.length > 0 && (
        <div>
          <Text
            size="xs"
            fw={700}
            c="dimmed"
            mb="sm"
            style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            Official Videos
          </Text>
          <Group gap="xs">
            {ship.videos.map((v, i) => (
              <Button
                key={i}
                component="a"
                href={v.source_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="xs"
                color="cyan"
                leftSection={<IconExternalLink size={12} />}
              >
                {v.title || `Watch Video ${i + 1}`}
              </Button>
            ))}
          </Group>
        </div>
      )}
    </Stack>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── Column definitions ────────────────────────────────────────────────────────

const ALL_COLS = [
  { key: 'name',        label: 'Ship',         always: true  },
  { key: 'mfr',         label: 'Manufacturer', always: false },
  { key: 'role',        label: 'Role',         always: false },
  { key: 'size',        label: 'Size',         always: false },
  { key: 'crew',        label: 'Crew',         always: false },
  { key: 'cargo',       label: 'Cargo',        always: false },
  { key: 'scm',         label: 'SCM',          always: false },
  { key: 'pledgeUSD',   label: 'Pledge $',     always: false },
  { key: 'aUEC',        label: 'aUEC',         always: false },
  { key: 'status',      label: 'Status',       always: false },
  { key: 'expand',      label: '',             always: true  },
];

const DEFAULT_VISIBLE = new Set(['name', 'mfr', 'role', 'size', 'crew', 'cargo', 'scm', 'status', 'expand']);

export default function ShipDatabasePage() {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cacheSource, setCacheSource] = useState(null);

  const [search, setSearch] = useState('');
  const [mfrFilter, setMfrFilter] = useState(null);
  const [sizeFilter, setSizeFilter] = useState(null);
  const [roleFilter, setRoleFilter] = useState(null);

  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);
  const [colPickerOpen, setColPickerOpen] = useState(false);

  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  function handleSort(key) {
    if (key === 'expand') return;
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setSortDir('asc');
      return key;
    });
  }

  const [expandedId, setExpandedId] = useState(null);
  const [bgShip, setBgShip] = useState(null);
  const [bgArtwork, setBgArtwork] = useState(null);
  const [dossierShip, setDossierShip] = useState(null);
  const [page, setPage] = useState(1);

  // ── Load ships ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const cached = getCachedShips();
    if (cached?.ships) {
      setShips(cached.ships);
      setCacheSource('cache');
      setLoading(false);
    }

    fetchShips()
      .then((payload) => {
        setShips(payload.ships || []);
        setCacheSource(payload.cacheSource || 'network');
        setError(null);
        setLoading(false);

        try {
          const lastWarmAt = Number(localStorage.getItem(SHIP_IMAGE_WARM_KEY) || 0);
          const shouldWarm = Date.now() - lastWarmAt > SHIP_IMAGE_WARM_TTL_MS;

          if (shouldWarm) {
            warmShipsImageCache({ limit: 120, perShip: 1, concurrency: 6 })
              .then(() => {
                localStorage.setItem(SHIP_IMAGE_WARM_KEY, String(Date.now()));
              })
              .catch(() => {
                // Warm-up is best-effort and should not affect page usability.
              });
          }
        } catch {
          // Ignore localStorage edge cases.
        }
      })
      .catch((err) => {
        if (!cached?.ships) {
          setError(err.message || 'Failed to load ship database');
        }
        setLoading(false);
      });
  }, []);

  // ── Filter options ──────────────────────────────────────────────────────────
  const manufacturers = useMemo(() => {
    const seen = new Map();
    for (const s of ships) {
      if (s.manufacturer?.code && !seen.has(s.manufacturer.code)) {
        seen.set(s.manufacturer.code, s.manufacturer.name);
      }
    }
    return Array.from(seen.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [ships]);

  const sizes = useMemo(() => {
    const seen = new Set();
    for (const s of ships) {
      if (s.size) seen.add(s.size);
    }
    return [...seen]
      .sort()
      .map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
  }, [ships]);

  const roleOptions = useMemo(
    () => ROLES.map((r) => ({ value: r, label: r })),
    [],
  );

  // ── Client-side filtering ───────────────────────────────────────────────────
  const SIZE_ORDER = { vehicle: 1, snub: 2, small: 3, medium: 4, large: 5, capital: 6 };

  const filteredShips = useMemo(() => {
    let result = ships;
    if (mfrFilter) result = result.filter((s) => s.manufacturer?.code === mfrFilter);
    if (sizeFilter) result = result.filter((s) => s.size === sizeFilter);
    if (roleFilter) result = result.filter((s) => getRoles(s.focus).includes(roleFilter));
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(term) ||
          s.manufacturer?.name?.toLowerCase().includes(term) ||
          s.focus?.toLowerCase().includes(term),
      );
    }

    if (sortKey) {
      const dir = sortDir === 'asc' ? 1 : -1;
      result = [...result].sort((a, b) => {
        let av, bv;
        switch (sortKey) {
          case 'name':      av = a.name || ''; bv = b.name || ''; return dir * av.localeCompare(bv);
          case 'mfr':       av = a.manufacturer?.name || ''; bv = b.manufacturer?.name || ''; return dir * av.localeCompare(bv);
          case 'role':      av = a.focus || ''; bv = b.focus || ''; return dir * av.localeCompare(bv);
          case 'size':      av = SIZE_ORDER[a.size] ?? 99; bv = SIZE_ORDER[b.size] ?? 99; return dir * (av - bv);
          case 'crew':      av = a.crew?.max ?? -1; bv = b.crew?.max ?? -1; return dir * (av - bv);
          case 'cargo':     av = Number(a.cargo) || -1; bv = Number(b.cargo) || -1; return dir * (av - bv);
          case 'scm':       av = Number(a.speed?.scm) || -1; bv = Number(b.speed?.scm) || -1; return dir * (av - bv);
          case 'pledgeUSD': av = getShipPricing(a.name)?.pledgeUSD ?? -1; bv = getShipPricing(b.name)?.pledgeUSD ?? -1; return dir * (av - bv);
          case 'aUEC':      av = getShipPricing(a.name)?.aUEC ?? -1; bv = getShipPricing(b.name)?.aUEC ?? -1; return dir * (av - bv);
          case 'status':    av = a.productionStatus || ''; bv = b.productionStatus || ''; return dir * av.localeCompare(bv);
          default: return 0;
        }
      });
    }

    return result;
  }, [ships, mfrFilter, sizeFilter, roleFilter, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredShips.length / PAGE_SIZE));
  const pagedShips = filteredShips.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, mfrFilter, sizeFilter, roleFilter, sortKey, sortDir]);

  // ── Row interaction ─────────────────────────────────────────────────────────
  function handleRowClick(ship) {
    setBgShip(ship);
    setBgArtwork(getShipArtwork(ship.name));
    setExpandedId((prev) => (prev === ship.id ? null : ship.id));
  }

  // Only show background for ships with custom artwork (disable for regular ships)
  const bgImage = bgArtwork?.url || null;
  const bgOpacity = bgArtwork?.opacity ?? 1;
  const bgBlur = bgArtwork?.blur ?? 4;
  const bgBrightness = bgArtwork?.brightness ?? 0.18;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes shipBgFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes rowExpand {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ship-row { transition: background 0.15s ease; }
        .ship-row:hover { background: rgba(34, 209, 123, 0.05) !important; }
        .ship-row.selected { background: rgba(34, 209, 123, 0.09) !important; }
      `}</style>

      {/* Background — ship image, blurred + dimmed, scrolls with content */}
      {bgImage && (
        <div
          key={bgShip.id}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '0',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            filter: `blur(${bgBlur}px) brightness(${bgBrightness})`,
            opacity: bgOpacity,
            animation: 'shipBgFadeIn 0.7s ease',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Page content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Container size="xl" py="xl">
          <Stack gap="xl">
            {/* Header */}
            <div>
              <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '2rem', color: '#e8eaf0' }}>
                <DevTag tag="GT05" />Ship Database
              </h1>
              <Text c="dimmed" size="sm">
                Explore specifications, lore, and performance data for every vessel in the verse
              </Text>
            </div>

            {/* Filters */}
            <Stack gap="xs">
              <Group gap="sm" wrap="wrap">
                <TextInput
                  placeholder="Search ships, manufacturers, roles…"
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  leftSection={<IconSearch size={14} />}
                  rightSection={
                    search ? (
                      <ActionIcon size="sm" variant="transparent" onClick={() => setSearch('')} aria-label="Clear search">
                        <IconX size={12} />
                      </ActionIcon>
                    ) : null
                  }
                  style={{ flex: 1, minWidth: 200 }}
                  styles={{ input: { background: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,255,255,0.14)', color: '#e8eaf0' } }}
                />
                <Select
                  data={manufacturers}
                  value={mfrFilter}
                  onChange={setMfrFilter}
                  placeholder="All Manufacturers"
                  clearable
                  style={{ minWidth: 190 }}
                  styles={{ input: { background: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,255,255,0.14)', color: '#e8eaf0' } }}
                />
                <Select
                  data={sizes}
                  value={sizeFilter}
                  onChange={setSizeFilter}
                  placeholder="All Sizes"
                  clearable
                  style={{ minWidth: 130 }}
                  styles={{ input: { background: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,255,255,0.14)', color: '#e8eaf0' } }}
                />
                <Select
                  data={roleOptions}
                  value={roleFilter}
                  onChange={setRoleFilter}
                  placeholder="All Roles"
                  clearable
                  style={{ minWidth: 190 }}
                  styles={{ input: { background: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,255,255,0.14)', color: '#e8eaf0' } }}
                />
                <Tooltip label="Show/hide columns" position="bottom">
                  <ActionIcon
                    size="lg"
                    variant={colPickerOpen ? 'filled' : 'subtle'}
                    color="cyan"
                    onClick={() => setColPickerOpen((v) => !v)}
                    aria-label="Toggle column picker"
                  >
                    <IconLayoutColumns size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>

              {/* Column visibility toggles */}
              {colPickerOpen && (
                <div
                  style={{
                    background: 'rgba(0,10,30,0.85)',
                    border: '1px solid rgba(0,217,255,0.18)',
                    borderRadius: 6,
                    padding: '10px 16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px 24px',
                    alignItems: 'center',
                  }}
                >
                  <Text size="xs" c="dimmed" fw={700} style={{ letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: 70 }}>
                    Columns
                  </Text>
                  {ALL_COLS.filter((c) => !c.always).map((col) => (
                    <Checkbox
                      key={col.key}
                      label={col.label}
                      checked={visibleCols.has(col.key)}
                      onChange={(e) => {
                        setVisibleCols((prev) => {
                          const next = new Set(prev);
                          if (e.currentTarget.checked) next.add(col.key);
                          else next.delete(col.key);
                          return next;
                        });
                      }}
                      size="xs"
                      color="cyan"
                      styles={{
                        label: { color: '#9ab0c0', fontSize: '0.78rem', cursor: 'pointer' },
                        input: { cursor: 'pointer', background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(0,217,255,0.3)' },
                      }}
                    />
                  ))}
                </div>
              )}
            </Stack>

            {/* Status row */}
            <Group justify="space-between">
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  {loading && !ships.length ? 'Loading manifest…' : `${filteredShips.length.toLocaleString()} ships`}
                </Text>
                {cacheSource === 'cache' && (
                  <Badge size="xs" color="orange" variant="outline">Cached</Badge>
                )}
              </Group>
              {bgShip && (
                <Text size="xs" c="dimmed">
                  Selected: <span style={{ color: '#22d17b', fontWeight: 600 }}>{bgShip.name}</span>
                </Text>
              )}
            </Group>

            {/* Error */}
            {error && (
              <Alert icon={<IconAlertTriangle size={16} />} color="red" title="Failed to load ship database">
                {error} — check that the backend server is running.
              </Alert>
            )}

            {/* Loading */}
            {loading && !ships.length && (
              <Group justify="center" py="xl">
                <Loader size="sm" color="cyan" />
                <Text c="dimmed" size="sm">Retrieving ship manifest from RSI…</Text>
              </Group>
            )}

            {/* Table */}
            {ships.length > 0 && (
              <div
                style={{
                  background: 'rgba(2, 8, 22, 0.78)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(34,209,123,0.07)', borderBottom: '1px solid rgba(34,209,123,0.18)' }}>
                        {ALL_COLS.filter((c) => c.always || visibleCols.has(c.key)).map((col) => {
                          const isRightAlign = col.key === 'cargo' || col.key === 'scm' || col.key === 'pledgeUSD' || col.key === 'aUEC';
                          const isSortable = col.key !== 'expand';
                          const isActive = sortKey === col.key;
                          return (
                            <th
                              key={col.key}
                              onClick={isSortable ? () => handleSort(col.key) : undefined}
                              style={{
                                padding: '10px 14px',
                                textAlign: isRightAlign ? 'right' : 'left',
                                color: isActive ? '#22d17b' : '#6a8898',
                                fontWeight: 700,
                                letterSpacing: '0.07em',
                                fontSize: '0.7rem',
                                whiteSpace: 'nowrap',
                                userSelect: 'none',
                                cursor: isSortable ? 'pointer' : 'default',
                                transition: 'color 0.15s ease',
                              }}
                            >
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                {col.label}
                                {isSortable && (
                                  <span style={{ opacity: isActive ? 1 : 0.25, fontSize: '0.7rem', lineHeight: 1 }}>
                                    {isActive ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                                  </span>
                                )}
                              </span>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>

                    <tbody>
                      {pagedShips.length === 0 ? (
                        <tr>
                          <td colSpan={ALL_COLS.filter((c) => c.always || visibleCols.has(c.key)).length} style={{ padding: '2.5rem', textAlign: 'center', color: '#3a5060' }}>
                            No ships match your filters
                          </td>
                        </tr>
                      ) : (
                        pagedShips.map((ship) => {
                          const isExpanded = expandedId === ship.id;
                          const isSelected = bgShip?.id === ship.id;
                          const pricing = getShipPricing(ship.name);
                          const activeCols = ALL_COLS.filter((c) => c.always || visibleCols.has(c.key));

                          return (
                            <Fragment key={ship.id}>
                              <tr
                                className={`ship-row${isSelected ? ' selected' : ''}`}
                                onClick={() => handleRowClick(ship)}
                                style={{
                                  cursor: 'pointer',
                                  borderBottom: isExpanded ? 'none' : '1px solid rgba(255,255,255,0.04)',
                                  borderLeft: isSelected ? '3px solid #22d17b' : '3px solid transparent',
                                }}
                              >
                                {activeCols.map((col) => {
                                  switch (col.key) {
                                    case 'name':
                                      return (
                                        <td key="name" style={{ padding: '10px 14px', color: '#e0eaf4', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                          {ship.name}
                                        </td>
                                      );
                                    case 'mfr':
                                      return (
                                        <td key="mfr" style={{ padding: '10px 14px', color: '#6a8898', whiteSpace: 'nowrap' }}>
                                          {ship.manufacturer?.code || '—'}
                                        </td>
                                      );
                                    case 'role':
                                      return (
                                        <td key="role" style={{ padding: '10px 14px', color: '#9ab0c0', whiteSpace: 'nowrap' }}>
                                          {ship.focus || '—'}
                                        </td>
                                      );
                                    case 'size':
                                      return (
                                        <td key="size" style={{ padding: '10px 14px', color: '#6a8898', textTransform: 'capitalize' }}>
                                          {ship.size || '—'}
                                        </td>
                                      );
                                    case 'crew':
                                      return (
                                        <td key="crew" style={{ padding: '10px 14px', color: '#6a8898', textAlign: 'center' }}>
                                          {fmtCrew(ship)}
                                        </td>
                                      );
                                    case 'cargo':
                                      return (
                                        <td key="cargo" style={{ padding: '10px 14px', color: '#6a8898', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                          {fmtCargo(ship.cargo)}
                                        </td>
                                      );
                                    case 'scm':
                                      return (
                                        <td key="scm" style={{ padding: '10px 14px', color: '#5bc0f8', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                          {fmtSpeed(ship.speed?.scm)}
                                        </td>
                                      );
                                    case 'pledgeUSD':
                                      return (
                                        <td key="pledgeUSD" style={{ padding: '10px 14px', color: '#22d17b', textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                                          {fmtPledgeUSD(pricing)}
                                        </td>
                                      );
                                    case 'aUEC':
                                      return (
                                        <td key="aUEC" style={{ padding: '10px 14px', color: '#ffb648', textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                                          {fmtAUEC(pricing)}
                                        </td>
                                      );
                                    case 'status':
                                      return (
                                        <td key="status" style={{ padding: '10px 14px' }}>
                                          {ship.productionStatus && (
                                            <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', color: STATUS_COLORS[ship.productionStatus] || '#6a8898' }}>
                                              {STATUS_LABELS[ship.productionStatus] || ship.productionStatus}
                                            </span>
                                          )}
                                        </td>
                                      );
                                    case 'expand':
                                      return (
                                        <td key="expand" style={{ padding: '10px 14px', textAlign: 'right', width: 28 }}>
                                          {isExpanded
                                            ? <IconChevronUp size={14} style={{ color: '#22d17b' }} />
                                            : <IconChevronDown size={14} style={{ color: '#3a5060' }} />}
                                        </td>
                                      );
                                    default:
                                      return null;
                                  }
                                })}
                              </tr>

                              {isExpanded && (
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', animation: 'rowExpand 0.2s ease' }}>
                                  <td colSpan={activeCols.length} style={{ padding: 0 }}>
                                    <div
                                      style={{
                                        padding: '1.25rem 1.5rem',
                                        background: 'rgba(34,209,123,0.04)',
                                        borderTop: '1px solid rgba(34,209,123,0.1)',
                                      }}
                                    >
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'start' }}>
                                        {/* Stats + excerpt */}
                                        <div>
                                          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                            {[
                                              ['Length', fmtDim(ship.dimensions?.length)],
                                              ['Beam', fmtDim(ship.dimensions?.beam)],
                                              ['Height', fmtDim(ship.dimensions?.height)],
                                              ['Mass', ship.mass ? `${fmtNum(ship.mass)} kg` : '—'],
                                              ['Max Speed', fmtSpeed(ship.speed?.afterburner)],
                                            ].map(([label, value]) => (
                                              <div key={label}>
                                                <Text size="xs" c="dimmed">{label}</Text>
                                                <Text size="sm" fw={600} style={{ color: '#b8cfe0' }}>{value}</Text>
                                              </div>
                                            ))}
                                          </div>
                                          {ship.description && (
                                            <Text size="xs" c="dimmed" style={{ maxWidth: 660, lineHeight: 1.65 }}>
                                              {ship.description.length > 300
                                                ? `${ship.description.slice(0, 300)}…`
                                                : ship.description}
                                            </Text>
                                          )}
                                        </div>

                                        {/* Thumbnail + dossier button */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                                          {ship.media?.[0] && (
                                            <img
                                              src={ship.media[0]}
                                              alt={ship.name}
                                              style={{ width: 210, height: 120, objectFit: 'contain', borderRadius: 6, background: '#050a18', border: '1px solid rgba(255,255,255,0.07)' }}
                                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                          )}
                                          <Button
                                            size="xs"
                                            variant="outline"
                                            color="cyan"
                                            rightSection={<IconChevronRight size={12} />}
                                            onClick={(e) => { e.stopPropagation(); setDossierShip(ship); }}
                                          >
                                            VIEW FULL DOSSIER
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    style={{
                      padding: '0.875rem 1.5rem',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text size="xs" c="dimmed">
                      {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredShips.length)} of {filteredShips.length}
                    </Text>
                    <Pagination total={totalPages} value={page} onChange={setPage} size="sm" color="cyan" />
                  </div>
                )}
              </div>
            )}
          </Stack>
        </Container>
      </div>

      {/* Full Dossier Modal */}
      <Modal
        opened={!!dossierShip}
        onClose={() => setDossierShip(null)}
        size="xl"
        title={null}
        padding="xl"
        styles={{
          content: { background: 'rgba(4, 10, 26, 0.97)', border: '1px solid rgba(255,255,255,0.09)' },
          overlay: { backdropFilter: 'blur(6px)' },
        }}
      >
        {dossierShip && <ShipDossier ship={dossierShip} />}
      </Modal>
    </>
  );
}
