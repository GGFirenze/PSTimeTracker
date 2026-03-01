import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { TimeEntry } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId, isToday } from '../hooks/useTimer';
import { useProjectContext } from './ProjectContext';
import {
  trackTimerStarted,
  trackTimerPaused,
  trackTimerStopped,
} from '../analytics';

interface PendingStop {
  entry: TimeEntry;
}

interface TimerContextValue {
  currentEntry: TimeEntry | null;
  entries: TimeEntry[];
  pendingStop: PendingStop | null;

  startTimer: (projectId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  requestStop: () => void;
  confirmStop: (note: string) => void;
  cancelStop: () => void;
  deleteEntry: (entryId: string) => void;

  todayEntries: TimeEntry[];
  todayBillableSeconds: number;
  todayNonBillableSeconds: number;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function useTimerContext(): TimerContextValue {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimerContext must be used within TimerProvider');
  return ctx;
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const { getProject } = useProjectContext();

  const [currentEntry, setCurrentEntry] = useLocalStorage<TimeEntry | null>(
    'ps-timer-current',
    null
  );
  const [entries, setEntries] = useLocalStorage<TimeEntry[]>(
    'ps-timer-entries',
    []
  );
  const [pendingStop, setPendingStop] = useState<PendingStop | null>(null);

  const startTimer = useCallback(
    (projectId: string) => {
      const newProject = getProject(projectId);

      if (currentEntry) {
        const now = Date.now();
        const effectiveEnd = currentEntry.pausedAt ?? now;
        const elapsedMs =
          effectiveEnd - currentEntry.startTime - currentEntry.totalPausedMs;
        const prevProject = getProject(currentEntry.projectId);
        const completed: TimeEntry = {
          ...currentEntry,
          endTime: now,
          totalSeconds: Math.max(0, Math.floor(elapsedMs / 1000)),
          pausedAt: null,
          status: 'completed',
        };

        if (prevProject) {
          trackTimerStopped(
            prevProject.name,
            prevProject.category === 'billable',
            completed.totalSeconds
          );
        }

        setPendingStop({
          entry: completed,
        });

        const newEntry: TimeEntry = {
          id: generateId(),
          projectId,
          startTime: now,
          endTime: null,
          totalSeconds: 0,
          pausedAt: null,
          totalPausedMs: 0,
          status: 'active',
          note: '',
        };
        setCurrentEntry(newEntry);

        if (newProject) {
          trackTimerStarted(newProject.name, newProject.category === 'billable');
        }
        return;
      }

      const newEntry: TimeEntry = {
        id: generateId(),
        projectId,
        startTime: Date.now(),
        endTime: null,
        totalSeconds: 0,
        pausedAt: null,
        totalPausedMs: 0,
        status: 'active',
        note: '',
      };
      setCurrentEntry(newEntry);

      if (newProject) {
        trackTimerStarted(newProject.name, newProject.category === 'billable');
      }
    },
    [currentEntry, setCurrentEntry, getProject]
  );

  const pauseTimer = useCallback(() => {
    if (!currentEntry || currentEntry.status !== 'active') return;
    const now = Date.now();
    const elapsedMs = now - currentEntry.startTime - currentEntry.totalPausedMs;
    const durationSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
    const project = getProject(currentEntry.projectId);

    setCurrentEntry({
      ...currentEntry,
      pausedAt: now,
      status: 'paused',
    });

    if (project) {
      trackTimerPaused(project.name, project.category === 'billable', durationSeconds);
    }
  }, [currentEntry, setCurrentEntry, getProject]);

  const resumeTimer = useCallback(() => {
    if (!currentEntry || currentEntry.status !== 'paused' || !currentEntry.pausedAt) return;
    const additionalPause = Date.now() - currentEntry.pausedAt;
    setCurrentEntry({
      ...currentEntry,
      pausedAt: null,
      totalPausedMs: currentEntry.totalPausedMs + additionalPause,
      status: 'active',
    });
  }, [currentEntry, setCurrentEntry]);

  const requestStop = useCallback(() => {
    if (!currentEntry) return;
    const now = Date.now();
    const effectiveEnd = currentEntry.pausedAt ?? now;
    const elapsedMs =
      effectiveEnd - currentEntry.startTime - currentEntry.totalPausedMs;
    const completed: TimeEntry = {
      ...currentEntry,
      endTime: now,
      totalSeconds: Math.max(0, Math.floor(elapsedMs / 1000)),
      pausedAt: null,
      status: 'completed',
    };
    const project = getProject(currentEntry.projectId);

    setCurrentEntry(null);
    setPendingStop({ entry: completed });

    if (project) {
      trackTimerStopped(
        project.name,
        project.category === 'billable',
        completed.totalSeconds
      );
    }
  }, [currentEntry, setCurrentEntry, getProject]);

  const confirmStop = useCallback(
    (note: string) => {
      if (!pendingStop) return;
      const finalEntry: TimeEntry = {
        ...pendingStop.entry,
        note,
      };
      setEntries((prev) => [finalEntry, ...prev]);
      setPendingStop(null);
    },
    [pendingStop, setEntries]
  );

  const cancelStop = useCallback(() => {
    if (!pendingStop) return;
    const finalEntry: TimeEntry = {
      ...pendingStop.entry,
      note: '',
    };
    setEntries((prev) => [finalEntry, ...prev]);
    setPendingStop(null);
  }, [pendingStop, setEntries]);

  const deleteEntry = useCallback(
    (entryId: string) => {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    },
    [setEntries]
  );

  const todayEntries = entries.filter((e) => isToday(e.startTime));

  const todayBillableSeconds = todayEntries
    .filter((e) => {
      const project = getProject(e.projectId);
      return project?.category === 'billable';
    })
    .reduce((sum, e) => sum + e.totalSeconds, 0);

  const todayNonBillableSeconds = todayEntries
    .filter((e) => {
      const project = getProject(e.projectId);
      return project?.category === 'non-billable';
    })
    .reduce((sum, e) => sum + e.totalSeconds, 0);

  return (
    <TimerContext.Provider
      value={{
        currentEntry,
        entries,
        pendingStop,
        startTimer,
        pauseTimer,
        resumeTimer,
        requestStop,
        confirmStop,
        cancelStop,
        deleteEntry,
        todayEntries,
        todayBillableSeconds,
        todayNonBillableSeconds,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}
