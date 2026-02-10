import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { DEMO_CODE } from '../utils/constants';

const useTestGeneration = () => {
  const [code, setCode] = useState(DEMO_CODE);
  const [testCode, setTestCode] = useState('');
  const [framework, setFramework] = useState('jest');
  const [language, setLanguage] = useState('javascript');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [complexity, setComplexity] = useState(null);

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

  const resetState = () => {
    setCode('');
    setTestCode('');
    setTestResults(null);
    setComplexity(null);
  };

  const loadDemo = () => {
    setCode(DEMO_CODE);
    setTestCode('');
    setTestResults(null);
    setComplexity(null);
    toast.info('Demo code loaded');
  };

  return {
    code, setCode,
    testCode, setTestCode,
    framework, setFramework,
    language, setLanguage,
    isGenerating,
    isExecuting,
    testResults, setTestResults,
    complexity, setComplexity,
    generateTests,
    executeTests,
    resetState,
    loadDemo
  };
};

export default useTestGeneration;
