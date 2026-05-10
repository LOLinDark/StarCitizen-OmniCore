// Express route to save HOTAS overlay positions to JSON file (ESM version)
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Adjust this path if your project structure changes
const HOTAS_OVERLAY_PATH = path.join(__dirname, '../../app/data/hotas-overlay-positions.json');

router.post('/api/hotas-overlay-positions', express.json({ limit: '1mb' }), (req, res) => {
  const overlays = req.body;
  if (!Array.isArray(overlays)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }
  fs.writeFile(HOTAS_OVERLAY_PATH, JSON.stringify(overlays, null, 2), (err) => {
    if (err) {
      console.error('Failed to save overlay positions:', err);
      return res.status(500).json({ error: 'Failed to save file' });
    }
    res.json({ success: true });
  });
});

export default router;
