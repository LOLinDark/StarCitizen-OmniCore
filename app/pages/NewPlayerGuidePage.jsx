import { useEffect, useMemo, useState } from "react";
import { Accordion, Anchor, Badge, Breadcrumbs, Button, Container, Grid, Group, ScrollArea, Select, Stack, Switch, Table, Text, TextInput, Title } from "@mantine/core";
import { IconArrowRight, IconCheck, IconChevronLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import DevTag from "../components/DevTag";
import { shipControlsCategories, shipKeybindings } from "../data/starcitizen-keybindings";
import { academyShipBranches, combatFocusCategories, featureTrainingNotes, gameplayAcademyTracks } from "../data/trainingAcademyFeatureNotes";

// Mock data: Onboarding modules
const ONBOARDING_MODULES = [
  {
    id: "careers",
    title: "Choose Your Career",
    description: "Select a path tailored to your playstyle.",
    sections: [
      { id: "explorer", title: "Explorer", icon: "🗺️", description: "Discover systems, map locations, find resources. Earn through data scanning and rare discoveries." },
      { id: "trader", title: "Trader", icon: "📦", description: "Buy low, sell high. Navigate markets, find profitable routes, manage cargo." },
      { id: "combat", title: "Combat Pilot", icon: "🎯", description: "Engage in PvE and PvP combat. Learn ship control, weapons, tactics." },
      { id: "miner", title: "Miner", icon: "⛏️", description: "Extract valuable ore. Find mining locations, process and refine commodities." },
      { id: "salvager", title: "Salvager", icon: "🔧", description: "Reclaim derelict ships. Identify valuable components, haul and process." },
    ],
    progressWeight: 1,
  },
  {
    id: "controls",
    title: "Master Your Controls",
    description: "Learn the Star Citizen control scheme and customize your HOTAS.",
    sections: [
      { id: "defaults", title: "Default Keybinds", description: "Overview of Star Citizen's default keyboard and mouse bindings." },
      { id: "hotas", title: "HOTAS Setup", description: "Configure joystick and throttle. See our Peripheral Configuration page for detailed setup." },
      { id: "mouse", title: "Mouse Look & Aim", description: "Master mouse-aim dogfighting and precision targeting." },
      { id: "landing", title: "Landing & Docking", description: "Advanced controls for precision landing and port docking." },
    ],
    progressWeight: 1,
  },
  {
    id: "gameplay",
    title: "Core Gameplay Basics",
    description: "Understand Star Citizen's fundamental mechanics.",
    sections: [
      { id: "movement", title: "Movement & Flight", description: "Learn the flight model: VTOL, hovering, boost, afterburner." },
      { id: "landing", title: "Landing & takeoff", description: "Safe landing procedures, pad alignment, parking brakes." },
      { id: "weapons", title: "Weapons & Targeting", description: "Lock targets, manage weapon groups, switch to different ammo types." },
      { id: "mining", title: "Mining Basics", description: "Find asteroids, scan for fractures, extract ore, manage heat." },
      { id: "trading", title: "Trading Basics", description: "Accept missions, transport cargo, manage profit margins." },
    ],
    progressWeight: 1,
  },
  {
    id: "economy",
    title: "Economy & Trading",
    description: "Understand how Star Citizen's economy works.",
    sections: [
      { id: "markets", title: "Trading Markets", description: "Buy and sell commodities. Understand supply, demand, and profit." },
      { id: "routes", title: "Trade Routes", description: "Find profitable trading routes. Use our Economy Tracker tool." },
      { id: "mining", title: "Mining & Refining", description: "Process ore into refined commodities. Maximize profit per hour." },
      { id: "costs", title: "Ship Costs & Fees", description: "Landing fees, dock fees, repair costs, insurance." },
    ],
    progressWeight: 1,
  },
  {
    id: "safety",
    title: "Safety & PvP",
    description: "Avoid griefing, stay safe, and understand PvP rules.",
    sections: [
      { id: "zones", title: "Safe Trading Zones", description: "Secure areas where griefing is heavily penalized by law enforcement." },
      { id: "pirates", title: "Avoiding Pirates", description: "Stay alert, use dark sites, avoid shipping lanes, travel in groups." },
      { id: "insurance", title: "Insurance & Claim", description: "What insurance covers, claim process, deductibles." },
      { id: "law", title: "Criminal Activity", description: "What gets you wanted, how bounty hunters find you, claiming bounties." },
    ],
    progressWeight: 1,
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting & Tips",
    description: "Common issues and performance optimization.",
    sections: [
      { id: "crashes", title: "Game Crashes", description: "Common crash causes, reinstall steps, verifying files." },
      { id: "fps", title: "Performance Optimization", description: "Graphics settings, CPU bottlenecks, memory management." },
      { id: "network", title: "Networking Issues", description: "Rubber-banding, lag, server crashes, recovery." },
      { id: "stuck", title: "Stuck in Game", description: "If you're stuck, how to respawn, reset character location." },
    ],
    progressWeight: 1,
  },
];

export default function NewPlayerGuidePage() {
  const navigate = useNavigate();
  const { track, shipId } = useParams();
  const [userProgress, setUserProgress] = useState(() => {
    const stored = localStorage.getItem("npg-progress");
    return stored ? JSON.parse(stored) : {};
  });
  const [selectedModule, setSelectedModule] = useState(ONBOARDING_MODULES[0].id);
  const [academySearch, setAcademySearch] = useState("");
  const [academyCategory, setAcademyCategory] = useState("all");
  const [combatFocusOnly, setCombatFocusOnly] = useState(true);

  const activeTrack = track && gameplayAcademyTracks[track] ? gameplayAcademyTracks[track] : null;
  const activeShipBranch = shipId && academyShipBranches[shipId] ? academyShipBranches[shipId] : null;

  useEffect(() => {
    if (!activeTrack) return;

    setCombatFocusOnly(false);
    setAcademyCategory("all");

    const seededSearch = [activeTrack.defaultSearch, activeShipBranch?.suggestedSearch]
      .filter(Boolean)
      .join(" ")
      .trim();
    setAcademySearch(seededSearch);
  }, [activeTrack, activeShipBranch]);

  const currentModule = ONBOARDING_MODULES.find((m) => m.id === selectedModule) || ONBOARDING_MODULES[0];
  const progressPercent = Math.round((Object.keys(userProgress).filter((k) => userProgress[k]).length / ONBOARDING_MODULES.length) * 100);

  const academyRows = useMemo(() => {
    const term = academySearch.trim().toLowerCase();

    return shipKeybindings
      .filter((binding) => {
        if (activeTrack && !activeTrack.categories.includes(binding.category)) return false;
        if (combatFocusOnly && !combatFocusCategories.includes(binding.category)) return false;
        if (academyCategory !== "all" && binding.category !== academyCategory) return false;
        if (!term) return true;

        const note = featureTrainingNotes[binding.id];
        const searchable = [
          binding.feature,
          binding.description,
          binding.id,
          shipControlsCategories[binding.category]?.label,
          note?.summary,
          note?.whenToUse,
          note?.bestPractice,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(term);
      })
      .map((binding) => {
        const note = featureTrainingNotes[binding.id] || {};
        return {
          ...binding,
          categoryLabel: shipControlsCategories[binding.category]?.label || binding.category,
          note,
        };
      })
      .sort((a, b) => a.feature.localeCompare(b.feature));
  }, [academySearch, academyCategory, combatFocusOnly, activeTrack]);

  const academyCategoryOptions = useMemo(() => {
    const options = Object.values(shipControlsCategories)
      .map((category) => ({
        value: category.id,
        label: category.label,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ value: "all", label: "All categories" }, ...options];
  }, []);

  const handleToggleProgress = (moduleId) => {
    const newProgress = { ...userProgress, [moduleId]: !userProgress[moduleId] };
    setUserProgress(newProgress);
    localStorage.setItem("npg-progress", JSON.stringify(newProgress));
  };

  const handleModuleSelect = (moduleId) => {
    setSelectedModule(moduleId);
  };

  const handleLearnMore = (sectionTitle) => {
    // Placeholder for future wiki link integration
    console.log(`Learn more about: ${sectionTitle}`);
    // Later: window.open(`https://star-citizen.wiki/wiki/${sectionTitle}`, '_blank');
  };

  const handleNavigateTo = (route) => {
    navigate(route);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Title order={1} style={{ marginBottom: 6 }}>
              <DevTag tag="GT01" /> New Player Guide
            </Title>
            <Text c="dimmed" size="sm">
              {activeTrack
                ? `${activeTrack.label}${activeShipBranch ? ` - ${activeShipBranch.label}` : ""}.`
                : `Your first steps as a Star Citizen. ${progressPercent}% complete.`}
            </Text>
          </div>
          <Button leftSection={<IconChevronLeft size={16} />} variant="subtle" color="gray" onClick={() => navigate("/")}>
            Back
          </Button>
        </Group>

        {/* Progress Bar */}
        <div style={{ height: 6, background: "rgba(0,200,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progressPercent}%`,
              background: "linear-gradient(90deg, #00d9ff, #00ffff)",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Main Content */}
        <Grid gutter="md">
          {/* Left: Module List */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <ScrollArea style={{ height: "calc(100vh - 300px)" }}>
              <Stack gap="xs">
                {ONBOARDING_MODULES.map((mod) => (
                  <Button
                    key={mod.id}
                    variant={selectedModule === mod.id ? "filled" : "outline"}
                    color={selectedModule === mod.id ? "cyan" : "gray"}
                    justify="space-between"
                    onClick={() => handleModuleSelect(mod.id)}
                    rightSection={
                      userProgress[mod.id] ? <IconCheck size={16} color="#00ff00" /> : null
                    }
                    fullWidth
                  >
                    <Text size="sm">{mod.title}</Text>
                  </Button>
                ))}
              </Stack>
            </ScrollArea>
          </Grid.Col>

          {/* Right: Module Content */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Stack gap="md">
              {/* Breadcrumb */}
              <Breadcrumbs>
                <Text size="xs" c="dimmed">
                  Guides
                </Text>
                <Text size="xs" c="cyan">
                  {currentModule.title}
                </Text>
              </Breadcrumbs>

              {/* Module Header */}
              <div>
                <Group justify="space-between" align="flex-start" wrap="wrap">
                  <div>
                    <Title order={2}>{currentModule.title}</Title>
                    <Text c="dimmed" size="sm" style={{ marginTop: 4 }}>
                      {currentModule.description}
                    </Text>
                  </div>
                  <Button
                    size="xs"
                    variant={userProgress[currentModule.id] ? "filled" : "outline"}
                    color="cyan"
                    leftSection={userProgress[currentModule.id] ? <IconCheck size={14} /> : null}
                    onClick={() => handleToggleProgress(currentModule.id)}
                  >
                    {userProgress[currentModule.id] ? "Completed" : "Mark Complete"}
                  </Button>
                </Group>
              </div>

              {/* Module Sections as Accordion */}
              <Accordion variant="contained" chevronPosition="right">
                {currentModule.sections.map((section) => (
                  <Accordion.Item key={section.id} value={section.id}>
                    <Accordion.Control>
                      <Group gap="xs">
                        <span style={{ fontSize: "1.5rem" }}>{section.icon}</span>
                        <div>
                          <Text fw={600}>{section.title}</Text>
                          <Text size="xs" c="dimmed">
                            {section.description}
                          </Text>
                        </div>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="sm">
                        <Text size="sm">{section.description}</Text>
                        <Group gap="xs">
                          <Badge color="cyan" variant="light">
                            Beginner
                          </Badge>
                          <Badge color="blue" variant="light">
                            Video
                          </Badge>
                        </Group>
                        <Button 
                          size="xs" 
                          variant="light" 
                          color="cyan" 
                          rightSection={<IconArrowRight size={14} />}
                          onClick={() => handleLearnMore(section.title)}
                        >
                          Learn More
                        </Button>
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>

              {/* Links to Related Pages */}
              <Stack gap="xs" style={{ marginTop: "1rem", padding: "1rem", background: "rgba(0,200,255,0.05)", borderRadius: 8 }}>
                <Text fw={600} size="sm">
                  Related Tools
                </Text>
                <Group gap="xs">
                  <Button 
                    size="xs" 
                    variant="light" 
                    color="cyan"
                    onClick={() => handleNavigateTo("/technology-config")}
                  >
                    → Peripheral Configuration (GT05)
                  </Button>
                  <Button 
                    size="xs" 
                    variant="light" 
                    color="teal"
                    onClick={() => handleNavigateTo("/loadout-builder")}
                  >
                    → Loadout Builder (GT02)
                  </Button>
                  <Button 
                    size="xs" 
                    variant="light" 
                    color="blue"
                    onClick={() => handleNavigateTo("/economy-tracker")}
                  >
                    → Economy Tracker (GT03)
                  </Button>
                </Group>
              </Stack>

              {/* Feature Knowledge Base */}
              <Stack gap="sm" style={{ marginTop: "1rem", padding: "1rem", background: "rgba(0, 20, 35, 0.45)", border: "1px solid rgba(0, 217, 255, 0.18)", borderRadius: 8 }}>
                <Group justify="space-between" align="flex-start" wrap="wrap">
                  <div>
                    <Title order={4}>Feature Knowledge Base</Title>
                    <Text size="sm" c="dimmed">
                      Powered by the same feature list used in HC05 HOTAS configuration. Add tutorials and dev discussions as you discover them.
                    </Text>
                  </div>
                  <Badge color="cyan" variant="light">
                    {academyRows.length} features
                  </Badge>
                </Group>

                <Group gap="xs" wrap="wrap">
                  {Object.entries(gameplayAcademyTracks).map(([trackKey, meta]) => (
                    <Button
                      key={trackKey}
                      size="xs"
                      variant={trackKey === track ? "filled" : "light"}
                      color={trackKey === track ? "cyan" : "gray"}
                      onClick={() => navigate(`/academy/${trackKey}`)}
                    >
                      {meta.label}
                    </Button>
                  ))}
                  <Button size="xs" variant="outline" color="gray" onClick={() => navigate("/new-player-guide")}>General Academy</Button>
                  <Button size="xs" variant="outline" color="cyan" onClick={() => navigate("/academy/feature-library")}>Feature Library</Button>
                </Group>

                {activeTrack && (
                  <Group gap="xs" wrap="wrap">
                    {Object.entries(academyShipBranches).map(([shipKey, shipMeta]) => (
                      <Button
                        key={shipKey}
                        size="xs"
                        variant={shipKey === shipId ? "filled" : "light"}
                        color={shipKey === shipId ? "orange" : "gray"}
                        onClick={() => navigate(`/academy/${track}/${shipKey}`)}
                      >
                        {shipMeta.label}
                      </Button>
                    ))}
                  </Group>
                )}

                <Group align="flex-end" gap="sm" wrap="wrap">
                  <TextInput
                    label="Search features"
                    placeholder="Decoy, Noise, IFCS, shields..."
                    value={academySearch}
                    onChange={(event) => setAcademySearch(event.currentTarget.value)}
                    style={{ minWidth: 260, flex: 1 }}
                  />
                  <Select
                    label="Category"
                    data={academyCategoryOptions}
                    value={academyCategory}
                    onChange={(value) => setAcademyCategory(value || "all")}
                    style={{ minWidth: 280 }}
                  />
                  <Switch
                    label="Combat focus only"
                    checked={combatFocusOnly}
                    onChange={(event) => setCombatFocusOnly(event.currentTarget.checked)}
                  />
                </Group>

                <ScrollArea style={{ maxHeight: 520 }}>
                  <Table striped highlightOnHover withTableBorder withColumnBorders horizontalSpacing="sm" verticalSpacing="xs" style={{ minWidth: 1100 }}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Feature</Table.Th>
                        <Table.Th>Category</Table.Th>
                        <Table.Th>Default Key</Table.Th>
                        <Table.Th>Gameplay Notes</Table.Th>
                        <Table.Th>Tutorials</Table.Th>
                        <Table.Th>Dev/Discussion</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {academyRows.map((row) => {
                        const tutorials = row.note.tutorialVideos || [];
                        const discussions = [
                          ...(row.note.devDiscussionVideos || []),
                          ...(row.note.readingLinks || []),
                        ];

                        return (
                          <Table.Tr key={row.id}>
                            <Table.Td>
                              <Text fw={600}>{row.feature}</Text>
                              <Text size="xs" c="dimmed">{row.id}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm">{row.categoryLabel}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge color="blue" variant="light">{row.primaryKey || "-"}</Badge>
                            </Table.Td>
                            <Table.Td>
                              <Stack gap={4}>
                                <Text size="sm">{row.note.summary || row.description || "No academy notes yet."}</Text>
                                {row.note.whenToUse && <Text size="xs" c="dimmed">When: {row.note.whenToUse}</Text>}
                                {row.note.bestPractice && <Text size="xs" c="dimmed">Best practice: {row.note.bestPractice}</Text>}
                              </Stack>
                            </Table.Td>
                            <Table.Td>
                              <Stack gap={4}>
                                {tutorials.length === 0 && <Text size="xs" c="dimmed">No tutorial links yet</Text>}
                                {tutorials.map((item) => (
                                  <Anchor key={`${row.id}-${item.url}`} href={item.url} target="_blank" rel="noreferrer" size="xs">
                                    {item.title}
                                  </Anchor>
                                ))}
                              </Stack>
                            </Table.Td>
                            <Table.Td>
                              <Stack gap={4}>
                                {discussions.length === 0 && <Text size="xs" c="dimmed">No dev/discussion links yet</Text>}
                                {discussions.map((item) => (
                                  <Anchor key={`${row.id}-${item.url}`} href={item.url} target="_blank" rel="noreferrer" size="xs">
                                    {item.title}
                                  </Anchor>
                                ))}
                              </Stack>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Stack>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
