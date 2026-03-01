import { useState } from 'react';
import { Project, ProjectCategory } from '../types';
import { useProjectContext } from '../context/ProjectContext';
import { ProjectCard } from './ProjectCard';
import { AddProjectForm } from './AddProjectForm';
import { DeleteProjectModal } from './DeleteProjectModal';
import { trackProjectAdded, trackProjectDeleted } from '../analytics';

export function ProjectGrid() {
  const { billableProjects, nonBillableProjects, addProject, deleteProject } =
    useProjectContext();

  const [addingTo, setAddingTo] = useState<ProjectCategory | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const handleAdd = (name: string, category: ProjectCategory) => {
    addProject(name, category);
    trackProjectAdded(name, category === 'billable');
    setAddingTo(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingProject) return;
    deleteProject(deletingProject.id);
    trackProjectDeleted(deletingProject.name, deletingProject.category === 'billable');
    setDeletingProject(null);
  };

  return (
    <>
      <section className="project-grid">
        <div className="project-column">
          <div className="column-header">
            <h2 className="column-title column-title--billable">
              <span className="column-dot column-dot--billable" />
              Billable
            </h2>
            <button
              className="add-project-btn add-project-btn--billable"
              onClick={() => setAddingTo(addingTo === 'billable' ? null : 'billable')}
              title="Add billable project"
            >
              +
            </button>
          </div>
          {addingTo === 'billable' && (
            <AddProjectForm
              defaultCategory="billable"
              onAdd={handleAdd}
              onCancel={() => setAddingTo(null)}
            />
          )}
          <div className="project-cards">
            {billableProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onRequestDelete={setDeletingProject}
              />
            ))}
          </div>
        </div>
        <div className="project-column">
          <div className="column-header">
            <h2 className="column-title column-title--nonbillable">
              <span className="column-dot column-dot--nonbillable" />
              Non-Billable
            </h2>
            <button
              className="add-project-btn add-project-btn--nonbillable"
              onClick={() => setAddingTo(addingTo === 'non-billable' ? null : 'non-billable')}
              title="Add non-billable project"
            >
              +
            </button>
          </div>
          {addingTo === 'non-billable' && (
            <AddProjectForm
              defaultCategory="non-billable"
              onAdd={handleAdd}
              onCancel={() => setAddingTo(null)}
            />
          )}
          <div className="project-cards">
            {nonBillableProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onRequestDelete={setDeletingProject}
              />
            ))}
          </div>
        </div>
      </section>

      {deletingProject && (
        <DeleteProjectModal
          project={deletingProject}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingProject(null)}
        />
      )}
    </>
  );
}
