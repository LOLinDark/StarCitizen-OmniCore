function createTimestamp() {
  return new Date().toISOString();
}

function sanitizeFilenameSegment(value) {
  return String(value).replace(/[^a-z0-9_-]+/gi, '-').replace(/-+/g, '-').toLowerCase();
}

function createReportEnvelope({ appId, context, readiness, telemetry, runtime, diagnostics, activity }) {
  return {
    schemaVersion: 'runtime-report.v1',
    generatedAt: createTimestamp(),
    app: {
      id: appId,
      context
    },
    readiness,
    telemetry,
    runtime,
    diagnostics,
    activity
  };
}

export function assessRuntimeReadiness({ usage, pricing, telemetry, performance, analyticsSummary }) {
  const warnings = [];
  const blockers = [];

  if (!telemetry?.enabled) {
    warnings.push('Frontend analytics disabled');
  }

  if (telemetry?.enabled && !telemetry?.endpointConfigured) {
    warnings.push('Analytics queue is local only');
  }

  if (telemetry?.droppedCount > 0) {
    warnings.push(`Dropped analytics events: ${telemetry.droppedCount}`);
  }

  if (!performance?.started) {
    warnings.push('Web vitals monitoring not active');
  }

  if (pricing && usage) {
    const threshold = Number(pricing.threshold || 0);
    const totalCost = Number(usage.totalCost || 0);

    if (threshold > 0 && totalCost >= threshold) {
      blockers.push('Cost threshold reached');
    } else if (threshold > 0 && totalCost >= threshold * 0.75) {
      warnings.push('Cost usage above 75% threshold');
    }
  }

  if (analyticsSummary && !analyticsSummary.lastEventAt) {
    warnings.push('Server analytics has not received events yet');
  }

  let level = 'ready';
  if (blockers.length > 0) {
    level = 'blocked';
  } else if (warnings.length > 0) {
    level = 'warning';
  }

  return {
    level,
    blockers,
    warnings,
    summary: blockers[0] || warnings[0] || 'Runtime posture looks healthy'
  };
}

export function buildRuntimeReport({
  usage,
  pricing,
  telemetry,
  performance,
  analyticsSummary,
  route = '/'
}) {
  const readiness = assessRuntimeReadiness({ usage, pricing, telemetry, performance, analyticsSummary });

  return createReportEnvelope({
    appId: 'omni-core',
    context: { route },
    readiness,
    telemetry: {
      analytics: telemetry,
      performance,
      serverAnalytics: analyticsSummary
    },
    runtime: {
      health: null,
      usage,
      pricing,
      theme: null
    },
    diagnostics: {
      errors: [],
      themeDiagnostics: []
    },
    activity: {
      recent: []
    }
  });
}

export function buildSupportBundle({ runtimeReport, errors = [] }) {
  return {
    schemaVersion: 'support-bundle.v1',
    generatedAt: createTimestamp(),
    app: runtimeReport.app,
    readiness: runtimeReport.readiness,
    runtimeReport,
    diagnostics: {
      errors: errors.slice(0, 20)
    }
  };
}

export function downloadRuntimeReport(report, name = 'omni-core-runtime-report') {
  const payload = JSON.stringify(report, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilenameSegment(name)}-${Date.now()}.json`;
  link.click();
  window.URL.revokeObjectURL(url);
}

export async function copyRuntimeReport(report) {
  const payload = JSON.stringify(report, null, 2);
  await navigator.clipboard.writeText(payload);
}