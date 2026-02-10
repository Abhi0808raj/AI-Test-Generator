import React from 'react';
import { Code, Info, FolderOpen } from 'lucide-react';

const Header = ({ loadDemo, setShowSidebar, showSidebar }) => {
  return (
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
  );
};

export default Header;
