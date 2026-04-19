import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertTriangle, IconMapPin, IconRoute, IconX } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import DevTag from "../components/DevTag";

// ─── Fallback topology (real SC systems, used when API is unreachable) ─────────
const FALLBACK_SYSTEMS = [
  { id: "stanton", name: "Stanton", rawX: 11.36, rawY: -2.96, color: "#48bbd4", affiliationName: "UEE",       affiliationCode: "uee", danger: 0, population: 9.3,  economy: 3.2, status: "P", description: "The only system fully owned by mega-corporations, Stanton was sold off planet by planet to Crusader Industries, ArcCorp, microTech, and Hurston Dynamics." },
  { id: "pyro",    name: "Pyro",    rawX:  4.72, rawY: -0.96, color: "#f6851f", affiliationName: "Unclaimed", affiliationCode: "unc", danger: 9, population: 4.1,  economy: 1.8, status: "P", description: "A lawless system orbiting a volatile flare star. Pyro is home to Ruin Station and the notorious Stanton-Pyro jump lane." },
  { id: "nyx",     name: "Nyx",     rawX:  2.89, rawY: -5.01, color: "#f6851f", affiliationName: "Unclaimed", affiliationCode: "unc", danger: 6, population: 5.8,  economy: 1.2, status: "P", description: "An unclaimed system at the edge of UEE space, home to Delamar and the city of Levski." },
  { id: "terra",   name: "Terra",   rawX: 27.33, rawY:  9.62, color: "#48bbd4", affiliationName: "UEE",       affiliationCode: "uee", danger: 0, population: 9.8,  economy: 4.5, status: "P", description: "The second most powerful system in the UEE and the political rival of Sol. Terra Prime is considered one of the most beautiful cities in the galaxy." },
  { id: "sol",     name: "Sol",     rawX:  0.00, rawY:  0.00, color: "#48bbd4", affiliationName: "UEE",       affiliationCode: "uee", danger: 0, population: 10.0, economy: 5.0, status: "P", description: "The birthplace of humanity and capital of the UEE. Home to Earth, Luna, and the original seat of human government." },
  { id: "odin",    name: "Odin",    rawX:-10.55, rawY: 14.20, color: "#48bbd4", affiliationName: "UEE",       affiliationCode: "uee", danger: 2, population: 6.1,  economy: 2.3, status: "P", description: "A frontier system with a strong military history. Odin II hosts a significant UEE fleet presence." },
  { id: "magnus",  name: "Magnus",  rawX:  5.32, rawY:  8.43, color: "#48bbd4", affiliationName: "UEE",       affiliationCode: "uee", danger: 3, population: 7.2,  economy: 2.8, status: "P", description: "An industrious system close to the UEE core. Magnus II is a major shipbuilding world." },
  { id: "croshaw", name: "Croshaw", rawX:  3.11, rawY:  4.78, color: "#48bbd4", affiliationName: "UEE",       affiliationCode: "uee", danger: 1, population: 8.4,  economy: 3.1, status: "P", description: "The first extra-solar system discovered by humanity. Croshaw serves as a critical transit hub between Sol and the wider UEE." },
  { id: "banshee", name: "Banshee", rawX: -8.22, rawY: -9.31, color: "#f6851f", affiliationName: "Unclaimed", affiliationCode: "unc", danger: 7, population: 2.1,  economy: 0.8, status: "P", description: "A dying red dwarf system with limited resources. Banshee is frequented by miners and outlaws operating outside UEE law." },
  { id: "davien",  name: "Davien",  rawX: 14.11, rawY: -7.52, color: "#48bbd4", affiliationName: "UEE",       affiliationCode: "uee", danger: 2, population: 6.8,  economy: 2.6, status: "P", description: "An older UEE system with significant cultural heritage. Davien II (Celin) is a popular artist retreat." },
];

const FALLBACK_LINKS = [
  { from: "stanton", to: "pyro",    size: "L", confidence: 0.98 },
  { from: "stanton", to: "nyx",     size: "L", confidence: 0.97 },
  { from: "stanton", to: "magnus",  size: "L", confidence: 0.95 },
  { from: "stanton", to: "croshaw", size: "L", confidence: 0.96 },
  { from: "sol",     to: "croshaw", size: "L", confidence: 0.99 },
  { from: "sol",     to: "terra",   size: "L", confidence: 0.98 },
  { from: "croshaw", to: "magnus",  size: "M", confidence: 0.92 },
  { from: "magnus",  to: "davien",  size: "M", confidence: 0.90 },
  { from: "terra",   to: "davien",  size: "L", confidence: 0.93 },
  { from: "nyx",     to: "banshee", size: "S", confidence: 0.88 },
  { from: "banshee", to: "odin",    size: "M", confidence: 0.85 },
  { from: "odin",    to: "terra",   size: "L", confidence: 0.91 },
  { from: "pyro",    to: "banshee", size: "S", confidence: 0.82 },
];

const TUNNEL_SIZE_COLOR = { S: "#ffcc44", M: "#88ddff", L: "#44ffaa", XL: "#ff88ff" };

// ─── Normalization ─────────────────────────────────────────────────────────────
function toArr(v) { return Array.isArray(v) ? v : []; }

function normalizeSystems(rawSystems) {
  const parsed = rawSystems.map((s) => {
    const id   = String(s.code || s.id || "").toLowerCase().trim();
    const name = String(s.name || s.code || id).trim();
    if (!id || !name) return null;
    const aff     = Array.isArray(s.affiliation) && s.affiliation[0] ? s.affiliation[0] : {};
    const affName = aff.name || "Unknown";
    const affCode = String(aff.code || "unk").toLowerCase();
    const color   = aff.color || (affCode === "uee" ? "#48bbd4" : "#f6851f");
    return {
      id, name, color,
      affiliationName: affName,
      affiliationCode: affCode,
      rawX: Number.isFinite(Number(s.position_x)) ? Number(s.position_x) : 0,
      rawY: Number.isFinite(Number(s.position_y)) ? Number(s.position_y) : 0,
      danger:      Number(s.aggregated_danger     || 0),
      population:  Number(s.aggregated_population || 0),
      economy:     Number(s.aggregated_economy    || 0),
      description: s.description || "",
      status:      s.status || "P",
    };
  }).filter(Boolean);

  if (!parsed.length) return [];

  const xs = parsed.map((s) => s.rawX);
  const ys = parsed.map((s) => s.rawY);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const dx = maxX - minX || 1;
  const dy = maxY - minY || 1;

  return parsed.map((s) => ({
    ...s,
    x: 5 + ((s.rawX - minX) / dx) * 90,
    y: 5 + ((s.rawY - minY) / dy) * 57,
    confidence: Math.max(0.2, 1 - Math.min(0.8, s.danger / 10)),
  }));
}

function normalizeFallback(raw) {
  const xs = raw.map((s) => s.rawX), ys = raw.map((s) => s.rawY);
  const minX = Math.min(...xs), dx = Math.max(...xs) - minX || 1;
  const minY = Math.min(...ys), dy = Math.max(...ys) - minY || 1;
  return raw.map((s) => ({
    ...s,
    x: 5 + ((s.rawX - minX) / dx) * 90,
    y: 5 + ((s.rawY - minY) / dy) * 57,
    confidence: Math.max(0.3, 1 - s.danger / 10),
  }));
}

function normalizePayload(payload) {
  const rawSystems =
    toArr(payload?.data?.systems).length ? toArr(payload.data.systems) :
    toArr(payload?.systems).length       ? toArr(payload.systems) : [];
  if (rawSystems.length < 2) return null;

  const systems = normalizeSystems(rawSystems);
  if (systems.length < 2) return null;

  const idToCode = new Map();
  rawSystems.forEach((s) => idToCode.set(s.id, String(s.code || s.id || "").toLowerCase().trim()));

  const idSet = new Set(systems.map((s) => s.id));
  const rawTunnels =
    toArr(payload?.data?.tunnels).length ? toArr(payload.data.tunnels) :
    toArr(payload?.tunnels).length       ? toArr(payload.tunnels) : [];

  const links = rawTunnels.map((t) => {
    const from = idToCode.get(t.entry?.star_system_id);
    const to   = idToCode.get(t.exit?.star_system_id);
    if (!from || !to || from === to || !idSet.has(from) || !idSet.has(to)) return null;
    return { from, to, size: t.size || "L", confidence: 0.9 };
  }).filter(Boolean);

  return { systems, links };
}

// ─── Graph algorithms ──────────────────────────────────────────────────────────
function buildAdjacency(nodes, edges) {
  const adj = new Map(nodes.map((n) => [n.id, []]));
  edges.forEach((e) => {
    if (adj.has(e.from)) adj.get(e.from).push(e.to);
    if (adj.has(e.to))   adj.get(e.to).push(e.from);
  });
  return adj;
}

function bfsPath(start, end, adjacency) {
  if (!start || !end) return [];
  if (start === end) return [start];
  const queue = [start];
  const prev  = new Map([[start, null]]);
  while (queue.length) {
    const cur = queue.shift();
    for (const next of (adjacency.get(cur) || [])) {
      if (prev.has(next)) continue;
      prev.set(next, cur);
      if (next === end) {
        const path = [];
        let step = end;
        while (step !== null) { path.unshift(step); step = prev.get(step); }
        return path;
      }
      queue.push(next);
    }
  }
  return [];
}

function computeBetweenness(nodes, adjacency) {
  if (nodes.length > 60) {
    return Object.fromEntries(nodes.map((n) => [n.id, Math.min(1, (n.danger || 0) / 10)]));
  }
  const score = Object.fromEntries(nodes.map((n) => [n.id, 0]));
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const path = bfsPath(nodes[i].id, nodes[j].id, adjacency);
      if (path.length <= 2) continue;
      path.slice(1, -1).forEach((id) => { score[id] = (score[id] || 0) + 1; });
    }
  }
  const max = Math.max(...Object.values(score), 1);
  return Object.fromEntries(Object.entries(score).map(([id, v]) => [id, v / max]));
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LocationGuidePage() {
  const [systems,       setSystems]       = useState([]);
  const [links,         setLinks]         = useState([]);
  const [origin,        setOrigin]        = useState("");
  const [destination,   setDestination]   = useState("");
  const [selectedId,    setSelectedId]    = useState(null);
  const [fogEnabled,    setFogEnabled]    = useState(true);
  const [filterFaction, setFilterFaction] = useState("all");
  const [dataError,     setDataError]     = useState("");
  const [loading,       setLoading]       = useState(true);
  const [sourceMeta,    setSourceMeta]    = useState({ source: "fallback", cacheSource: "local", fetchedAt: null });

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/starmap/bootup");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const norm = normalizePayload(payload);
        if (!alive) return;
        if (norm) {
          setSystems(norm.systems);
          setLinks(norm.links);
          const stanton = norm.systems.find((s) => s.id === "stanton") || norm.systems[0];
          const pyro    = norm.systems.find((s) => s.id === "pyro")    || norm.systems[1] || norm.systems[0];
          setOrigin(stanton.id);
          setDestination(pyro.id !== stanton.id ? pyro.id : norm.systems[1]?.id || stanton.id);
          setSelectedId(stanton.id);
          setSourceMeta({ source: payload?._meta?.source || "rsi-starmap", cacheSource: payload?._meta?.cacheSource || "network", fetchedAt: payload?._meta?.fetchedAt || Date.now() });
        } else {
          throw new Error("Payload incomplete");
        }
      } catch (_err) {
        if (!alive) return;
        setDataError("Using offline fallback — RSI Starmap API unreachable or returned incomplete data.");
        const fb = normalizeFallback(FALLBACK_SYSTEMS);
        setSystems(fb);
        setLinks(FALLBACK_LINKS);
        setOrigin("stanton");
        setDestination("pyro");
        setSelectedId("stanton");
        setSourceMeta({ source: "offline-fallback", cacheSource: "local", fetchedAt: null });
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const factions = useMemo(() => {
    const seen = new Map();
    systems.forEach((s) => {
      if (!seen.has(s.affiliationCode)) seen.set(s.affiliationCode, { code: s.affiliationCode, name: s.affiliationName, color: s.color });
    });
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [systems]);

  const visibleSystems = useMemo(() =>
    filterFaction === "all" ? systems : systems.filter((s) => s.affiliationCode === filterFaction),
  [systems, filterFaction]);

  const visibleIds  = useMemo(() => new Set(visibleSystems.map((s) => s.id)), [visibleSystems]);
  const visibleLinks = useMemo(() => links.filter((l) => visibleIds.has(l.from) && visibleIds.has(l.to)), [links, visibleIds]);
  const systemMap   = useMemo(() => new Map(systems.map((s) => [s.id, s])), [systems]);
  const adjacency   = useMemo(() => buildAdjacency(systems, links), [systems, links]);
  const routePath   = useMemo(() => bfsPath(origin, destination, adjacency), [origin, destination, adjacency]);
  const betweenness = useMemo(() => computeBetweenness(systems, adjacency), [systems, adjacency]);

  const routeEdgeSet = useMemo(() => new Set(
    routePath.slice(0, -1).map((id, i) => [id, routePath[i + 1]].sort().join("::"))
  ), [routePath]);

  const routeSummary = useMemo(() => {
    if (routePath.length < 2) return { segments: [], jumps: 0, avgDanger: 0 };
    const segments = routePath.slice(0, -1).map((fromId, i) => {
      const toId = routePath[i + 1];
      const from = systemMap.get(fromId);
      const to   = systemMap.get(toId);
      const link = links.find((l) => (l.from === fromId && l.to === toId) || (l.from === toId && l.to === fromId));
      return { fromName: from?.name || fromId, toName: to?.name || toId, danger: ((from?.danger || 0) + (to?.danger || 0)) / 2, size: link?.size || "?" };
    });
    return { segments, jumps: segments.length, avgDanger: segments.reduce((a, s) => a + s.danger, 0) / (segments.length || 1) };
  }, [routePath, systemMap, links]);

  const selected   = selectedId ? systemMap.get(selectedId) : null;
  const selectData = useMemo(() =>
    systems.map((s) => ({ value: s.id, label: `${s.name} (${s.affiliationName})` })).sort((a, b) => a.label.localeCompare(b.label)),
  [systems]);

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">

        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Title order={1} style={{ marginBottom: 6 }}>
              <DevTag tag="GT04" />Nav Charts
            </Title>
            <Text c="dimmed" size="sm">
              {systems.length} charted systems · {links.length} jump connections
              {sourceMeta.fetchedAt ? <> · updated {new Date(sourceMeta.fetchedAt).toLocaleTimeString()}</> : null}
            </Text>
          </div>
          <Group gap="xs">
            <Badge color={sourceMeta.source === "offline-fallback" ? "yellow" : "cyan"} variant="outline">{sourceMeta.source}</Badge>
            <Badge color={sourceMeta.cacheSource === "network" ? "teal" : "gray"} variant="light">{sourceMeta.cacheSource}</Badge>
          </Group>
        </Group>

        {dataError && (
          <Card withBorder style={{ borderColor: "rgba(255,200,0,0.4)", background: "rgba(255,200,0,0.04)" }} padding="sm">
            <Group gap="xs">
              <IconAlertTriangle size={16} color="#ffc800" />
              <Text size="sm" c="yellow">{dataError}</Text>
            </Group>
          </Card>
        )}

        {factions.length > 1 && (
          <Group gap="xs" wrap="wrap">
            <Button size="xs" variant={filterFaction === "all" ? "filled" : "outline"} color="cyan" onClick={() => setFilterFaction("all")}>All systems</Button>
            {factions.map((f) => (
              <Button key={f.code} size="xs" variant={filterFaction === f.code ? "filled" : "outline"}
                style={{ borderColor: f.color, color: filterFaction === f.code ? "#000" : f.color, background: filterFaction === f.code ? f.color : "transparent" }}
                onClick={() => setFilterFaction(f.code)}
              >{f.name}</Button>
            ))}
          </Group>
        )}

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: selected ? 7 : 9 }}>
            <Card withBorder padding="xs" radius="md" style={{ background: "#020a12" }}>
              {loading ? (
                <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Text c="cyan" size="sm">Loading starmap data...</Text>
                </div>
              ) : (
                <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "radial-gradient(ellipse at 30% 40%, rgba(0,180,255,0.06) 0%, rgba(2,6,15,0.98) 65%)", borderRadius: 8, overflow: "hidden", cursor: "crosshair" }}>
                  <svg viewBox="0 0 100 62" style={{ width: "100%", height: "100%" }} aria-label="Star system navigation map">
                    <defs>
                      <filter id="nc-glow" x="-60%" y="-60%" width="220%" height="220%">
                        <feGaussianBlur stdDeviation="1.0" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                      <filter id="nc-glow-sel" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="2.2" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>
                    {[10,20,30,40,50,60,70,80,90].map((x) => <line key={`gx${x}`} x1={x} y1="0" x2={x} y2="62" stroke="rgba(0,180,255,0.04)" strokeWidth="0.3" />)}
                    {[10,20,30,40,50].map((y) => <line key={`gy${y}`} x1="0" y1={y} x2="100" y2={y} stroke="rgba(0,180,255,0.04)" strokeWidth="0.3" />)}

                    {visibleLinks.map((link) => {
                      const a = systemMap.get(link.from), b = systemMap.get(link.to);
                      if (!a || !b) return null;
                      const edgeKey = [link.from, link.to].sort().join("::");
                      const isRoute = routeEdgeSet.has(edgeKey);
                      return (
                        <line key={edgeKey} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                          stroke={isRoute ? "#ffb700" : "rgba(0,200,255,0.28)"}
                          strokeWidth={isRoute ? 1.2 : 0.4}
                          strokeDasharray={link.size === "S" ? "1 1.5" : undefined}
                          opacity={link.confidence}
                        />
                      );
                    })}

                    {visibleSystems.map((node) => {
                      const isSelected = node.id === selectedId;
                      const isOnRoute  = routePath.includes(node.id);
                      const fogOpacity = fogEnabled ? Math.max(0, 1 - node.confidence) * 0.65 : 0;
                      const nodeColor  = node.color || "#48bbd4";
                      const r = isSelected ? 3.2 : 2.0;
                      return (
                        <g key={node.id} style={{ cursor: "pointer" }} onClick={() => setSelectedId(node.id)} role="button" aria-label={node.name}>
                          {isSelected && <circle cx={node.x} cy={node.y} r={6} fill="none" stroke={nodeColor} strokeWidth="0.5" opacity="0.45" filter="url(#nc-glow-sel)" />}
                          {isOnRoute && !isSelected && <circle cx={node.x} cy={node.y} r={3.5} fill="none" stroke="#ffb700" strokeWidth="0.45" opacity="0.65" />}
                          {fogOpacity > 0.05 && <circle cx={node.x} cy={node.y} r={6} fill={`rgba(5,12,28,${fogOpacity})`} />}
                          <circle cx={node.x} cy={node.y} r={r} fill={nodeColor} opacity={0.88} filter={isSelected ? "url(#nc-glow-sel)" : "url(#nc-glow)"} />
                          {(betweenness[node.id] || 0) > 0.4 && !isSelected && <circle cx={node.x} cy={node.y} r={r + 1.2} fill="none" stroke="rgba(255,100,100,0.45)" strokeWidth="0.3" />}
                          <text x={node.x + 2.8} y={node.y + 0.9} fontSize={isSelected ? "2.8" : "2.1"} fill={isSelected ? "#ffffff" : "rgba(195,215,240,0.85)"} style={{ pointerEvents: "none", fontFamily: "monospace" }}>{node.name}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
              <Group justify="space-between" px="xs" pt="xs" pb={2} wrap="wrap" gap="xs">
                <Switch size="xs" label="Confidence fog" checked={fogEnabled} onChange={(e) => setFogEnabled(e.currentTarget.checked)} color="cyan" />
                <Group gap={8}>
                  {Object.entries(TUNNEL_SIZE_COLOR).map(([sz, col]) => (
                    <Group key={sz} gap={3}>
                      <div style={{ width: 14, height: 2, background: col, borderRadius: 1 }} />
                      <Text size="xs" c="dimmed">{sz}</Text>
                    </Group>
                  ))}
                  <Group gap={3}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1px solid rgba(255,100,100,0.5)" }} />
                    <Text size="xs" c="dimmed">Chokepoint</Text>
                  </Group>
                </Group>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: selected ? 5 : 3 }}>
            <Stack gap="md">
              <Card withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconRoute size={15} color="#00d9ff" />
                      <Text fw={700} size="sm">Route Planner</Text>
                    </Group>
                    {routeSummary.jumps > 0 && <Badge color="cyan" variant="light">{routeSummary.jumps} jump{routeSummary.jumps !== 1 ? "s" : ""}</Badge>}
                  </Group>
                  <Select size="xs" label="Origin"      value={origin}      onChange={(v) => { if (v) setOrigin(v); }}      data={selectData} searchable />
                  <Select size="xs" label="Destination" value={destination} onChange={(v) => { if (v) setDestination(v); }} data={selectData} searchable />

                  {routeSummary.segments.length > 0 ? (
                    <ScrollArea.Autosize mah={180}>
                      <Stack gap={3}>
                        {routeSummary.segments.map((seg, i) => (
                          <Group key={i} justify="space-between" wrap="nowrap">
                            <Text size="xs" style={{ fontFamily: "monospace" }} lineClamp={1}>{String(i + 1).padStart(2, "0")} {seg.fromName} → {seg.toName}</Text>
                            <Group gap={3} wrap="nowrap">
                              <Badge size="xs" style={{ background: TUNNEL_SIZE_COLOR[seg.size] || "#888", color: "#000", minWidth: 20, textAlign: "center" }}>{seg.size}</Badge>
                              {seg.danger > 5 && <Badge size="xs" color="red" variant="light">!</Badge>}
                            </Group>
                          </Group>
                        ))}
                      </Stack>
                    </ScrollArea.Autosize>
                  ) : (
                    <Text size="xs" c="dimmed">
                      {origin && destination && origin !== destination ? "No jump route found between selected systems." : "Select origin and destination to plot a route."}
                    </Text>
                  )}
                  {routeSummary.avgDanger > 5 && (
                    <Group gap="xs">
                      <IconAlertTriangle size={13} color="#ff4444" />
                      <Text size="xs" c="red">Route passes through high-danger systems.</Text>
                    </Group>
                  )}
                </Stack>
              </Card>

              {selected ? (
                <Card withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between" align="flex-start">
                      <Group gap="xs" align="flex-start">
                        <IconMapPin size={15} color={selected.color} style={{ marginTop: 2 }} />
                        <div>
                          <Text fw={700} lh={1.2}>{selected.name}</Text>
                          <Text size="xs" c="dimmed" style={{ fontFamily: "monospace" }}>{selected.id.toUpperCase()}</Text>
                        </div>
                      </Group>
                      <Button size="xs" variant="subtle" color="gray" px={4} onClick={() => setSelectedId(null)} leftSection={<IconX size={12} />}>Close</Button>
                    </Group>

                    <Group gap="xs" wrap="wrap">
                      <Badge variant="outline" style={{ borderColor: selected.color, color: selected.color }}>{selected.affiliationName}</Badge>
                      <Badge variant="light" color={selected.status === "P" ? "teal" : "gray"}>{selected.status === "P" ? "Playable" : "Inaccessible"}</Badge>
                      {selected.danger >= 7 && <Badge color="red" variant="light">High Danger</Badge>}
                    </Group>

                    <Stack gap={6}>
                      {[
                        { label: "Population", value: selected.population, max: 10, color: "#48bbd4" },
                        { label: "Economy",    value: selected.economy,    max: 6,  color: "#44ffaa" },
                        { label: "Danger",     value: selected.danger,     max: 10, color: selected.danger > 6 ? "#ff4444" : "#ffb700" },
                      ].map(({ label, value, max, color }) => (
                        <div key={label}>
                          <Group justify="space-between" mb={3}><Text size="xs" c="dimmed">{label}</Text><Text size="xs">{value.toFixed(1)}/{max}</Text></Group>
                          <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                            <div style={{ height: "100%", width: `${Math.min(100, (value / max) * 100)}%`, background: color, borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                    </Stack>

                    {selected.description && (
                      <ScrollArea.Autosize mah={110}>
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1.65 }}>{selected.description}</Text>
                      </ScrollArea.Autosize>
                    )}

                    <Group gap="xs">
                      <Button size="xs" variant="light" color="cyan"  onClick={() => setOrigin(selected.id)}>Set origin</Button>
                      <Button size="xs" variant="light" color="teal"  onClick={() => setDestination(selected.id)}>Set destination</Button>
                    </Group>
                  </Stack>
                </Card>
              ) : (
                <Card withBorder padding="md">
                  <Stack gap="xs" align="center">
                    <IconMapPin size={20} color="rgba(0,200,255,0.4)" />
                    <Text size="xs" c="dimmed" ta="center">Click any system on the map to view details, lore, and stats.</Text>
                  </Stack>
                </Card>
              )}

              <Card withBorder padding="sm">
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">Source: <Text span size="xs" c="cyan" component="span">{sourceMeta.source}</Text>{" · "}{sourceMeta.cacheSource}</Text>
                  {sourceMeta.fetchedAt && <Text size="xs" c="dimmed">Fetched: {new Date(sourceMeta.fetchedAt).toLocaleString()}</Text>}
                  <Text size="xs" c="dimmed">Danger overlays are topology-derived. No live threat telemetry.</Text>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}