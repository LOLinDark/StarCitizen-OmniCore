import {
  Container,
  SimpleGrid,
  Stack,
  Text,
  Tabs,
  Group,
  Badge,
  Modal,
  Center,
  Loader,
  Anchor,
  Alert,
  Card,
  TextInput,
  Select,
  Button,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import AerobookPost from '../components/AerobookPost';
import MediaPlayer from '../components/MediaPlayer';
import { fetchAerobookFeed, getCachedAerobookFeed } from '../core/api/providers/media';
import { addLiveFollow, fetchLiveFollows, fetchOfficialLive, removeLiveFollow } from '../core/api/providers/live';
import { createLogger } from '../core/debug/logger';
import { formatRelativeTime } from '../utils/time';
import DevTag from '../components/DevTag';

const logger = createLogger('page.aerobook');

const TAB_CONFIG = [
  { id: 'star-citizen', label: 'Star Citizen / Verse', icon: '🚀', color: '#00d9ff' },
  { id: 'squadron-42', label: 'Squadron 42', icon: '⚔️', color: '#ffd166' },
  { id: 'live', label: 'LIVE Follows', icon: '🎬', color: '#ff9e44' },
];

const LIVE_POLL_VISIBLE_MS = 60 * 1000;
const LIVE_POLL_HIDDEN_MS = 3 * 60 * 1000;

function resolveInitialTab(search) {
  const tab = new URLSearchParams(search).get('tab');
  return TAB_CONFIG.some((cfg) => cfg.id === tab) ? tab : 'star-citizen';
}

export default function AerobookPage() {
  const location = useLocation();
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTab, setActiveTab] = useState(resolveInitialTab(location.search));
  const [feed, setFeed] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedSource, setFeedSource] = useState('network');
  const [follows, setFollows] = useState([]);
  const [officialChannels, setOfficialChannels] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState('');
  const [liveCheckedAt, setLiveCheckedAt] = useState('');
  const [platform, setPlatform] = useState('twitch');
  const [username, setUsername] = useState('');

  const liveRefreshInFlightRef = useRef(false);
  const officialStateRef = useRef(new Map());

  useEffect(() => {
    setActiveTab(resolveInitialTab(location.search));
  }, [location.search]);

  useEffect(() => {
    let active = true;

    const cachedFeed = getCachedAerobookFeed();
    if (cachedFeed) {
      setFeed(cachedFeed);
      setFeedSource('cache');
      setIsLoading(false);
    }

    async function loadFeed() {
      setIsLoading(true);
      setError('');

      try {
        const payload = await fetchAerobookFeed({ limit: 24 });
        if (!active) {
          return;
        }

        setFeed(payload);
        setFeedSource(payload?.cacheSource || 'network');

        if (payload?.latestPublishedAt) {
          window.dispatchEvent(
            new CustomEvent('aerobook:seen-latest', {
              detail: { latestPublishedAt: payload.latestPublishedAt },
            })
          );
        }
      } catch (err) {
        logger.error('Failed to load Aerobook feed', err?.message || err);
        if (active) {
          setError('Failed to load media feed. Try again in a moment.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadFeed();
    return () => {
      active = false;
    };
  }, []);

  const notifyOfficialTransition = useCallback((official = []) => {
    official.forEach((channel) => {
      const key = channel.id || `${channel.platform}:${channel.username}`;
      const isLive = Boolean(channel?.status?.isLive);
      const previous = officialStateRef.current.get(key);

      if (previous && !previous.isLive && isLive) {
        const streamUrl = channel?.status?.stream?.url || channel?.url || '#';
        notifications.show({
          title: `${channel.label || channel.username} is LIVE`,
          message: channel?.status?.stream?.title || 'Official stream is now live.',
          color: 'green',
          autoClose: 10000,
          withCloseButton: true,
          onClick: () => {
            if (streamUrl && streamUrl !== '#') {
              window.open(streamUrl, '_blank', 'noopener,noreferrer');
            }
          },
        });
      }

      officialStateRef.current.set(key, { isLive, checkedAt: channel?.status?.checkedAt || '' });
    });
  }, []);

  const refreshLiveFollows = useCallback(async ({ silent = false } = {}) => {
    if (liveRefreshInFlightRef.current) {
      return;
    }

    liveRefreshInFlightRef.current = true;
    if (!silent) {
      setLiveLoading(true);
    }
    setLiveError('');

    try {
      const [followsPayload, officialPayload] = await Promise.all([fetchLiveFollows(), fetchOfficialLive()]);
      setFollows(followsPayload?.follows || []);
      setOfficialChannels(officialPayload?.official || []);
      setLiveCheckedAt(officialPayload?.checkedAt || followsPayload?.checkedAt || new Date().toISOString());
      notifyOfficialTransition(officialPayload?.official || []);
    } catch (err) {
      logger.error('Failed to load LIVE follows', err?.message || err);
      setLiveError('Failed to load followed channels.');
    } finally {
      liveRefreshInFlightRef.current = false;
      if (!silent) {
        setLiveLoading(false);
      }
    }
  }, [notifyOfficialTransition]);

  useEffect(() => {
    if (activeTab !== 'live') {
      return undefined;
    }

    let disposed = false;
    let timerId = null;

    const runRefresh = async ({ silent }) => {
      if (disposed) {
        return;
      }

      await refreshLiveFollows({ silent });

      if (disposed) {
        return;
      }

      const delay = document.visibilityState === 'visible' ? LIVE_POLL_VISIBLE_MS : LIVE_POLL_HIDDEN_MS;
      timerId = window.setTimeout(() => {
        runRefresh({ silent: true });
      }, delay);
    };

    const handleVisibilityChange = () => {
      if (disposed) {
        return;
      }

      if (timerId) {
        window.clearTimeout(timerId);
      }
      runRefresh({ silent: true });
    };

    runRefresh({ silent: false });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      disposed = true;
      if (timerId) {
        window.clearTimeout(timerId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTab, refreshLiveFollows]);

  async function handleAddFollow() {
    if (!username.trim()) {
      setLiveError('Enter a streamer username first.');
      return;
    }

    setLiveError('');
    try {
      await addLiveFollow({ platform, username });
      setUsername('');
      await refreshLiveFollows();
    } catch (err) {
      setLiveError(err?.message || 'Failed to add followed channel.');
    }
  }

  async function handleRemoveFollow(followId) {
    setLiveError('');
    try {
      await removeLiveFollow({ followId });
      await refreshLiveFollows();
    } catch (err) {
      setLiveError(err?.message || 'Failed to remove followed channel.');
    }
  }

  const featuredPost = useMemo(() => {
    return feed?.latestVideo || null;
  }, [feed]);

  const totalCount = (feed?.categories?.['star-citizen']?.length || 0) + (feed?.categories?.['squadron-42']?.length || 0);

  const featuredTime = featuredPost ? formatRelativeTime(featuredPost.publishedAt) : '';

  return (
    <Container size="xl" py="xl" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Stack gap="md" mb="xl">
          <div>
            <Group gap="sm" mb="xs">
              <Text size="xl" fw={700} style={{ color: '#00d9ff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <DevTag tag="APP02" />📸 Aerobook
              </Text>
              <Badge color="cyan" variant="light">
                {feedSource === 'cache' ? 'Cached Feed' : 'Live Feed'}
              </Badge>
              <Badge color="green" variant="light">
                {totalCount} videos
              </Badge>
              {feedSource === 'cache' && (
                <Badge color="orange" variant="light">
                  Offline-ready metadata
                </Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed">
              Latest media from RSI YouTube, Star Citizen Twitch archives, and Squadron 42 playlist.
            </Text>
            <Group gap="sm" mt="xs">
              <Anchor href="https://www.youtube.com/@RobertsSpaceInd" target="_blank" rel="noreferrer" size="xs">
                RSI YouTube
              </Anchor>
              <Anchor href="https://www.twitch.tv/starcitizen/videos" target="_blank" rel="noreferrer" size="xs">
                Star Citizen Twitch
              </Anchor>
              <Anchor href="https://www.youtube.com/playlist?list=PLVct2QDhDrB2-Edu0jm18lz0W9NRcXy3Y" target="_blank" rel="noreferrer" size="xs">
                Squadron 42 Playlist
              </Anchor>
            </Group>
          </div>

          {error && (
            <Alert color="red" variant="light" title="Feed unavailable">
              {error}
            </Alert>
          )}

          {isLoading && (
            <Center py="lg">
              <Loader size="sm" />
            </Center>
          )}

          {/* Featured Post (latest across all sources) */}
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
                  <MediaPlayer post={featuredPost} autoplay={false} />
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
                            {featuredPost.creatorHandle || featuredPost.creatorName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {featuredTime}
                          </Text>
                        </Stack>
                      </Group>
                      <Text size="lg" fw={600} style={{ color: '#00d9ff' }}>
                        {featuredPost.title}
                      </Text>
                      <Group gap="lg">
                        <Group gap={4}>
                          <span style={{ fontSize: '1.2rem' }}>👁️</span>
                          <Text size="sm" fw={600}>
                            {(featuredPost.viewCount || 0).toLocaleString()} views
                          </Text>
                        </Group>
                        <Badge size="sm" variant="light" color={featuredPost.source === 'twitch' ? 'violet' : 'red'}>
                          {featuredPost.source === 'twitch' ? 'Twitch' : 'YouTube'}
                        </Badge>
                      </Group>
                    </Stack>
                  </Group>
                </Stack>
              </Stack>
            </div>
          )}
        </Stack>

        {/* Category Tabs */}
        <Tabs
          value={activeTab}
          onTabChange={(value) => setActiveTab(value || 'star-citizen')}
          style={{ marginBottom: '2rem' }}
        >
          <Tabs.List style={{ borderBottom: '1px solid rgba(0, 217, 255, 0.2)' }}>
            {TAB_CONFIG.map((cat) => (
              <Tabs.Tab
                key={cat.id}
                value={cat.id}
                leftSection={<span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>}
                style={{
                  color: activeTab === cat.id ? cat.color : 'rgba(255,255,255,0.5)',
                  borderBottomColor: activeTab === cat.id ? cat.color : 'transparent',
                }}
              >
                {cat.label} ({feed?.categories?.[cat.id]?.length || 0})
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {/* Star Citizen Tab Content */}
          <Tabs.Panel value="star-citizen" pt="xl">
            {feed?.categories?.['star-citizen']?.length > 0 ? (
              <SimpleGrid
                cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
                spacing="md"
                style={{ marginBottom: '2rem' }}
              >
                {feed.categories['star-citizen'].map((post) => (
                  <AerobookPost key={post.id} post={post} onSelect={setSelectedPost} />
                ))}
              </SimpleGrid>
            ) : (
              <Center py="xl">
                <Text c="dimmed">No content available for Star Citizen yet.</Text>
              </Center>
            )}
          </Tabs.Panel>

          {/* Squadron 42 Tab Content */}
          <Tabs.Panel value="squadron-42" pt="xl">
            {feed?.categories?.['squadron-42']?.length > 0 ? (
              <SimpleGrid
                cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
                spacing="md"
                style={{ marginBottom: '2rem' }}
              >
                {feed.categories['squadron-42'].map((post) => (
                  <AerobookPost key={post.id} post={post} onSelect={setSelectedPost} />
                ))}
              </SimpleGrid>
            ) : (
              <Center py="xl">
                <Text c="dimmed">No content available for Squadron 42 yet.</Text>
              </Center>
            )}
          </Tabs.Panel>

          {/* LIVE Tab Content */}
          <Tabs.Panel value="live" pt="xl">
            <Stack gap="md" mb="md">
              <Card withBorder>
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text fw={700}>Official Stream Monitor</Text>
                    <Badge color="blue" variant="light">Auto-monitoring</Badge>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Phase 1 alerting is active: when the official channel changes from offline to live, OmniCore posts a LIVE notification.
                  </Text>
                  {officialChannels.length > 0 ? (
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
                      {officialChannels.map((channel) => {
                        const status = channel.status || {};
                        const isLive = Boolean(status.isLive);
                        const isSoon = Boolean(status?.upcoming?.isSoon);

                        return (
                          <Card key={channel.id} withBorder>
                            <Stack gap="xs">
                              <Group justify="space-between">
                                <Text fw={700}>{channel.label}</Text>
                                <Badge color={isLive ? 'green' : isSoon ? 'yellow' : 'gray'}>
                                  {isLive ? 'LIVE' : isSoon ? 'Going Live Soon' : 'Offline'}
                                </Badge>
                              </Group>
                              <Text size="sm" c="dimmed">@{channel.username} on {channel.platform}</Text>
                              {status?.stream?.title && (
                                <Text size="sm" fw={600}>{status.stream.title}</Text>
                              )}
                              {status?.upcoming?.message && !isLive && (
                                <Text size="sm" c="dimmed">{status.upcoming.message}</Text>
                              )}
                              <Group justify="space-between" mt="xs">
                                <Text size="xs" c="dimmed">
                                  Last check: {status.checkedAt ? formatRelativeTime(status.checkedAt) : 'just now'}
                                </Text>
                                <Anchor href={status?.stream?.url || channel.url} target="_blank" rel="noreferrer" size="sm">
                                  Open channel
                                </Anchor>
                              </Group>
                            </Stack>
                          </Card>
                        );
                      })}
                    </SimpleGrid>
                  ) : (
                    <Text size="sm" c="dimmed">No official channels configured yet.</Text>
                  )}
                  <Text size="xs" c="dimmed">
                    Reliability layer: visible-tab refresh every 60s, background refresh every 3m, with transition detection to avoid duplicate alerts.
                  </Text>
                </Stack>
              </Card>

              <Card withBorder>
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text fw={700}>Follow Streamers</Text>
                    <Text size="xs" c="dimmed">Cross-provider API shape enabled</Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Add creators by username and platform. Twitch live status is active now. YouTube/Kick/Steam follow the same response model for upcoming provider parity.
                  </Text>
                  <Group align="flex-end" wrap="wrap">
                    <Select
                      label="Platform"
                      value={platform}
                      onChange={(value) => setPlatform(value || 'twitch')}
                      data={[
                        { value: 'twitch', label: 'Twitch (live status available)' },
                        { value: 'youtube', label: 'YouTube (stored for parity)' },
                        { value: 'kick', label: 'Kick (stored for parity)' },
                        { value: 'steam', label: 'Steam (stored for parity)' },
                      ]}
                      w={280}
                    />
                    <TextInput
                      label="Username"
                      placeholder="example: starcitizen"
                      value={username}
                      onChange={(e) => setUsername(e.currentTarget.value)}
                      w={260}
                    />
                    <Button color="orange" variant="light" onClick={handleAddFollow}>
                      Add Follow
                    </Button>
                    <Button variant="subtle" onClick={() => refreshLiveFollows({ silent: false })}>
                      Refresh
                    </Button>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Last synced: {liveCheckedAt ? new Date(liveCheckedAt).toLocaleTimeString() : 'pending...'}
                  </Text>
                </Stack>
              </Card>

              {liveError && (
                <Alert color="red" variant="light" title="LIVE follows">
                  {liveError}
                </Alert>
              )}

              {liveLoading && (
                <Center py="lg">
                  <Loader size="sm" />
                </Center>
              )}

              {!liveLoading && follows.length === 0 && (
                <Center py="xl">
                  <Text c="dimmed">No followed channels yet. Add your first streamer above.</Text>
                </Center>
              )}

              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                {follows.map((item) => {
                  const status = item.status || {};
                  const isLive = Boolean(status.isLive);
                  const isSoon = Boolean(status?.upcoming?.isSoon);
                  return (
                    <Card key={item.id} withBorder>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text fw={700}>@{item.username}</Text>
                          <Badge color={isLive ? 'green' : isSoon ? 'yellow' : 'gray'}>
                            {isLive ? 'LIVE' : isSoon ? 'Going Live Soon' : 'Offline'}
                          </Badge>
                        </Group>
                        <Badge variant="light" color="orange" w="fit-content">
                          {item.platform}
                        </Badge>

                        {isLive && status.stream && (
                          <>
                            <Text size="sm" fw={600}>{status.stream.title}</Text>
                            <Text size="sm" c="dimmed">
                              {status.stream.gameName || 'Unknown game'} • {status.stream.viewersCount || 0} viewers
                            </Text>
                            <Anchor href={status.stream.url} target="_blank" rel="noreferrer" size="sm">
                              Open stream
                            </Anchor>
                          </>
                        )}

                        {!isLive && status.upcoming?.message && (
                          <Text size="sm" c="dimmed">{status.upcoming.message}</Text>
                        )}

                        {!isLive && status.unsupported && (
                          <Text size="sm" c="dimmed">Stored for future provider support.</Text>
                        )}

                        {status.error && (
                          <Text size="sm" c="red">{status.error}</Text>
                        )}

                        <Group justify="space-between" mt="xs">
                          <Text size="xs" c="dimmed">
                            {status.checkedAt ? `Checked ${formatRelativeTime(status.checkedAt)}` : (item.createdAt ? formatRelativeTime(item.createdAt) : '')}
                          </Text>
                          <Button size="xs" color="red" variant="subtle" onClick={() => handleRemoveFollow(item.id)}>
                            Remove
                          </Button>
                        </Group>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Stack>
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
                    {formatRelativeTime(selectedPost.publishedAt || selectedPost.timestamp)}
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
                <MediaPlayer post={selectedPost} autoplay />
              </div>
              <Stack gap="xs">
                <Text size="lg" fw={700} style={{ color: '#00d9ff' }}>
                  {selectedPost.title}
                </Text>
                <Group gap="lg">
                  <Group gap={4}>
                    <span style={{ fontSize: '1.5rem' }}>👁️</span>
                    <Text fw={600}>{(selectedPost.viewCount || 0).toLocaleString()} views</Text>
                  </Group>
                  <Badge size="sm" variant="light" color={selectedPost.source === 'twitch' ? 'violet' : 'red'}>
                    {selectedPost.source === 'twitch' ? 'Twitch' : 'YouTube'}
                  </Badge>
                </Group>
              </Stack>
            </Stack>
          )}
        </Modal>
    </Container>
  );
}
