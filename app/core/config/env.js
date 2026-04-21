import { z } from 'zod';

const FlushIntervalSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === '') {
      return 30000;
    }

    return Number(value);
  },
  z.number().int().min(5000).max(300000)
);

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://localhost:3001'),
  VITE_ANALYTICS_ENABLED: z.enum(['true', 'false']).default('true'),
  VITE_ANALYTICS_ENDPOINT: z.string().default('http://localhost:3001/api/analytics/events'),
  VITE_ANALYTICS_APP_ID: z.string().default('omni-core'),
  VITE_ANALYTICS_FLUSH_INTERVAL_MS: FlushIntervalSchema.default(30000),
  VITE_PERF_MONITORING_ENABLED: z.enum(['true', 'false']).default('true')
});

const parsed = EnvSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(`Invalid environment config: ${parsed.error.message}`);
}

export const env = parsed.data;