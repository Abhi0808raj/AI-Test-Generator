import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import CodeEditor from '../components/features/editor/CodeEditor';
import EditorControls from '../components/features/editor/EditorControls';
import TestResults from '../components/features/analysis/TestResults';
import useProjects from '../hooks/useProjects';
import useTestGeneration from '../hooks/useTestGeneration';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [projectName, setProjectName] = useState('');

  const {
    projects,
    selectedProject,
    setSelectedProject,
    loadProjects,
    saveProject: apiSaveProject,
    deleteProject
  } = useProjects();

  const {
    code, setCode,
    testCode, setTestCode,
    framework, setFramework,
    language, setLanguage,
    isGenerating,
    isExecuting,
    testResults, setTestResults,
    generateTests,
    executeTests,
    resetState,
    loadDemo
  } = useTestGeneration();

  const handleLoadProject = (project) => {
    setSelectedProject(project);
    setCode(project.code);
    setTestCode(project.currentTest || '');
    setFramework(project.framework);
    setLanguage(project.language);
    setProjectName(project.name);
    setTestResults(null);
    toast.info(`Loaded project: ${project.name}`);
  };

  const handleNewProject = () => {
    resetState();
    setProjectName('');
    setSelectedProject(null);
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (!code.trim()) {
      toast.error('Please enter some code');
      return;
    }

    const projectData = {
      name: projectName,
      code,
      language,
      framework,
      currentTest: testCode,
      generatedTests: testCode ? [testCode] : []
    };

    const success = await apiSaveProject(projectData);
    if (success) {
      if (!selectedProject) {
        // If it was a new project, we might want to select it, 
        // but loadProjects runs async. For now, we just clear project name if we want to valid "saved" state
        // or keep it.
      }
    }
  };

  const handleLoadDemo = () => {
    loadDemo();
    setProjectName('Email Validator Demo');
    setSelectedProject(null);
  };

  return (
    <div className="app">
      <Header 
        loadDemo={handleLoadDemo} 
        setShowSidebar={setShowSidebar} 
        showSidebar={showSidebar} 
      />

      <div className="main-content">
        {showSidebar && (
          <Sidebar
            projects={projects}
            selectedProject={selectedProject}
            loadProject={handleLoadProject}
            deleteProject={deleteProject}
            newProject={handleNewProject}
          />
        )}

        <main className="editor-container">
          <EditorControls
            projectName={projectName}
            setProjectName={setProjectName}
            framework={framework}
            setFramework={setFramework}
            language={language}
            setLanguage={setLanguage}
            isGenerating={isGenerating}
            generateTests={generateTests}
            isExecuting={isExecuting}
            executeTests={executeTests}
            testCode={testCode}
            saveProject={handleSaveProject}
          />


          <CodeEditor
            title="Your Function"
            value={code}
            onChange={(val) => setCode(val || '')}
            language={language}
          />

          <CodeEditor
            title="Generated Tests"
            value={testCode}
            onChange={(val) => setTestCode(val || '')}
            language={language}
          />

          <TestResults 
            testResults={testResults} 
            onClose={() => setTestResults(null)} 
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
