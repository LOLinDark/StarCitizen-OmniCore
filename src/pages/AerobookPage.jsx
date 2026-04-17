import { Container, SimpleGrid, Stack, Text, Tabs, Group, Badge, Modal, Center, Loader } from '@mantine/core';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SciFiBackground from '../components/ui/SciFiBackground';
import AerobookPost from '../components/AerobookPost';
import YouTubePlayer from '../components/YouTubePlayer';
import { aeroBookContent, aeroBookCategories } from '../data/aeroBookContent';
import { useAerobookStore } from '../stores/useAerobookStore';
import DevTag from '../components/DevTag';

export default function AerobookPage() {
  const navigate = useNavigate();
  const rotationIndex = useAerobookStore((s) => s.rotationIndex);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTab, setActiveTab] = useState('star-citizen');

  // Get posts for current category
  const currentCategoryPosts = useMemo(() => {
    return aeroBookContent[activeTab] || [];
  }, [activeTab]);

  // Get currently featured post for this category (rotation-based)
  const featuredPost = useMemo(() => {
    if (currentCategoryPosts.length === 0) return null;
    const index = rotationIndex % currentCategoryPosts.length;
    return currentCategoryPosts[index];
  }, [currentCategoryPosts, rotationIndex]);

  const categoryInfo = aeroBookCategories.find((c) => c.id === activeTab);

  return (
    <>
      <SciFiBackground />
      <Container size="xl" py="xl" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Stack gap="md" mb="xl">
          <div>
            <Group gap="sm" mb="xs">
              <Text size="xl" fw={700} style={{ color: '#00d9ff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <DevTag tag="APP02" />📸 Aerobook
              </Text>
              <Badge color="cyan" variant="light">
                Verse Media
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              Discover the latest content from Star Citizen creators. Content rotates on refresh to show fresh perspectives.
            </Text>
          </div>

          {/* Featured Post for Current Category */}
          {featuredPost && (
            <div
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: '2px solid rgba(0, 217, 255, 0.3)',
                backgroundColor: 'rgba(11, 20, 40, 0.6)',
              }}
            >
              <Stack gap={0}>
                {/* Featured Video */}
                <div
                  style={{
                    aspectRatio: '16 / 9',
                    width: '100%',
                    backgroundColor: '#000',
                  }}
                >
                  <YouTubePlayer
                    youtubeId={featuredPost.youtubeId}
                    startSec={featuredPost.startSec}
                    endSec={featuredPost.endSec}
                    title={featuredPost.title}
                    autoplay={false}
                  />
                </div>

                {/* Featured Post Info */}
                <Stack gap="sm" p="md" style={{ backgroundColor: 'rgba(11, 20, 40, 0.8)' }}>
                  <Group justify="space-between" align="flex-start">
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Group gap="sm">
                        <img
                          src={featuredPost.creatorAvatar}
                          alt={featuredPost.creatorHandle}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: '2px solid #00d9ff',
                          }}
                          onError={(e) => {
                            e.target.style.backgroundColor = '#00d9ff';
                            e.target.style.color = '#0a1428';
                            e.target.style.display = 'flex';
                            e.target.style.alignItems = 'center';
                            e.target.style.justifyContent = 'center';
                            e.target.textContent = featuredPost.creatorHandle[1];
                          }}
                        />
                        <Stack gap="xs">
                          <Text fw={600} style={{ color: '#fff' }}>
                            {featuredPost.creatorHandle}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {featuredPost.timestamp}
                          </Text>
                        </Stack>
                      </Group>
                      <Text size="lg" fw={600} style={{ color: '#00d9ff' }}>
                        {featuredPost.title}
                      </Text>
                      <Group gap="lg">
                        <Group gap={4}>
                          <span style={{ fontSize: '1.2rem' }}>❤️</span>
                          <Text size="sm" fw={600}>
                            {featuredPost.likeCount.toLocaleString()} likes
                          </Text>
                        </Group>
                        <Group gap={4}>
                          <span style={{ fontSize: '1.2rem' }}>👁️</span>
                          <Text size="sm" fw={600}>
                            {featuredPost.viewCount.toLocaleString()} views
                          </Text>
                        </Group>
                      </Group>
                    </Stack>
                  </Group>
                  <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                    💡 Tip: This featured post changes on page refresh. Gallery filters available below.
                  </Text>
                </Stack>
              </Stack>
            </div>
          )}
        </Stack>

        {/* Category Tabs */}
        <Tabs
          value={activeTab}
          onTabChange={setActiveTab}
          style={{ marginBottom: '2rem' }}
        >
          <Tabs.List style={{ borderBottom: '1px solid rgba(0, 217, 255, 0.2)' }}>
            {aeroBookCategories.map((cat) => (
              <Tabs.Tab
                key={cat.id}
                value={cat.id}
                leftSection={<span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>}
                style={{
                  color: activeTab === cat.id ? cat.color : 'rgba(255,255,255,0.5)',
                  borderBottomColor: activeTab === cat.id ? cat.color : 'transparent',
                }}
              >
                {cat.label} ({aeroBookContent[cat.id]?.length || 0})
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {/* Gallery Grid */}
          <Tabs.Panel value={activeTab} pt="xl">
            {currentCategoryPosts.length > 0 ? (
              <SimpleGrid
                cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
                spacing="md"
                style={{ marginBottom: '2rem' }}
              >
                {currentCategoryPosts.map((post) => (
                  <AerobookPost key={post.id} post={post} onSelect={setSelectedPost} />
                ))}
              </SimpleGrid>
            ) : (
              <Center py="xl">
                <Text c="dimmed">No content available for this category yet.</Text>
              </Center>
            )}
          </Tabs.Panel>
        </Tabs>

        {/* Post Detail Modal */}
        <Modal
          opened={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          size="lg"
          title={
            selectedPost && (
              <Group gap="sm">
                <img
                  src={selectedPost.creatorAvatar}
                  alt={selectedPost.creatorHandle}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid #00d9ff',
                  }}
                />
                <Stack gap={0}>
                  <Text fw={600}>{selectedPost.creatorHandle}</Text>
                  <Text size="xs" c="dimmed">
                    {selectedPost.timestamp}
                  </Text>
                </Stack>
              </Group>
            )
          }
          styles={{
            content: {
              backgroundColor: 'rgba(11, 20, 40, 0.95)',
              borderColor: 'rgba(0, 217, 255, 0.2)',
            },
            header: {
              backgroundColor: 'rgba(11, 20, 40, 0.95)',
              borderColor: 'rgba(0, 217, 255, 0.2)',
            },
          }}
        >
          {selectedPost && (
            <Stack gap="md">
              <div
                style={{
                  aspectRatio: '16 / 9',
                  width: '100%',
                  backgroundColor: '#000',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <YouTubePlayer
                  youtubeId={selectedPost.youtubeId}
                  startSec={selectedPost.startSec}
                  endSec={selectedPost.endSec}
                  title={selectedPost.title}
                  autoplay={true}
                />
              </div>
              <Stack gap="xs">
                <Text size="lg" fw={700} style={{ color: '#00d9ff' }}>
                  {selectedPost.title}
                </Text>
                <Group gap="lg">
                  <Group gap={4}>
                    <span style={{ fontSize: '1.5rem' }}>❤️</span>
                    <Text fw={600}>{selectedPost.likeCount.toLocaleString()} likes</Text>
                  </Group>
                  <Group gap={4}>
                    <span style={{ fontSize: '1.5rem' }}>👁️</span>
                    <Text fw={600}>{selectedPost.viewCount.toLocaleString()} views</Text>
                  </Group>
                </Group>
              </Stack>
            </Stack>
          )}
        </Modal>
      </Container>
    </>
  );
}
