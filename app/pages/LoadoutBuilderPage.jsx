import { useState } from "react";
import { Badge, Button, Card, Container, Grid, Group, ScrollArea, Stack, Table, Tabs, Text, Title, Select } from "@mantine/core";
import { IconChevronLeft, IconRotateClockwise } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import DevTag from "../components/DevTag";

// Mock data: Ships
const SHIPS_CATALOG = [
  { id: "avenger", name: "Avenger Titan", manufacturer: "Aegis", class: "Light Fighter", mass: 18000, crew: 1 },
  { id: "arrow", name: "Arrow", manufacturer: "Anvil", class: "Light Fighter", mass: 7500, crew: 1 },
  { id: "gladius", name: "Gladius", manufacturer: "Anvil", class: "Light Fighter", mass: 13000, crew: 1 },
  { id: "hornet", name: "F7C Hornet", manufacturer: "Anvil", class: "Medium Fighter", mass: 20000, crew: 1 },
  { id: "vanguard", name: "Vanguard Warden", manufacturer: "Anvil", class: "Heavy Fighter", mass: 40000, crew: 2 },
  { id: "freelancer", name: "Freelancer", manufacturer: "MISC", class: "Multi-Role", mass: 26500, crew: 2 },
  { id: "cutlass", name: "Cutlass Black", manufacturer: "Drake", class: "Medium Multi-Role", mass: 24000, crew: 2 },
  { id: "3008", name: "300i", manufacturer: "Origin", class: "Light Touring", mass: 15000, crew: 1 },
];

// Mock data: Components
const COMPONENTS_CATALOG = [
  // Weapons
  { id: "m1a_gimbal", name: "M1A Gimbal Hardpoint", type: "weapon", category: "Cannons", dps: 45, cost: 15000, mass: 50 },
  { id: "laser_repeater", name: "Laser Repeater", type: "weapon", category: "Energy", dps: 38, cost: 12000, mass: 40 },
  { id: "rocket_pod", name: "Rocket Pod", type: "weapon", category: "Missiles", dps: 180, cost: 45000, mass: 200 },
  { id: "shield_large", name: "Large Shield", type: "shield", category: "Shields", hp: 5000, cost: 35000, mass: 300 },
  { id: "shield_medium", name: "Medium Shield", type: "shield", category: "Shields", hp: 3000, cost: 20000, mass: 200 },
  // Engines
  { id: "engine_xl", name: "XL Engine", type: "engine", category: "Engines", thrust: 1200, cost: 40000, mass: 150 },
  { id: "engine_large", name: "Large Engine", type: "engine", category: "Engines", thrust: 800, cost: 25000, mass: 100 },
  { id: "engine_medium", name: "Medium Engine", type: "engine", category: "Engines", thrust: 500, cost: 15000, mass: 70 },
  // Coolers
  { id: "cooler_large", name: "Large Cooler", type: "cooler", category: "Coolers", cooling: 800, cost: 22000, mass: 120 },
  { id: "cooler_medium", name: "Medium Cooler", type: "cooler", category: "Coolers", cooling: 500, cost: 12000, mass: 80 },
  // Power Plants
  { id: "powerplant_xl", name: "XL Power Plant", type: "power", category: "Power", output: 1500, cost: 50000, mass: 200 },
  { id: "powerplant_large", name: "Large Power Plant", type: "power", category: "Power", output: 1000, cost: 30000, mass: 140 },
];

// Hardpoint layouts per ship (simplified)
const HARDPOINT_LAYOUTS = {
  avenger: [
    { id: "nose", label: "Nose M2", type: "m2", x: 50, y: 30 },
    { id: "wing_left", label: "Wing L S2", type: "s2", x: 20, y: 50 },
    { id: "wing_right", label: "Wing R S2", type: "s2", x: 80, y: 50 },
  ],
  hornet: [
    { id: "nose", label: "Nose M2", type: "m2", x: 50, y: 20 },
    { id: "wing_left", label: "Wing L M1", type: "m1", x: 10, y: 50 },
    { id: "wing_right", label: "Wing R M1", type: "m1", x: 90, y: 50 },
    { id: "center", label: "Center S2", type: "s2", x: 50, y: 70 },
  ],
  vanguard: [
    { id: "nose", label: "Nose M3", type: "m3", x: 50, y: 20 },
    { id: "turret", label: "Turret M2", type: "m2", x: 50, y: 50 },
    { id: "wing_left", label: "Wing L M2", type: "m2", x: 10, y: 50 },
    { id: "wing_right", label: "Wing R M2", type: "m2", x: 90, y: 50 },
  ],
};

const ROLE_PRESETS = {
  fighter: { name: "Fighter", components: ["m1a_gimbal", "laser_repeater", "shield_large", "engine_large"] },
  trader: { name: "Trader", components: ["shield_medium", "engine_large", "cooler_medium"] },
  miner: { name: "Miner", components: ["shield_medium", "engine_medium", "cooler_large", "powerplant_large"] },
  explorer: { name: "Explorer", components: ["shield_medium", "engine_large", "cooler_medium"] },
};

export default function LoadoutBuilderPage() {
  const navigate = useNavigate();
  const [selectedShip, setSelectedShip] = useState(SHIPS_CATALOG[0].id);
  const [selectedComponents, setSelectedComponents] = useState({});
  const [selectedTab, setSelectedTab] = useState("weapons");

  const currentShip = SHIPS_CATALOG.find((s) => s.id === selectedShip) || SHIPS_CATALOG[0];
  const hardpoints = HARDPOINT_LAYOUTS[selectedShip] || [];
  const components = COMPONENTS_CATALOG.filter((c) => {
    if (selectedTab === "weapons") return c.type === "weapon";
    if (selectedTab === "shields") return c.type === "shield";
    if (selectedTab === "engines") return c.type === "engine";
    if (selectedTab === "coolers") return c.type === "cooler";
    if (selectedTab === "power") return c.type === "power";
    return true;
  });

  const totalMass = Object.values(selectedComponents).reduce((sum, cid) => {
    const comp = COMPONENTS_CATALOG.find((c) => c.id === cid);
    return sum + (comp?.mass || 0);
  }, currentShip.mass);

  const totalCost = Object.values(selectedComponents).reduce((sum, cid) => {
    const comp = COMPONENTS_CATALOG.find((c) => c.id === cid);
    return sum + (comp?.cost || 0);
  }, 0);

  const totalDPS = Object.values(selectedComponents).reduce((sum, cid) => {
    const comp = COMPONENTS_CATALOG.find((c) => c.id === cid);
    return sum + (comp?.dps || 0);
  }, 0);

  const handleComponentEquip = (hardpointId, componentId) => {
    setSelectedComponents({ ...selectedComponents, [hardpointId]: componentId });
  };

  const handleApplyPreset = (presetKey) => {
    const preset = ROLE_PRESETS[presetKey];
    const newComponents = {};
    hardpoints.forEach((hp, idx) => {
      if (idx < preset.components.length) {
        newComponents[hp.id] = preset.components[idx];
      }
    });
    setSelectedComponents(newComponents);
  };

  const handleReset = () => {
    setSelectedComponents({});
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Title order={1} style={{ marginBottom: 6 }}>
              <DevTag tag="GT02" /> Loadout Builder
            </Title>
            <Text c="dimmed" size="sm">
              Design your perfect ship configuration
            </Text>
          </div>
          <Button leftSection={<IconChevronLeft size={16} />} variant="subtle" color="gray" onClick={() => navigate("/")}>
            Back
          </Button>
        </Group>

        {/* Ship Selector & Presets */}
        <Card withBorder>
          <Stack gap="md">
            <Group gap="md" align="flex-end" wrap="wrap">
              <div style={{ flex: 1, minWidth: 200 }}>
                <Select
                  label="Select Ship"
                  placeholder="Choose a ship"
                  data={SHIPS_CATALOG.map((s) => ({ value: s.id, label: `${s.name} (${s.class})` }))}
                  value={selectedShip}
                  onChange={(val) => {
                    setSelectedShip(val);
                    setSelectedComponents({});
                  }}
                  clearable={false}
                />
              </div>
              <Group gap="xs">
                <Text size="sm" fw={600} c="dimmed">
                  Presets:
                </Text>
                {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant="light"
                    color="cyan"
                    onClick={() => handleApplyPreset(key)}
                  >
                    {preset.name}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  color="gray"
                  leftSection={<IconRotateClockwise size={14} />}
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Group>
            </Group>

            {/* Ship Info */}
            <Group gap="md" grow>
              <div>
                <Text size="xs" c="dimmed">
                  Manufacturer
                </Text>
                <Text fw={600}>{currentShip.manufacturer}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Class
                </Text>
                <Text fw={600}>{currentShip.class}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Hull Mass
                </Text>
                <Text fw={600}>{currentShip.mass} kg</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Crew
                </Text>
                <Text fw={600}>{currentShip.crew}</Text>
              </div>
            </Group>
          </Stack>
        </Card>

        {/* Main Layout */}
        <Grid gutter="md">
          {/* Left: Hardpoint Visualization */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card withBorder>
              <Stack gap="md">
                <Title order={4}>Hardpoint Layout</Title>

                {/* SVG Visualization */}
                <svg
                  viewBox="0 0 100 100"
                  style={{ width: "100%", background: "rgba(0,200,255,0.05)", borderRadius: 8, border: "1px solid rgba(0,200,255,0.3)" }}
                >
                  {/* Ship silhouette (placeholder) */}
                  <ellipse cx="50" cy="50" rx="30" ry="40" fill="rgba(0,200,255,0.1)" stroke="rgba(0,200,255,0.4)" strokeWidth="1" />

                  {/* Hardpoints */}
                  {hardpoints.map((hp) => {
                    const equipped = selectedComponents[hp.id];
                    const component = equipped ? COMPONENTS_CATALOG.find((c) => c.id === equipped) : null;
                    return (
                      <g key={hp.id}>
                        <circle
                          cx={hp.x}
                          cy={hp.y}
                          r="3"
                          fill={equipped ? "#00ff00" : "rgba(0,200,255,0.6)"}
                          opacity={0.8}
                        />
                        <title>{equipped ? `${hp.label}: ${component?.name}` : hp.label}</title>
                      </g>
                    );
                  })}
                </svg>

                {/* Hardpoint List */}
                <Stack gap="xs">
                  {hardpoints.map((hp) => {
                    const equipped = selectedComponents[hp.id];
                    const component = equipped ? COMPONENTS_CATALOG.find((c) => c.id === equipped) : null;
                    return (
                      <div key={hp.id} style={{ padding: "0.5rem", background: "rgba(0,200,255,0.05)", borderRadius: 4 }}>
                        <Text size="xs" fw={600}>
                          {hp.label}
                        </Text>
                        {component ? (
                          <Group gap="xs" justify="space-between">
                            <Text size="xs" c="cyan">
                              {component.name}
                            </Text>
                            <Button
                              size="xs"
                              variant="subtle"
                              color="red"
                              onClick={() => {
                                const updated = { ...selectedComponents };
                                delete updated[hp.id];
                                setSelectedComponents(updated);
                              }}
                            >
                              Remove
                            </Button>
                          </Group>
                        ) : (
                          <Text size="xs" c="dimmed">
                            Empty
                          </Text>
                        )}
                      </div>
                    );
                  })}
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Right: Component Browser & Summary */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              {/* Component Browser */}
              <Card withBorder>
                <Stack gap="md">
                  <Title order={4}>Components</Title>

                  <Tabs value={selectedTab} onChange={setSelectedTab}>
                    <Tabs.List>
                      <Tabs.Tab value="weapons">Weapons</Tabs.Tab>
                      <Tabs.Tab value="shields">Shields</Tabs.Tab>
                      <Tabs.Tab value="engines">Engines</Tabs.Tab>
                      <Tabs.Tab value="coolers">Coolers</Tabs.Tab>
                      <Tabs.Tab value="power">Power</Tabs.Tab>
                    </Tabs.List>

                    {["weapons", "shields", "engines", "coolers", "power"].map((tab) => (
                      <Tabs.Panel key={tab} value={tab}>
                        <ScrollArea style={{ height: 300 }}>
                          <Table size="sm" striped>
                            <Table.Thead>
                              <Table.Tr>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Cost</Table.Th>
                                <Table.Th>Mass</Table.Th>
                                <Table.Th style={{ width: 50 }} />
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {components.map((comp) => (
                                <Table.Tr key={comp.id}>
                                  <Table.Td>
                                    <Text size="sm">{comp.name}</Text>
                                  </Table.Td>
                                  <Table.Td>
                                    <Text size="sm">{comp.cost.toLocaleString()}</Text>
                                  </Table.Td>
                                  <Table.Td>
                                    <Text size="sm">{comp.mass} kg</Text>
                                  </Table.Td>
                                  <Table.Td>
                                    <Button
                                      size="xs"
                                      variant="light"
                                      color="cyan"
                                      onClick={() => {
                                        // Find first empty hardpoint of matching type
                                        const emptyHp = hardpoints.find((hp) => !selectedComponents[hp.id]);
                                        if (emptyHp) {
                                          handleComponentEquip(emptyHp.id, comp.id);
                                        }
                                      }}
                                    >
                                      Add
                                    </Button>
                                  </Table.Td>
                                </Table.Tr>
                              ))}
                            </Table.Tbody>
                          </Table>
                        </ScrollArea>
                      </Tabs.Panel>
                    ))}
                  </Tabs>
                </Stack>
              </Card>

              {/* Loadout Summary */}
              <Card withBorder style={{ background: "rgba(0,200,255,0.05)" }}>
                <Stack gap="md">
                  <Title order={4}>Loadout Summary</Title>

                  <Group gap="md" grow>
                    <div>
                      <Text size="xs" c="dimmed">
                        Total Mass
                      </Text>
                      <Text fw={600} size="lg">
                        {totalMass.toLocaleString()} kg
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">
                        Total Cost
                      </Text>
                      <Text fw={600} size="lg" c="cyan">
                        {totalCost.toLocaleString()} aUEC
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">
                        Est. DPS
                      </Text>
                      <Text fw={600} size="lg" c="yellow">
                        {Math.round(totalDPS)}
                      </Text>
                    </div>
                  </Group>

                  <Group gap="xs">
                    <Badge color="cyan">Components: {Object.keys(selectedComponents).length}</Badge>
                    <Badge color="gray">Hardpoints: {hardpoints.length}</Badge>
                  </Group>

                  <Button 
                    color="cyan" 
                    fullWidth
                    onClick={() => {
                      const config = {
                        shipId: selectedShip,
                        components: selectedComponents,
                        timestamp: new Date().toISOString(),
                      };
                      localStorage.setItem(`loadout-${selectedShip}-${Date.now()}`, JSON.stringify(config));
                      console.log("Loadout configuration saved to localStorage");
                    }}
                  >
                    Save Configuration
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
