import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const TestResults = ({ testResults, onClose }) => {
  if (!testResults) return null;

  return (
    <div className="results-section">
      <div className="results-header">
        <div className="results-header-left">
          <h3>Test Results</h3>
          {testResults.success ? (
            <CheckCircle className="icon-success" size={20} />
          ) : (
            <XCircle className="icon-error" size={20} />
          )}
        </div>
        <button onClick={onClose} className="btn-icon" title="Close Results">
          <X size={18} />
        </button>
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
  );
};

export default TestResults;
