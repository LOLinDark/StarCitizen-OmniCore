import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Select,
  Slider,
  Stack,
  Switch,
  Text,
  Title,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import DevTag from '../components/DevTag';

const MAP_SYSTEMS = [
  { id: 'n1', name: 'NODE-01', x: 12, y: 22, confidence: 0.94 },
  { id: 'n2', name: 'NODE-02', x: 30, y: 18, confidence: 0.88 },
  { id: 'n3', name: 'NODE-03', x: 48, y: 30, confidence: 0.86 },
  { id: 'n4', name: 'NODE-04', x: 28, y: 44, confidence: 0.92 },
  { id: 'n5', name: 'NODE-05', x: 52, y: 56, confidence: 0.84 },
  { id: 'n6', name: 'NODE-06', x: 72, y: 42, confidence: 0.87 },
  { id: 'n7', name: 'NODE-07', x: 66, y: 20, confidence: 0.9 },
];

const JUMP_LINKS = [
  { from: 'n1', to: 'n2', confidence: 0.93 },
  { from: 'n2', to: 'n3', confidence: 0.9 },
  { from: 'n2', to: 'n4', confidence: 0.88 },
  { from: 'n3', to: 'n7', confidence: 0.9 },
  { from: 'n4', to: 'n5', confidence: 0.89 },
  { from: 'n5', to: 'n6', confidence: 0.87 },
  { from: 'n6', to: 'n7', confidence: 0.85 },
  { from: 'n3', to: 'n5', confidence: 0.84 },
  { from: 'n4', to: 'n6', confidence: 0.83 },
];

function toArray(maybeArray) {
  return Array.isArray(maybeArray) ? maybeArray : [];
}

function normalizeStarmapPayload(payload) {
  const rawSystems =
    toArray(payload?.systems) ||
    toArray(payload?.star_systems) ||
    toArray(payload?.data?.systems) ||
    toArray(payload?.data?.star_systems);

  if (!rawSystems.length) {
    return { systems: [], links: [] };
  }

  const parsed = rawSystems
    .map((item, index) => {
      const id = String(item?.code || item?.name || item?.id || `sys_${index}`).trim();
      const name = String(item?.name || item?.code || id).trim();

      const x = Number(item?.x ?? item?.position_x ?? item?.position?.x ?? item?.coord_x ?? 0);
      const y = Number(item?.y ?? item?.position_y ?? item?.position?.y ?? item?.coord_y ?? 0);

      return {
        id: id.toLowerCase(),
        name,
        rawX: Number.isFinite(x) ? x : 0,
        rawY: Number.isFinite(y) ? y : 0,
        confidence: 0.92,
      };
    })
    .filter((s) => s.id && s.name);

  const xs = parsed.map((s) => s.rawX);
  const ys = parsed.map((s) => s.rawY);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const dx = maxX - minX || 1;
  const dy = maxY - minY || 1;

  const systems = parsed.map((s) => ({
    id: s.id,
    name: s.name,
    x: 8 + (((s.rawX - minX) / dx) * 84),
    y: 8 + (((s.rawY - minY) / dy) * 54),
    confidence: s.confidence,
  }));

  const idSet = new Set(systems.map((s) => s.id));
  const rawLinks =
    toArray(payload?.tunnels) ||
    toArray(payload?.jump_points) ||
    toArray(payload?.data?.tunnels) ||
    toArray(payload?.data?.jump_points);

  const links = rawLinks
    .map((l) => {
      const from = String(
        l?.from_system || l?.from_system_code || l?.from_code || l?.from || l?.system_from || ''
      ).toLowerCase();
      const to = String(
        l?.to_system || l?.to_system_code || l?.to_code || l?.to || l?.system_to || ''
      ).toLowerCase();
      return { from, to, confidence: 0.9 };
    })
    .filter((l) => l.from && l.to && l.from !== l.to && idSet.has(l.from) && idSet.has(l.to));

  return { systems, links };
}

function buildAdjacency(nodes, edges) {
  const adjacency = new Map(nodes.map((n) => [n.id, []]));
  edges.forEach((e) => {
    adjacency.get(e.from).push(e.to);
    adjacency.get(e.to).push(e.from);
  });
  return adjacency;
}

function getShortestPath(start, end, adjacency) {
  if (!start || !end) return [];
  if (start === end) return [start];

  const queue = [start];
  const prev = new Map([[start, null]]);

  while (queue.length > 0) {
    const cur = queue.shift();
    const neighbors = adjacency.get(cur) || [];
    for (const next of neighbors) {
      if (prev.has(next)) continue;
      prev.set(next, cur);
      if (next === end) {
        const path = [];
        let step = end;
        while (step) {
          path.unshift(step);
          step = prev.get(step);
        }
        return path;
      }
      queue.push(next);
    }
  }

  return [];
}

function computeBetweenness(nodes, adjacency) {
  const score = Object.fromEntries(nodes.map((n) => [n.id, 0]));
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const path = getShortestPath(nodes[i].id, nodes[j].id, adjacency);
      if (path.length <= 2) continue;
      path.slice(1, -1).forEach((id) => {
        score[id] += 1;
      });
    }
  }
  const maxVal = Math.max(...Object.values(score), 1);
  return Object.fromEntries(Object.entries(score).map(([id, v]) => [id, v / maxVal]));
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

export default function DeveloperNavChartsLabPage() {
  const [blend, setBlend] = useState(45);
  const [systems, setSystems] = useState(MAP_SYSTEMS);
  const [links, setLinks] = useState(JUMP_LINKS);
  const [origin, setOrigin] = useState('n1');
  const [destination, setDestination] = useState('n6');
  const [briefingMode, setBriefingMode] = useState(false);
  const [fogEnabled, setFogEnabled] = useState(true);
  const [sourceMeta, setSourceMeta] = useState({
    source: 'synthetic-fallback',
    fetchedAt: null,
    cacheSource: 'local',
  });
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadStarmap() {
      try {
        const response = await fetch('/api/starmap/bootup');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        const normalized = normalizeStarmapPayload(payload);

        if (!isMounted) return;

        if (normalized.systems.length >= 2 && normalized.links.length >= 1) {
          setSystems(normalized.systems);
          setLinks(normalized.links);
          setOrigin(normalized.systems[0].id);
          setDestination(normalized.systems[Math.min(1, normalized.systems.length - 1)].id);
          setSourceMeta({
            source: payload?._meta?.source || 'rsi-starmap',
            fetchedAt: payload?._meta?.fetchedAt || Date.now(),
            cacheSource: payload?._meta?.cacheSource || 'network',
          });
        } else {
          setDataError('RSI starmap payload was incomplete. Using fallback topology for UI testing.');
        }
      } catch (_error) {
        if (!isMounted) return;
        setDataError('Unable to reach /api/starmap/bootup. Using fallback topology for UI testing.');
      }
    }

    loadStarmap();
    return () => {
      isMounted = false;
    };
  }, []);

  const systemMap = useMemo(
    () => new Map(systems.map((node) => [node.id, node])),
    [systems]
  );

  const adjacency = useMemo(() => buildAdjacency(systems, links), [systems, links]);

  const routePath = useMemo(
    () => getShortestPath(origin, destination, adjacency),
    [origin, destination, adjacency]
  );

  const betweenness = useMemo(() => computeBetweenness(systems, adjacency), [systems, adjacency]);

  const systemSignals = useMemo(() => {
    const degreeMax = Math.max(...systems.map((n) => adjacency.get(n.id).length), 1);
    return Object.fromEntries(
      systems.map((n) => {
        const degreeNorm = adjacency.get(n.id).length / degreeMax;
        const choke = betweenness[n.id] || 0;
        const risk = clamp01((degreeNorm * 0.45) + (choke * 0.55));
        return [
          n.id,
          {
            traffic: degreeNorm,
            choke,
            risk,
            confidence: n.confidence,
          },
        ];
      })
    );
  }, [systems, adjacency, betweenness]);

  const routeSummary = useMemo(() => {
    if (routePath.length < 2) {
      return {
        segments: [],
        totalDistance: 0,
        avgRisk: 0,
        chokeNodes: [],
      };
    }

    const segments = [];
    let totalDistance = 0;
    let riskSum = 0;
    for (let i = 0; i < routePath.length - 1; i += 1) {
      const from = systemMap.get(routePath[i]);
      const to = systemMap.get(routePath[i + 1]);
      const d = distance(from, to);
      totalDistance += d;
      const segmentRisk = (systemSignals[from.id].risk + systemSignals[to.id].risk) / 2;
      riskSum += segmentRisk;
      segments.push({ from: from.name, to: to.name, distance: d, risk: segmentRisk });
    }

    const pathInner = routePath.slice(1, -1);
    const chokeNodes = pathInner
      .map((id) => ({ id, score: systemSignals[id].choke }))
      .filter((n) => n.score >= 0.35)
      .sort((a, b) => b.score - a.score)
      .map((n) => systemMap.get(n.id).name);

    return {
      segments,
      totalDistance,
      avgRisk: riskSum / segments.length,
      chokeNodes,
    };
  }, [routePath, systemMap, systemSignals]);

  const physicalAlpha = (100 - blend) / 100;
  const operationalAlpha = blend / 100;

  const routeEdges = new Set(
    routePath.slice(0, -1).map((id, i) => {
      const a = id;
      const b = routePath[i + 1];
      return [a, b].sort().join('::');
    })
  );

  const selectData = systems.map((n) => ({ value: n.id, label: n.name }));

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} style={{ marginBottom: 8 }}>
              <DevTag tag="DEV06" />
              Nav Charts Lab: Dual-Reality Map
            </Title>
            <Text c="dimmed">
              Dual-layer interaction mock. Physical topology and operational overlays are blended with a single slider.
            </Text>
          </div>
          <Badge color="yellow" variant="light">Prototype</Badge>
        </Group>

        <Card withBorder>
          <Stack gap="xs">
            <Text fw={700}>Data integrity note</Text>
            <Text size="sm" c="dimmed">
              Physical layer is loaded from RSI starmap when available. Operational overlays remain <strong>derived</strong> from map topology and do not claim live piracy,
              mission, or conflict telemetry.
            </Text>
            {dataError && <Text size="sm" c="yellow">{dataError}</Text>}
          </Stack>
        </Card>

        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder padding="md" radius="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={700}>Dual-Reality Blend</Text>
                  <Text size="sm" c="dimmed">
                    {100 - blend}% Physical / {blend}% Operational
                  </Text>
                </Group>

                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={blend}
                  onChange={setBlend}
                  color="cyan"
                  marks={[
                    { value: 0, label: 'Physical' },
                    { value: 50, label: 'Balanced' },
                    { value: 100, label: 'Operational' },
                  ]}
                />

                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 10',
                    background: 'radial-gradient(circle at 20% 20%, rgba(0,217,255,0.12), rgba(3,8,17,0.96) 55%)',
                    border: '1px solid rgba(0,217,255,0.25)',
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  <svg viewBox="0 0 100 70" style={{ width: '100%', height: '100%' }}>
                    {links.map((link) => {
                      const a = systemMap.get(link.from);
                      const b = systemMap.get(link.to);
                      if (!a || !b) return null;
                      const routeKey = [link.from, link.to].sort().join('::');
                      const isRoute = routeEdges.has(routeKey);
                      return (
                        <line
                          key={`${link.from}-${link.to}`}
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          stroke={isRoute ? 'rgba(255, 179, 0, 0.95)' : 'rgba(0, 217, 255, 0.85)'}
                          strokeWidth={isRoute ? 1.5 : 1}
                          opacity={physicalAlpha * (0.5 + (link.confidence * 0.5))}
                        />
                      );
                    })}

                    {systems.map((node) => {
                      const signal = systemSignals[node.id];
                      const opRadius = 2 + (signal.risk * 5);
                      const fogOpacity = fogEnabled ? (1 - node.confidence) * 0.75 : 0;
                      return (
                        <g key={node.id}>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={opRadius}
                            fill={`rgba(255, 84, 84, ${0.2 + (0.45 * signal.risk)})`}
                            opacity={operationalAlpha}
                          />
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={2.1}
                            fill="rgba(0, 217, 255, 0.95)"
                            opacity={physicalAlpha}
                          />
                          {fogEnabled && (
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={7}
                              fill="rgba(180, 190, 210, 0.6)"
                              opacity={fogOpacity}
                            />
                          )}
                          <text x={node.x + 1.5} y={node.y - 1.8} fontSize="2.3" fill="rgba(210, 226, 248, 0.95)">
                            {node.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Physical layer: topology, links, route geometry</Text>
                  <Text size="sm" c="dimmed">Operational layer: DERIVED traffic/chokepoint/risk overlays</Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Card withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={700}>Command Briefing Mode</Text>
                    <Switch checked={briefingMode} onChange={(e) => setBriefingMode(e.currentTarget.checked)} />
                  </Group>

                  <Select label="Origin" value={origin} onChange={(v) => setOrigin(v)} data={selectData} />
                  <Select label="Destination" value={destination} onChange={(v) => setDestination(v)} data={selectData} />

                  <Switch
                    label="Confidence fog"
                    checked={fogEnabled}
                    onChange={(e) => setFogEnabled(e.currentTarget.checked)}
                  />

                  <Button variant="light" color="cyan" onClick={() => setBriefingMode(true)}>
                    Brief Me
                  </Button>
                </Stack>
              </Card>

              <Card withBorder>
                <Stack gap="xs">
                  <Text fw={700}>Route Summary</Text>
                  {routeSummary.segments.length === 0 && (
                    <Text size="sm" c="dimmed">No route found for selected systems.</Text>
                  )}
                  {routeSummary.segments.length > 0 && (
                    <>
                      <Text size="sm">Jumps: {routeSummary.segments.length}</Text>
                      <Text size="sm">Approx distance: {routeSummary.totalDistance.toFixed(1)} map units</Text>
                      <Text size="sm">Derived risk index: {(routeSummary.avgRisk * 100).toFixed(0)} / 100</Text>
                      <Text size="sm">
                        Chokepoints: {routeSummary.chokeNodes.length ? routeSummary.chokeNodes.join(', ') : 'None flagged'}
                      </Text>
                    </>
                  )}
                </Stack>
              </Card>

              <Card withBorder>
                <Stack gap="xs">
                  <Text fw={700}>Source & Confidence</Text>
                  <Text size="sm">Source: {sourceMeta.source}</Text>
                  <Text size="sm">Delivery: {sourceMeta.cacheSource}</Text>
                  <Text size="sm">
                    Last update: {sourceMeta.fetchedAt ? new Date(sourceMeta.fetchedAt).toLocaleString() : 'Unknown'}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Confidence Fog is based on confidence scoring. Low confidence renders hazier to signal uncertainty.
                  </Text>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>

        {briefingMode && routeSummary.segments.length > 0 && (
          <Card withBorder style={{ background: 'rgba(8, 16, 27, 0.86)' }}>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={700}>Mission Board: Command Briefing</Text>
                <Badge color="cyan" variant="outline">Mock Contract Template</Badge>
              </Group>

              <Text size="sm" c="dimmed">
                Use this board format now; swap to mission/contract API fields once they are available.
              </Text>

              {routeSummary.segments.map((segment, idx) => (
                <Group key={`${segment.from}-${segment.to}`} justify="space-between">
                  <Text size="sm">SEG-{String(idx + 1).padStart(2, '0')} {segment.from} to {segment.to}</Text>
                  <Text size="sm" c="dimmed">
                    {segment.distance.toFixed(1)}u | risk {(segment.risk * 100).toFixed(0)}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
