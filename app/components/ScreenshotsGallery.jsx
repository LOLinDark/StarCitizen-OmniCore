import { SimpleGrid, Image, Modal, Box, Group, Text, Button } from '@mantine/core';
import { useState } from 'react';
import classes from './ScreenshotsGallery.module.css';

export default function ScreenshotsGallery({ screenshots = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (screenshots.length === 0) {
    return (
      <Box p="lg" ta="center">
        <Text c="dimmed">No screenshots available yet</Text>
      </Box>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {screenshots.map((screenshot, idx) => (
          <div
            key={idx}
            onClick={() => {
              setSelectedImage(screenshot);
              setCurrentIndex(idx);
            }}
            className={classes.imageWrapper}
          >
            <Image
              src={screenshot.src}
              alt={screenshot.alt || `Screenshot ${idx + 1}`}
              height={200}
              fit="cover"
              className={classes.thumbnail}
            />
            {screenshot.title && (
              <Text size="sm" mt="xs" fw={500}>
                {screenshot.title}
              </Text>
            )}
            {screenshot.description && (
              <Text size="xs" c="dimmed" lineClamp={2}>
                {screenshot.description}
              </Text>
            )}
          </div>
        ))}
      </SimpleGrid>

      <Modal
        opened={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        size="lg"
        title={screenshots[currentIndex]?.title}
        centered
      >
        <Box>
          <Image
            src={screenshots[currentIndex]?.src}
            alt={screenshots[currentIndex]?.alt || 'Screenshot'}
            fit="contain"
          />
          {screenshots[currentIndex]?.description && (
            <Text mt="md" size="sm">
              {screenshots[currentIndex].description}
            </Text>
          )}
          {screenshots.length > 1 && (
            <Group justify="space-between" mt="md">
              <Button variant="light" onClick={handlePrev}>
                Previous
              </Button>
              <Text size="sm">
                {currentIndex + 1} of {screenshots.length}
              </Text>
              <Button variant="light" onClick={handleNext}>
                Next
              </Button>
            </Group>
          )}
        </Box>
      </Modal>
    </>
  );
}
