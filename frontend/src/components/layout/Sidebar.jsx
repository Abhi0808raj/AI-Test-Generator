import React from 'react';
import { Trash2 } from 'lucide-react';

const Sidebar = ({ 
  projects, 
  selectedProject, 
  loadProject, 
  deleteProject, 
  newProject 
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Projects</h3>
        <button onClick={newProject} className="btn-icon" title="New Project">
          +
        </button>
      </div>
      <div className="project-list">
        {projects.length === 0 ? (
          <p className="empty-message">No projects yet</p>
        ) : (
          projects.map(project => (
            <div 
              key={project._id} 
              className={`project-item ${selectedProject?._id === project._id ? 'active' : ''}`}
            >
              <div onClick={() => loadProject(project)} className="project-info">
                <h4>{project.name}</h4>
                <div className="project-meta">
                  <span className="badge">{project.framework}</span>
                  <span className="badge">{project.language}</span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(project._id, project.name);
                }}
                className="btn-icon btn-danger"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
