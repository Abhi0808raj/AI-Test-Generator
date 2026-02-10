import React from 'react';
import { Wand2, Play, Save } from 'lucide-react';

const EditorControls = ({
  projectName,
  setProjectName,
  framework,
  setFramework,
  language,
  setLanguage,
  isGenerating,
  generateTests,
  isExecuting,
  executeTests,
  testCode,
  saveProject
}) => {
  return (
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
          className={`btn btn-primary ${isGenerating ? 'loading' : ''}`}
        >
          <Wand2 size={16} />
          {isGenerating ? 'Generating...' : 'Generate Tests'}
        </button>
        <button 
          onClick={executeTests} 
          disabled={isExecuting || !testCode}
          className={`btn btn-success ${isExecuting ? 'loading' : ''}`}
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
  );
};

export default EditorControls;
