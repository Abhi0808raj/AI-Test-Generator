import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data.projects || []);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const saveProject = async (projectData) => {
    try {
      if (selectedProject) {
        await api.updateProject(selectedProject._id, projectData);
        toast.success('Project updated successfully!');
      } else {
        await api.createProject(projectData);
        toast.success('Project saved successfully!');
      }
      loadProjects();
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to save project');
      return false;
    }
  };

  const deleteProject = async (id, name) => {
    if (!window.confirm(`Delete project "${name}"?`)) return;

    try {
      await api.deleteProject(id);
      toast.success('Project deleted');
      loadProjects();
      if (selectedProject?._id === id) {
        setSelectedProject(null);
      }
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return {
    projects,
    selectedProject,
    setSelectedProject,
    loadProjects,
    saveProject,
    deleteProject,
    loading
  };
};

export default useProjects;
