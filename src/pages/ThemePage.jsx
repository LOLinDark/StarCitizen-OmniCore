import { Container, Title, Card, Stack, ColorPicker, Text, Button, Group, Select, Textarea, Badge, Paper, Switch, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';

export default function ThemePage() {
  const [primaryColor, setPrimaryColor] = useState('#f06595');
  const [radius, setRadius] = useState('md');
  const [fontFamily, setFontFamily] = useState('system-ui');
  const [voiceText, setVoiceText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('customTheme');
    if (saved) {
      const theme = JSON.parse(saved);
      setPrimaryColor(theme.primaryColor || '#f06595');
      setRadius(theme.radius || 'md');
      setFontFamily(theme.fontFamily || 'system-ui');
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(prev => prev ? prev + ' ' + transcript : transcript);
      };
      recog.onend = () => setIsListening(false);
      setRecognition(recog);
    }
  }, []);

  const toggleVoice = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const saveTheme = () => {
    const theme = { primaryColor, radius, fontFamily };
    localStorage.setItem('customTheme', JSON.stringify(theme));
    notifications.show({ title: 'Theme Saved', message: 'Reload page to apply changes', color: 'green' });
  };

  const resetTheme = () => {
    localStorage.removeItem('customTheme');
    setPrimaryColor('#f06595');
    setRadius('md');
    setFontFamily('system-ui');
    notifications.show({ title: 'Theme Reset', message: 'Reload page to apply changes', color: 'orange' });
  };

  return (
    <Container size="sm">
      <Title mb="md">Theme Customizer</Title>
      
      <Stack gap="md">
        <Card withBorder>
          <Title order={3} mb="md">Primary Color</Title>
          <ColorPicker value={primaryColor} onChange={setPrimaryColor} format="hex" fullWidth />
          <Text size="sm" c="dimmed" mt="xs">{primaryColor}</Text>
        </Card>

        <Card withBorder>
          <Title order={3} mb="md">Border Radius</Title>
          <Select
            value={radius}
            onChange={setRadius}
            data={[
              { value: 'xs', label: 'Extra Small' },
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
              { value: 'xl', label: 'Extra Large' }
            ]}
          />
        </Card>

        <Card withBorder>
          <Title order={3} mb="md">Font Family</Title>
          <Select
            value={fontFamily}
            onChange={setFontFamily}
            data={[
              { value: 'system-ui', label: 'System UI' },
              { value: 'Arial, sans-serif', label: 'Arial' },
              { value: 'Georgia, serif', label: 'Georgia' },
              { value: 'monospace', label: 'Monospace' }
            ]}
          />
        </Card>

        <Group>
          <Button onClick={saveTheme} flex={1}>Save Theme</Button>
          <Button onClick={resetTheme} color="red" variant="outline">Reset</Button>
        </Group>

        <Card withBorder>
          <Title order={3} mb="md">Voice Input Example</Title>
          <Text size="sm" c="dimmed" mb="md">Click the microphone to speak, click again to add more</Text>
          <Textarea
            placeholder="Voice input will appear here..."
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            minRows={3}
            mb="sm"
          />
          <Group>
            <Button onClick={toggleVoice} variant={isListening ? 'filled' : 'outline'} color={isListening ? 'red' : 'blue'}>
              {isListening ? '🎤 Listening...' : '🎤 Start Voice'}
            </Button>
            <Button onClick={() => setVoiceText('')} variant="light">Clear</Button>
          </Group>
          {!recognition && <Text size="xs" c="red" mt="xs">Voice not supported in this browser</Text>}
        </Card>

        <Card bg="gray.1" p="sm">
          <Text size="xs" c="dimmed">
            Note: Reload the page after saving to see theme changes applied.
          </Text>
        </Card>
      </Stack>
    </Container>
  );
}
