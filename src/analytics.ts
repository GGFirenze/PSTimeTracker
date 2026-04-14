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

export type TimerSource = 'main' | 'pip_widget';

export function trackTimerStarted(projectName: string, isBillable: boolean, source: TimerSource) {
  track('Timer Started', {
    project_name: projectName,
    is_billable: isBillable,
    source,
  });
}

export function trackTimerPaused(
  projectName: string,
  isBillable: boolean,
  durationSeconds: number,
  source: TimerSource
) {
  track('Timer Paused', {
    project_name: projectName,
    is_billable: isBillable,
    duration_seconds: durationSeconds,
    source,
  });
}

export function trackTimerStopped(
  projectName: string,
  isBillable: boolean,
  durationSeconds: number,
  source: TimerSource
) {
  track('Timer Stopped', {
    project_name: projectName,
    is_billable: isBillable,
    duration_seconds: durationSeconds,
    source,
  });
}

export function trackPopOutClicked() {
  track('Pop Out Clicked', {});
}

export function trackNoteViewed(projectName: string, isBillable: boolean) {
  track('Note Viewed', {
    project_name: projectName,
    is_billable: isBillable,
  });
}

export function trackNoteSubmitted(projectName: string, isBillable: boolean, noteText: string) {
  track('Note Submitted', {
    project_name: projectName,
    is_billable: isBillable,
    note_text: noteText,
  });
}

export function trackNoteSkipped(projectName: string, isBillable: boolean) {
  track('Note Skipped', {
    project_name: projectName,
    is_billable: isBillable,
  });
}

export function trackProjectAdded(projectName: string, isBillable: boolean) {
  track('Project Added', {
    project_name: projectName,
    is_billable: isBillable,
  });
}

export function trackProjectDeleted(projectName: string, isBillable: boolean) {
  track('Project Deleted', {
    project_name: projectName,
    is_billable: isBillable,
  });
}

export function trackCalendarOpened() {
  track('Calendar Opened', {});
}

export function trackCalendarCollapsed() {
  track('Calendar Collapsed', {});
}
