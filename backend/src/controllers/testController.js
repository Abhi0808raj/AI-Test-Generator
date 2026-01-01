const aiGenerator = require('../utils/aiGenerator');
const sandbox = require('../utils/sandbox');

/**
 * Generate unit tests using AI
 */
exports.generateTests = async (req, res, next) => {
  try {
    const { code, framework = 'jest', language = 'javascript' } = req.body;

    // Validate input
    if (!code || code.trim().length === 0) {
      return res.status(400).json({
        error: 'Code is required',
        message: 'Please provide function code to generate tests for'
      });
    }

    if (!['jest', 'mocha'].includes(framework)) {
      return res.status(400).json({
        error: 'Invalid framework',
        message: 'Framework must be either "jest" or "mocha"'
      });
    }

    if (!['javascript', 'typescript'].includes(language)) {
      return res.status(400).json({
        error: 'Invalid language',
        message: 'Language must be either "javascript" or "typescript"'
      });
    }

    // Analyze code complexity
    const complexity = aiGenerator.analyzeComplexity(code);

    // Generate tests using AI
    const result = await aiGenerator.generateTests(code, framework, language);

    // Validate generated test code
    const validation = aiGenerator.validateTestCode(result.testCode, framework);
    
    if (!validation.valid) {
      return res.status(500).json({
        error: 'Invalid test generation',
        message: validation.message
      });
    }

    res.json({
      success: true,
      testCode: result.testCode,
      metadata: {
        ...result.metadata,
        complexity
      }
    });

  } catch (error) {
    console.error('Test generation error:', error);
    next(error);
  }
};

/**
 * Execute tests in sandbox
 */
exports.executeTests = async (req, res, next) => {
  try {
    const { code, testCode, framework = 'jest' } = req.body;

    // Validate input
    if (!code || !testCode) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both code and testCode are required'
      });
    }

    // Validate code safety
    const codeValidation = sandbox.validateCode(code);
    if (!codeValidation.valid) {
      return res.status(400).json({
        error: 'Unsafe code detected',
        message: codeValidation.message
      });
    }

    const testValidation = sandbox.validateCode(testCode);
    if (!testValidation.valid) {
      return res.status(400).json({
        error: 'Unsafe test code detected',
        message: testValidation.message
      });
    }

    // Execute tests in sandbox
    const result = await sandbox.executeTests(code, testCode, framework);

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Test execution error:', error);
    next(error);
  }
};

/**
 * Get supported frameworks
 */
exports.getFrameworks = (req, res) => {
  res.json({
    frameworks: [
      {
        id: 'jest',
        name: 'Jest',
        description: 'Delightful JavaScript Testing Framework',
        features: ['Zero config', 'Snapshots', 'Mocking', 'Coverage']
      },
      {
        id: 'mocha',
        name: 'Mocha',
        description: 'Feature-rich JavaScript test framework',
        features: ['Flexible', 'Async support', 'Browser support', 'Hooks']
      }
    ],
    languages: ['javascript', 'typescript']
  });
};

/**
 * Analyze code complexity
 */
exports.analyzeCode = (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Code is required',
        message: 'Please provide code to analyze'
      });
    }

    const complexity = aiGenerator.analyzeComplexity(code);

    res.json({
      success: true,
      analysis: {
        ...complexity,
        recommendation: getComplexityRecommendation(complexity.complexity)
      }
    });

  } catch (error) {
    console.error('Code analysis error:', error);
    next(error);
  }
};

/**
 * Get recommendation based on complexity score
 */
function getComplexityRecommendation(score) {
  if (score <= 3) {
    return 'Simple function - basic test coverage should be sufficient';
  } else if (score <= 6) {
    return 'Moderate complexity - include edge case testing';
  } else {
    return 'Complex function - comprehensive testing with multiple scenarios recommended';
  }
}
