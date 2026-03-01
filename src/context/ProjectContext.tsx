import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from 'react';
import { Project, ProjectCategory } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_PROJECTS } from '../data/projects';

interface ProjectContextValue {
  projects: Project[];
  billableProjects: Project[];
  nonBillableProjects: Project[];
  getProject: (id: string) => Project | undefined;
  addProject: (name: string, category: ProjectCategory) => void;
  deleteProject: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProjectContext(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjectContext must be used within ProjectProvider');
  return ctx;
}

function mergeProjects(stored: Project[]): Project[] {
  const storedIds = new Set(stored.map((p) => p.id));
  const defaults = DEFAULT_PROJECTS.filter((p) => !storedIds.has(p.id));
  return [...defaults, ...stored];
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [customProjects, setCustomProjects] = useLocalStorage<Project[]>(
    'ps-timer-custom-projects',
    []
  );

  const projects = mergeProjects(customProjects);

  const billableProjects = projects.filter((p) => p.category === 'billable');
  const nonBillableProjects = projects.filter((p) => p.category === 'non-billable');

  const getProject = useCallback(
    (id: string): Project | undefined => {
      return projects.find((p) => p.id === id);
    },
    [projects]
  );

  const addProject = useCallback(
    (name: string, category: ProjectCategory) => {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const exists = projects.some(
        (p) => p.id === id || p.name.toLowerCase() === name.toLowerCase()
      );
      if (exists) return;

      const newProject: Project = {
        id: `custom-${id}-${Date.now()}`,
        name,
        category,
        isDefault: false,
      };
      setCustomProjects((prev) => [...prev, newProject]);
    },
    [projects, setCustomProjects]
  );

  const deleteProject = useCallback(
    (id: string) => {
      setCustomProjects((prev) => prev.filter((p) => p.id !== id));
    },
    [setCustomProjects]
  );

  return (
    <ProjectContext.Provider
      value={{
        projects,
        billableProjects,
        nonBillableProjects,
        getProject,
        addProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
