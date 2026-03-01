interface AmplitudeInstance {
  track: (eventType: string, eventProperties?: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    amplitude?: AmplitudeInstance;
    sessionReplay?: { plugin: (config: { sampleRate: number }) => unknown };
  }
}

function track(eventType: string, properties: Record<string, unknown>) {
  window.amplitude?.track(eventType, properties);
}

export function trackTimerStarted(projectName: string, isBillable: boolean) {
  track('Timer Started', {
    project_name: projectName,
    is_billable: isBillable,
  });
}

export function trackTimerPaused(
  projectName: string,
  isBillable: boolean,
  durationSeconds: number
) {
  track('Timer Paused', {
    project_name: projectName,
    is_billable: isBillable,
    duration_seconds: durationSeconds,
  });
}

export function trackTimerStopped(
  projectName: string,
  isBillable: boolean,
  durationSeconds: number
) {
  track('Timer Stopped', {
    project_name: projectName,
    is_billable: isBillable,
    duration_seconds: durationSeconds,
  });
}

export function trackNoteViewed(projectName: string, isBillable: boolean) {
  track('Note Viewed', {
    project_name: projectName,
    is_billable: isBillable,
  });
}

export function trackNoteSubmitted(projectName: string, noteText: string) {
  track('Note Submitted', {
    project_name: projectName,
    note_text: noteText,
  });
}

export function trackProjectAdded(projectName: string, isBillable: boolean) {
  track('Project Added', {
    project_name: projectName,
    is_billable: isBillable,
  });
}

export function trackProjectDeleted(projectName: string) {
  track('Project Deleted', {
    project_name: projectName,
  });
}
