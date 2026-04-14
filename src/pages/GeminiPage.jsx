import { Container, Title, TextInput, Button, Paper, Text, Stack, Group, ActionIcon } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useAppStore } from '../stores';

export default function GeminiPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const logActivity = useAppStore((s) => s.logActivity);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
      };
      recog.onend = () => setIsListening(false);
      setRecognition(recog);
    }

    const handleKeyboard = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        sendMessage();
      }
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        toggleVoice();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
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

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    window.dispatchEvent(new Event('ai-request-start'));

    try {
      logActivity('API', 'POST /api/gemini');
      logActivity('DATA', `Sent: ${message.substring(0, 50)}...`);
      const response = await fetch('http://localhost:3001/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      logActivity('DATA', `Received: ${data.response?.substring(0, 50)}...`);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'No response' }]);
    } catch (error) {
      logActivity('ERROR', error.message);
      setMessages(prev => [...prev, { role: 'error', content: error.message }]);
    } finally {
      setLoading(false);
      window.dispatchEvent(new Event('ai-request-end'));
    }
  };

  return (
    <Container size="lg">
      <Title mb="md">Gemini Chat</Title>
      
      <Stack gap="md" mb="md" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {messages.map((msg, i) => (
          <Paper key={i} p="md" bg={msg.role === 'user' ? 'blue.0' : msg.role === 'error' ? 'red.0' : 'gray.0'}>
            <Text fw={700}>{msg.role === 'user' ? 'You' : msg.role === 'error' ? 'Error' : 'Gemini'}</Text>
            {/* SECURITY: AI responses are untrusted content. React JSX escapes text by default.
                Never use dangerouslySetInnerHTML here. */}
            <Text>{msg.content}</Text>
          </Paper>
        ))}
      </Stack>

      <TextInput
        placeholder="Type your message... (Ctrl+Enter to send, Ctrl+M for voice)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && !e.ctrlKey && sendMessage()}
        disabled={loading}
      />
      <Group mt="sm" gap="xs">
        <Button onClick={sendMessage} loading={loading} flex={1}>
          Send
        </Button>
        {recognition && (
          <ActionIcon size="lg" variant={isListening ? 'filled' : 'light'} color={isListening ? 'red' : 'blue'} onClick={toggleVoice}>
            🎤
          </ActionIcon>
        )}
        <Button variant="light" onClick={() => setMessage('Hello')}>Hello</Button>
        <Button variant="light" onClick={() => setMessage('Tell me a joke')}>Joke</Button>
        <Button variant="light" onClick={() => setMessage('Explain quantum physics')}>Explain</Button>
      </Group>
    </Container>
  );
}
