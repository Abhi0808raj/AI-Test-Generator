import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Play, 
  Wand2, 
  Save, 
  FolderOpen, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Code,
  Settings,
  Info
} from 'lucide-react';
import './App.css';
import api from './services/api';

// Sample demo function
const DEMO_CODE = `/**
 * Validates and formats a user's email address
 * @param {string} email - Email address to validate
 * @returns {string} Formatted email in lowercase
 * @throws {Error} If email is invalid
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('Email must be a non-empty string');
  }
  
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  
  return email.toLowerCase().trim();
}`;

function App() {
  const [code, setCode] = useState(DEMO_CODE);
  const [testCode, setTestCode] = useState('');
  const [framework, setFramework] = useState('jest');
  const [language, setLanguage] = useState('javascript');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [complexity, setComplexity] = useState(null);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data.projects || []);
    } catch (error) {
      toast.error('Failed to load projects');
    }
  };

  const generateTests = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code first');
      return;
    }

    setIsGenerating(true);
    setTestResults(null);

    try {
      const data = await api.generateTests(code, framework, language);
      setTestCode(data.testCode);
      setComplexity(data.metadata?.complexity);
      toast.success('Tests generated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to generate tests');
    } finally {
      setIsGenerating(false);
    }
  };

  const executeTests = async () => {
    if (!testCode.trim()) {
      toast.error('Please generate tests first');
      return;
    }

    setIsExecuting(true);
    setTestResults(null);

    try {
      const data = await api.executeTests(code, testCode, framework);
      setTestResults(data.result);
      
      if (data.result.success) {
        toast.success(`All tests passed! ✅ (${data.result.passed}/${data.result.total})`);
      } else {
        toast.warning(`Some tests failed: ${data.result.failed}/${data.result.total}`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to execute tests');
    } finally {
      setIsExecuting(false);
    }
  };

  const saveProject = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (!code.trim()) {
      toast.error('Please enter some code');
      return;
    }

    try {
      const projectData = {
        name: projectName,
        code,
        language,
        framework,
        currentTest: testCode,
        generatedTests: testCode ? [testCode] : []
      };

      if (selectedProject) {
        await api.updateProject(selectedProject._id, projectData);
        toast.success('Project updated successfully!');
      } else {
        await api.createProject(projectData);
        toast.success('Project saved successfully!');
      }
      
      setProjectName('');
      loadProjects();
    } catch (error) {
      toast.error(error.message || 'Failed to save project');
    }
  };

  const loadProject = async (project) => {
    setSelectedProject(project);
    setCode(project.code);
    setTestCode(project.currentTest || '');
    setFramework(project.framework);
    setLanguage(project.language);
    setProjectName(project.name);
    toast.info(`Loaded project: ${project.name}`);
  };

  const deleteProject = async (id, name) => {
    if (!window.confirm(`Delete project "${name}"?`)) return;

    try {
      await api.deleteProject(id);
      toast.success('Project deleted');
      loadProjects();
      if (selectedProject?._id === id) {
        setSelectedProject(null);
        setProjectName('');
      }
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const newProject = () => {
    setCode('');
    setTestCode('');
    setProjectName('');
    setSelectedProject(null);
    setTestResults(null);
    setComplexity(null);
  };

  const loadDemo = () => {
    setCode(DEMO_CODE);
    setTestCode('');
    setProjectName('Email Validator Demo');
    setSelectedProject(null);
    toast.info('Demo code loaded');
  };

  return (
    <div className="app">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <Code className="logo-icon" />
          <h1>AI Test Generator</h1>
        </div>
        <div className="header-right">
          <button onClick={loadDemo} className="btn btn-secondary">
            <Info size={16} />
            Load Demo
          </button>
          <button onClick={() => setShowSidebar(!showSidebar)} className="btn btn-secondary">
            <FolderOpen size={16} />
            Projects
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* Sidebar */}
        {showSidebar && (
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
        )}

        {/* Main Editor Area */}
        <main className="editor-container">
          {/* Controls */}
          <div className="controls">
            <div className="controls-left">
              <input
                type="text"
                placeholder="Project name..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="input"
              />
              <select 
                value={framework} 
                onChange={(e) => setFramework(e.target.value)}
                className="select"
              >
                <option value="jest">Jest</option>
                <option value="mocha">Mocha</option>
              </select>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="select"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
              </select>
            </div>
            <div className="controls-right">
              <button 
                onClick={generateTests} 
                disabled={isGenerating}
                className="btn btn-primary"
              >
                <Wand2 size={16} />
                {isGenerating ? 'Generating...' : 'Generate Tests'}
              </button>
              <button 
                onClick={executeTests} 
                disabled={isExecuting || !testCode}
                className="btn btn-success"
              >
                <Play size={16} />
                {isExecuting ? 'Running...' : 'Run Tests'}
              </button>
              <button 
                onClick={saveProject}
                className="btn btn-secondary"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>

          {/* Complexity Info */}
          {complexity && (
            <div className="complexity-info">
              <strong>Complexity Analysis:</strong> 
              Score: {complexity.complexity.toFixed(1)}/10 | 
              Lines: {complexity.lines} |
              {complexity.hasAsync && ' Async'} 
              {complexity.hasLoops && ' Loops'} 
              {complexity.hasConditionals && ' Conditionals'}
            </div>
          )}

          {/* Code Editor */}
          <div className="editor-section">
            <div className="editor-header">
              <h3>Your Function</h3>
            </div>
            <Editor
              height="300px"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>

          {/* Test Editor */}
          <div className="editor-section">
            <div className="editor-header">
              <h3>Generated Tests</h3>
            </div>
            <Editor
              height="300px"
              language={language}
              theme="vs-dark"
              value={testCode}
              onChange={(value) => setTestCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="results-section">
              <div className="results-header">
                <h3>Test Results</h3>
                {testResults.success ? (
                  <CheckCircle className="icon-success" size={24} />
                ) : (
                  <XCircle className="icon-error" size={24} />
                )}
              </div>
              <div className="results-summary">
                <div className="result-stat">
                  <span className="stat-label">Passed:</span>
                  <span className="stat-value success">{testResults.passed}</span>
                </div>
                <div className="result-stat">
                  <span className="stat-label">Failed:</span>
                  <span className="stat-value error">{testResults.failed}</span>
                </div>
                <div className="result-stat">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{testResults.total}</span>
                </div>
              </div>
              <pre className="results-output">{testResults.output}</pre>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
