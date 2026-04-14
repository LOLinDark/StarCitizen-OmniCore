import { Container, Title, Card, Text, Stack, Group, Badge, Button, Select, Timeline } from '@mantine/core';
import { useState, useEffect } from 'react';
import { historyManager } from '../utils/historyManager';

export default function HistoryPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [history, setHistory] = useState({});

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (selectedDoc) {
      setHistory(historyManager.getHistory(selectedDoc));
    }
  }, [selectedDoc]);

  const loadDocuments = () => {
    const docs = historyManager.getAllDocuments();
    setDocuments(docs);
    if (docs.length > 0 && !selectedDoc) {
      setSelectedDoc(docs[0]);
    }
  };

  const handleRollback = (fieldName, changeId) => {
    const value = historyManager.rollback(selectedDoc, fieldName, changeId);
    if (value !== null) {
      setHistory(historyManager.getHistory(selectedDoc));
    }
  };

  const formatTimestamp = (iso) => {
    const date = new Date(iso);
    return date.toLocaleString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSourceColor = (source) => {
    switch(source) {
      case 'user': return 'blue';
      case 'ai': return 'pink';
      case 'rollback': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="md">
        <Title>Field History</Title>
        <Select
          placeholder="Select document"
          value={selectedDoc}
          onChange={setSelectedDoc}
          data={documents.map(d => ({ value: d, label: d }))}
          style={{ width: 300 }}
        />
      </Group>

      {selectedDoc && Object.keys(history).length === 0 && (
        <Text c="dimmed">No history for this document</Text>
      )}

      {selectedDoc && Object.keys(history).length > 0 && (
        <Stack gap="lg">
          {Object.entries(history).map(([fieldName, changes]) => (
            <Card key={fieldName} withBorder p="lg">
              <Title order={3} mb="md">{fieldName}</Title>
              <Timeline active={changes.length} bulletSize={24} lineWidth={2}>
                {changes.map((change, idx) => (
                  <Timeline.Item
                    key={change.id}
                    bullet={change.source === 'ai' ? '🤖' : change.source === 'rollback' ? '↩️' : '👤'}
                    title={
                      <Group gap="xs">
                        <Badge color={getSourceColor(change.source)}>{change.source}</Badge>
                        <Text size="sm" c="dimmed">{formatTimestamp(change.timestamp)}</Text>
                      </Group>
                    }
                  >
                    <Card withBorder p="sm" mt="xs" mb="md">
                      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{change.value}</Text>
                      {change.metadata && Object.keys(change.metadata).length > 0 && (
                        <Text size="xs" c="dimmed" mt="xs">
                          {JSON.stringify(change.metadata, null, 2)}
                        </Text>
                      )}
                      {idx !== changes.length - 1 && (
                        <Button 
                          size="xs" 
                          variant="light" 
                          mt="xs"
                          onClick={() => handleRollback(fieldName, change.id)}
                        >
                          Rollback to this version
                        </Button>
                      )}
                    </Card>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
