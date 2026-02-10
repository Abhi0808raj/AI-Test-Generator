import React from 'react';

const ComplexityAnalysis = ({ complexity }) => {
  if (!complexity) return null;

  return (
    <div className="complexity-info">
      <strong>Complexity Analysis:</strong> 
      Score: {complexity.complexity.toFixed(1)}/10 | 
      Lines: {complexity.lines} |
      {complexity.hasAsync && ' Async'} 
      {complexity.hasLoops && ' Loops'} 
      {complexity.hasConditionals && ' Conditionals'}
    </div>
  );
};

export default ComplexityAnalysis;
