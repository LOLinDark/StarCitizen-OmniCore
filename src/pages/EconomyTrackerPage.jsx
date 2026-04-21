import { useState } from "react";
import { Badge, Button, Card, Container, Grid, Group, ScrollArea, Stack, Table, Tabs, Text, TextInput, Title, Select } from "@mantine/core";
import { IconChevronLeft, IconRefresh, IconTrendingUp } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import DevTag from "../components/DevTag";

// Mock data: Commodities
const COMMODITIES = [
  { id: "medical", name: "Medical Supplies", buyPrice: 45.50, sellPrice: 82.30, supply: 150, demand: 890, change: 2.5 },
  { id: "food", name: "Food & Water", buyPrice: 12.00, sellPrice: 28.50, supply: 500, demand: 2000, change: -1.2 },
  { id: "fuel", name: "Quantum Fuel", buyPrice: 85.00, sellPrice: 145.00, supply: 300, demand: 1200, change: 3.1 },
  { id: "weapons", name: "Weapons", buyPrice: 150.00, sellPrice: 280.00, supply: 80, demand: 300, change: 1.8 },
  { id: "armor", name: "Armor Plating", buyPrice: 120.00, sellPrice: 220.00, supply: 120, demand: 400, change: -0.5 },
  { id: "components", name: "Ship Components", buyPrice: 200.00, sellPrice: 380.00, supply: 60, demand: 200, change: 2.1 },
  { id: "ore_taranite", name: "Taranite Ore", buyPrice: 35.00, sellPrice: 75.00, supply: 800, demand: 450, change: 4.2 },
  { id: "ore_laranite", name: "Laranite Ore", buyPrice: 45.00, sellPrice: 95.00, supply: 600, demand: 350, change: -2.1 },
];

// Trading Locations
const LOCATIONS = [
  { id: "port-olisar", name: "Port Olisar", system: "Stanton", commodities: ["medical", "food", "weapons", "armor"] },
  { id: "lorville", name: "Lorville (ArcCorp)", system: "Stanton", commodities: ["food", "armor", "components", "fuel"] },
  { id: "new-babbage", name: "New Babbage", system: "Stanton", commodities: ["medical", "weapons", "components", "fuel"] },
  { id: "grim-hex", name: "Grim Hex", system: "Yela", commodities: ["weapons", "armor", "ore_taranite"] },
  { id: "orison", name: "Orison", system: "Stanton", commodities: ["medical", "food", "fuel", "components"] },
];

// Mining Ores & Processing
const MINING_ORES = [
  { id: "taranite", name: "Taranite", refinedAs: "Taranite Ore", processTime: 45, yield: 0.8, profitPerUnit: 40 },
  { id: "laranite", name: "Laranite", refinedAs: "Laranite Ore", processTime: 60, yield: 0.75, profitPerUnit: 50 },
  { id: "quantanium", name: "Quantanium", refinedAs: "Refined Quantanium", processTime: 90, yield: 0.6, profitPerUnit: 85 },
  { id: "agricium", name: "Agricium", refinedAs: "Refined Agricium", processTime: 50, yield: 0.7, profitPerUnit: 45 },
];

export default function EconomyTrackerPage() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("prices");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState(LOCATIONS[0].id);
  const [selectedDestination, setSelectedDestination] = useState(LOCATIONS[1].id);
  const [selectedMiningOre, setSelectedMiningOre] = useState(MINING_ORES[0].id);
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem("economy-favorites");
    return stored ? JSON.parse(stored) : [];
  });

  const filteredCommodities = COMMODITIES.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleToggleFavorite = (commodityId) => {
    const updated = favorites.includes(commodityId)
      ? favorites.filter((id) => id !== commodityId)
      : [...favorites, commodityId];
    setFavorites(updated);
    localStorage.setItem("economy-favorites", JSON.stringify(updated));
  };

  const calculateProfit = (buy, sell, quantity = 1) => {
    return ((sell - buy) * quantity).toFixed(2);
  };

  const originLocation = LOCATIONS.find((l) => l.id === selectedOrigin);
  const destLocation = LOCATIONS.find((l) => l.id === selectedDestination);
  const miningOre = MINING_ORES.find((o) => o.id === selectedMiningOre);

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Title order={1} style={{ marginBottom: 6 }}>
              <DevTag tag="GT03" /> Economy Tracker
            </Title>
            <Text c="dimmed" size="sm">
              Monitor commodity prices and optimize your profits
            </Text>
          </div>
          <Button leftSection={<IconChevronLeft size={16} />} variant="subtle" color="gray" onClick={() => navigate("/")}>
            Back
          </Button>
        </Group>

        {/* Data Source & Freshness */}
        <Group gap="xs">
          <Badge color="cyan" variant="light">
            🌐 UEX Corp
          </Badge>
          <Badge color="green" variant="light">
            Fresh (5 min ago)
          </Badge>
          <Button 
            size="xs" 
            variant="light" 
            leftSection={<IconRefresh size={14} />}
            onClick={() => {
              console.log("Refreshing economy data...");
              // Later: fetch latest data from backend API
            }}
          >
            Refresh Data
          </Button>
        </Group>

        {/* Tabs */}
        <Tabs value={selectedTab} onChange={setSelectedTab}>
          <Tabs.List>
            <Tabs.Tab value="prices">Commodity Prices</Tabs.Tab>
            <Tabs.Tab value="routes">Trade Routes</Tabs.Tab>
            <Tabs.Tab value="mining">Mining Calculator</Tabs.Tab>
            <Tabs.Tab value="favorites">Favorites</Tabs.Tab>
          </Tabs.List>

          {/* Tab: Commodity Prices */}
          <Tabs.Panel value="prices" py="md">
            <Stack gap="md">
              <TextInput
                placeholder="Search commodities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
              />

              <ScrollArea>
                <Table size="sm" striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: 30 }} />
                      <Table.Th>Commodity</Table.Th>
                      <Table.Th>Buy Price</Table.Th>
                      <Table.Th>Sell Price</Table.Th>
                      <Table.Th>Profit %</Table.Th>
                      <Table.Th>Supply</Table.Th>
                      <Table.Th>Demand</Table.Th>
                      <Table.Th>Change</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredCommodities.map((comm) => {
                      const profitPct = (((comm.sellPrice - comm.buyPrice) / comm.buyPrice) * 100).toFixed(1);
                      const isFavorite = favorites.includes(comm.id);
                      return (
                        <Table.Tr key={comm.id}>
                          <Table.Td>
                            <Button
                              size="xs"
                              variant="subtle"
                              color={isFavorite ? "yellow" : "gray"}
                              onClick={() => handleToggleFavorite(comm.id)}
                            >
                              {isFavorite ? "★" : "☆"}
                            </Button>
                          </Table.Td>
                          <Table.Td>
                            <Text fw={600}>{comm.name}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text>{comm.buyPrice.toFixed(2)} aUEC</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text c="cyan">{comm.sellPrice.toFixed(2)} aUEC</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={profitPct > 50 ? "green" : "yellow"}>{profitPct}%</Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{comm.supply}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{comm.demand}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text color={comm.change > 0 ? "green" : "red"}>
                              {comm.change > 0 ? "+" : ""}
                              {comm.change}%
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Stack>
          </Tabs.Panel>

          {/* Tab: Trade Routes */}
          <Tabs.Panel value="routes" py="md">
            <Stack gap="md">
              <Card withBorder>
                <Stack gap="md">
                  <Title order={4}>Plan a Trade Route</Title>

                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: 5 }}>
                      <Select
                        label="Origin Location"
                        data={LOCATIONS.map((l) => ({ value: l.id, label: `${l.name} (${l.system})` }))}
                        value={selectedOrigin}
                        onChange={(val) => setSelectedOrigin(val)}
                        clearable={false}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 5 }}>
                      <Select
                        label="Destination Location"
                        data={LOCATIONS.map((l) => ({ value: l.id, label: `${l.name} (${l.system})` }))}
                        value={selectedDestination}
                        onChange={(val) => setSelectedDestination(val)}
                        clearable={false}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 2 }}>
                      <Button fullWidth style={{ marginTop: 26 }} color="cyan">
                        Calculate
                      </Button>
                    </Grid.Col>
                  </Grid>

                  {originLocation && destLocation && (
                    <div style={{ padding: "1rem", background: "rgba(0,200,255,0.05)", borderRadius: 8 }}>
                      <Stack gap="md">
                        <Group justify="space-between">
                          <div>
                            <Text size="xs" c="dimmed">
                              From
                            </Text>
                            <Text fw={600}>{originLocation.name}</Text>
                          </div>
                          <Text color="cyan">→</Text>
                          <div>
                            <Text size="xs" c="dimmed">
                              To
                            </Text>
                            <Text fw={600}>{destLocation.name}</Text>
                          </div>
                        </Group>

                        <div>
                          <Text size="xs" c="dimmed" mb={4}>
                            Best Profit Commodities
                          </Text>
                          {originLocation.commodities
                            .filter((c) => destLocation.commodities.includes(c))
                            .slice(0, 3)
                            .map((commId) => {
                              const comm = COMMODITIES.find((c) => c.id === commId);
                              return (
                                <Group key={commId} justify="space-between" mb={8}>
                                  <Text size="sm">{comm.name}</Text>
                                  <Badge color="green">
                                    +{calculateProfit(comm.buyPrice, comm.sellPrice)} aUEC per unit
                                  </Badge>
                                </Group>
                              );
                            })}
                        </div>

                        <Button 
                          color="cyan" 
                          fullWidth
                          onClick={() => navigate("/location-guide")}
                        >
                          View on Navigation Chart →
                        </Button>
                      </Stack>
                    </div>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          {/* Tab: Mining Calculator */}
          <Tabs.Panel value="mining" py="md">
            <Stack gap="md">
              <Card withBorder>
                <Stack gap="md">
                  <Title order={4}>Mining Profit Calculator</Title>

                  <Select
                    label="Select Ore Type"
                    data={MINING_ORES.map((o) => ({ value: o.id, label: o.name }))}
                    value={selectedMiningOre}
                    onChange={(val) => setSelectedMiningOre(val)}
                    clearable={false}
                  />

                  {miningOre && (
                    <div style={{ padding: "1rem", background: "rgba(0,200,255,0.05)", borderRadius: 8 }}>
                      <Stack gap="md">
                        <Group grow>
                          <div>
                            <Text size="xs" c="dimmed">
                              Ore Type
                            </Text>
                            <Text fw={600}>{miningOre.name}</Text>
                          </div>
                          <div>
                            <Text size="xs" c="dimmed">
                              Refines As
                            </Text>
                            <Text fw={600}>{miningOre.refinedAs}</Text>
                          </div>
                          <div>
                            <Text size="xs" c="dimmed">
                              Process Time
                            </Text>
                            <Text fw={600}>{miningOre.processTime} min</Text>
                          </div>
                          <div>
                            <Text size="xs" c="dimmed">
                              Yield
                            </Text>
                            <Text fw={600}>{(miningOre.yield * 100).toFixed(0)}%</Text>
                          </div>
                        </Group>

                        <div>
                          <Text size="sm" fw={600} mb={8}>
                            Estimated Profit
                          </Text>
                          <Group grow>
                            <div>
                              <Text size="xs" c="dimmed">
                                Per Unit
                              </Text>
                              <Text fw={600} c="green" size="lg">
                                +{miningOre.profitPerUnit} aUEC
                              </Text>
                            </div>
                            <div>
                              <Text size="xs" c="dimmed">
                                Per Hour (Est.)
                              </Text>
                              <Text fw={600} c="green" size="lg">
                                +{Math.round((60 / miningOre.processTime) * miningOre.profitPerUnit * 100)} aUEC
                              </Text>
                            </div>
                          </Group>
                        </div>
                      </Stack>
                    </div>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          {/* Tab: Favorites */}
          <Tabs.Panel value="favorites" py="md">
            <Stack gap="md">
              {favorites.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">
                  No favorites yet. Star commodities in the Prices tab to track them here.
                </Text>
              ) : (
                <ScrollArea>
                  <Table size="sm" striped>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Commodity</Table.Th>
                        <Table.Th>Profit Potential</Table.Th>
                        <Table.Th>Current Margin</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {COMMODITIES.filter((c) => favorites.includes(c.id)).map((comm) => (
                        <Table.Tr key={comm.id}>
                          <Table.Td fw={600}>{comm.name}</Table.Td>
                          <Table.Td c="green">+{calculateProfit(comm.buyPrice, comm.sellPrice)} per unit</Table.Td>
                          <Table.Td>
                            <Badge color="cyan">
                              {(((comm.sellPrice - comm.buyPrice) / comm.buyPrice) * 100).toFixed(1)}%
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
