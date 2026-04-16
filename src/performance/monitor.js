import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { env } from '../core/config/env';
import { analytics } from '../analytics';

const snapshot = {
  started: false,
  enabled: env.VITE_PERF_MONITORING_ENABLED === 'true',
  metrics: {},
  samples: 0,
  lastUpdatedAt: null
};

function roundMetricValue(value) {
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
}

function updateMetric(metric) {
  snapshot.metrics[metric.name] = {
    value: roundMetricValue(metric.value),
    rating: metric.rating,
    navigationType: metric.navigationType
  };
  snapshot.samples += 1;
  snapshot.lastUpdatedAt = new Date().toISOString();

  analytics.track('perf.webvital.captured', {
    metric: metric.name,
    value: roundMetricValue(metric.value),
    rating: metric.rating,
    navType: metric.navigationType
  });
}

export function startPerformanceMonitoring() {
  if (snapshot.started || !snapshot.enabled) {
    return;
  }

  snapshot.started = true;

  onCLS(updateMetric);
  onINP(updateMetric);
  onLCP(updateMetric);
  onFCP(updateMetric);
  onTTFB(updateMetric);
}

export function getPerformanceSnapshot() {
  return {
    started: snapshot.started,
    enabled: snapshot.enabled,
    metrics: { ...snapshot.metrics },
    samples: snapshot.samples,
    lastUpdatedAt: snapshot.lastUpdatedAt
  };
}