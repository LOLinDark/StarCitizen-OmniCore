import { Container, Title, TextInput, Button, Paper, Text, Stack, Group, Badge, Switch, Loader, FileInput, ActionIcon } from '@mantine/core';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch, apiGet, apiPost, appendErrorLog, usePromptStore } from '../platform-core';
import DevTag from '../components/DevTag';

export default function AmazonQPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(null);
    const activePrompt = usePromptStore((state) => state.getActivePrompt());

  const [streaming, setStreaming] = useState(true);
  const [streamingText, setStreamingText] = useState('');
  const [image, setImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMessages = searchTerm
    ? messages.filter(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
    : messages;

  const toggleVoice = useCallback(() => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  }, [isListening, recognition]);

  // Fetch usage stats
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setUsage(await apiGet('/api/usage'));
      } catch {
        // Silently fail - server might not be running
      }
    };
    fetchUsage();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchUsage();
      }
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!message.trim() && !image) return;

    const imageUrl = image ? URL.createObjectURL(image) : null;
    const userMessage = { role: 'user', content: message, image: imageUrl };
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    const currentImage = image;
    setMessage('');
    setImage(null);
    setLoading(true);
    setStreamingText('');

    try {
      let body = { 
        message: currentMessage,
        conversationHistory: messages,
        systemPrompt: activePrompt?.systemPrompt,
        stream: streaming
      };
      
      if (currentImage) {
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(currentImage);
        });
        body.image = base64;
      }
      if (streaming && !currentImage) {
        const response = await apiFetch('/api/chat', {
          method: 'POST',
          body,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || `Request failed with ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let usage = null;
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
          
          for (const line of lines) {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              fullText += data.text;
              setStreamingText(fullText);
            }
            if (data.done) {
              usage = data.usage;
            }
          }
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: fullText, usage }]);
        setStreamingText('');
      } else {
        const data = await apiPost('/api/chat', body);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.systemMessage || 'No response',
          usage: data.usage
        }]);
      }
      
      setUsage(await apiGet('/api/usage'));
    } catch (error) {
      appendErrorLog({
        page: '/admin/chat/claude',
        button: 'sendMessage',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      setMessages(prev => [...prev, { role: 'error', content: error.message }]);
    } finally {
      setLoading(false);
    }
  }, [activePrompt?.systemPrompt, image, message, messages, streaming]);

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

    const handleKeyboard = (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        sendMessage();
      }
      if (event.ctrlKey && event.key === 'm') {
        event.preventDefault();
        toggleVoice();
      }
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        document.querySelector('input[placeholder*="Search"]')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [sendMessage, toggleVoice]);

  return (
    <Container size="lg">
      <Group justify="space-between" mb="md">
        <Title><DevTag tag="ADM06" />Claude Opus 4.5 Chat</Title>
        <Group gap="xs">
          <Switch label="Stream" checked={streaming} onChange={(e) => setStreaming(e.currentTarget.checked)} size="sm" />
          {usage && (
            <>
              <Badge>Requests: {usage.totalRequests}</Badge>
              <Badge>Tokens: {usage.totalTokens}</Badge>
              <Badge color="green">Cost: ${usage.totalCost?.toFixed(4) || '0.0000'}</Badge>
            </>
          )}
        </Group>
      </Group>
      
      <TextInput
        placeholder="Search messages... (Ctrl+F)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        mb="md"
      />
      
      {activePrompt && (
        <Paper p="sm" mb="md" bg="blue.0">
          <Text size="sm" fw={500}>Active Prompt: {activePrompt.name}</Text>
          <Text size="xs" c="dimmed">{activePrompt.description}</Text>
        </Paper>
      )}
      
      <Stack gap="md" mb="md" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {filteredMessages.map((msg, i) => (
          <Paper key={i} p="md" bg={msg.role === 'user' ? 'blue.0' : msg.role === 'error' ? 'red.0' : 'gray.0'}>
            <Group justify="space-between">
              <Text fw={700}>{msg.role === 'user' ? 'You' : msg.role === 'error' ? 'Error' : 'Claude'}</Text>
              {msg.usage && (
                <Text size="xs" c="dimmed">{msg.usage.totalTokens} tokens</Text>
              )}
            </Group>
            {msg.image && <img src={msg.image} alt="uploaded" style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '8px' }} />}
            {/* SECURITY: AI responses are untrusted content. React JSX escapes text by default.
                Never use dangerouslySetInnerHTML here. If markdown rendering is needed,
                use a sanitizing library like DOMPurify + react-markdown. */}
            <Text>{msg.content}</Text>
          </Paper>
        ))}
        {streamingText && (
          <Paper p="md" bg="gray.0">
            <Group>
              <Text fw={700}>Claude</Text>
              <Loader size="xs" />
            </Group>
            <Text>{streamingText}</Text>
          </Paper>
        )}
      </Stack>

      <FileInput
        placeholder="Upload image (optional)"
        value={image}
        onChange={setImage}
        accept="image/*"
        clearable
        mb="sm"
      />
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
        <Button variant="outline" onClick={() => {
          const data = JSON.stringify({ messages, activePrompt, timestamp: new Date().toISOString() }, null, 2);
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chat-${Date.now()}.json`;
          a.click();
        }}>Export JSON</Button>
        <Button variant="outline" onClick={() => {
          const md = messages.map(m => `**${m.role === 'user' ? 'You' : 'Claude'}**: ${m.content}`).join('\n\n');
          const blob = new Blob([md], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chat-${Date.now()}.md`;
          a.click();
        }}>Export MD</Button>
        <Button variant="outline" color="red" onClick={() => {
          // SECURITY: Revoke object URLs to prevent memory leaks
          messages.forEach(m => { if (m.image) URL.revokeObjectURL(m.image); });
          setMessages([]);
        }}>Clear</Button>
      </Group>
    </Container>
  );
}
