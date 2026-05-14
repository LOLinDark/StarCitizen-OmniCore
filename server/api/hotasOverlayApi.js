// Express route to save HOTAS overlay positions to JSON file (ESM version)
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Model-specific overlay path (X52)
const HOTAS_OVERLAY_PATH = path.join(__dirname, '../../app/data/hotas/overlays/hotas-x52-overlay-positions.jsonc');
const HOTAS_OVERLAY_BACKUP_DIR = path.join(__dirname, '../../app/data/hotas/overlays/backups');

function buildBackupStamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

export function registerHotasOverlayRoutes(app) {
  app.post('/api/hotas-overlay-positions', express.json({ limit: '1mb' }), (req, res) => {
    const overlays = req.body;
    if (!Array.isArray(overlays)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    try {
      fs.mkdirSync(HOTAS_OVERLAY_BACKUP_DIR, { recursive: true });

      // Keep a safety copy of the current persisted file before every overwrite.
      if (fs.existsSync(HOTAS_OVERLAY_PATH)) {
        const existingContents = fs.readFileSync(HOTAS_OVERLAY_PATH, 'utf8');
        const stamp = buildBackupStamp();
        const timestampedBackupPath = path.join(HOTAS_OVERLAY_BACKUP_DIR, `hotas-x52-overlay-positions.${stamp}.jsonc`);
        const latestBackupPath = path.join(HOTAS_OVERLAY_BACKUP_DIR, 'hotas-x52-overlay-positions.latest.jsonc');
        fs.writeFileSync(timestampedBackupPath, existingContents, 'utf8');
        fs.writeFileSync(latestBackupPath, existingContents, 'utf8');

        // Prune old timestamped backups — keep only the 3 most recent
        const MAX_BACKUPS = 3;
        const backups = fs.readdirSync(HOTAS_OVERLAY_BACKUP_DIR)
          .filter(f => f !== 'hotas-x52-overlay-positions.latest.jsonc' && f.endsWith('.jsonc'))
          .sort()
          .reverse();
        backups.slice(MAX_BACKUPS).forEach(f => {
          try { fs.unlinkSync(path.join(HOTAS_OVERLAY_BACKUP_DIR, f)); } catch { /* ignore */ }
        });
      }

      const serialized = JSON.stringify(overlays, null, 2);
      // Write directly — backup above already protects against data loss.
      // renameSync fails on Windows when destination is held open by editor.
      fs.writeFileSync(HOTAS_OVERLAY_PATH, serialized, 'utf8');

      return res.json({
        success: true,
        backupDir: HOTAS_OVERLAY_BACKUP_DIR,
      });
    } catch (error) {
      console.error('Failed to save overlay positions:', error);
      return res.status(500).json({
        error: 'Failed to save file',
        detail: error?.message || 'Unknown server error',
      });
    }
  });
}
