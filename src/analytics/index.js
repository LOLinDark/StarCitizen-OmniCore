import { env } from '../core/config/env';
import { createAnalyticsClient } from './client';

export const analytics = createAnalyticsClient({
  appId: env.VITE_ANALYTICS_APP_ID,
  endpoint: env.VITE_ANALYTICS_ENDPOINT,
  enabled: env.VITE_ANALYTICS_ENABLED === 'true',
  flushIntervalMs: env.VITE_ANALYTICS_FLUSH_INTERVAL_MS
});

analytics.start();

export function trackAppView(pathname = window.location.pathname || '/') {
  analytics.track('app.viewed', {
    path: pathname,
    hash: window.location.hash || ''
  });
}

export function trackApiCall(path, method, status) {
  analytics.track('api.call.completed', {
    path,
    method,
    status
  });
}

export function trackUiAction(name, properties = {}) {
  analytics.track(name, properties);
}