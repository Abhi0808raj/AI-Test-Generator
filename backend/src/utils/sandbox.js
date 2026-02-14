const { VM } = require('vm2');

class TestSandbox {
  constructor() {
    this.timeout = 5000;
    this.memoryLimit = 128;
  }

  /**
   * Execute tests in a secure sandbox
   * @param {string} code - The function code to test
   * @param {string} testCode - The test code to execute
   * @param {string} framework - Testing framework (jest or mocha)
   * @returns {Promise<Object>} Test results
   */
  async executeTests(code, testCode, framework = 'jest') {
    try {
      const sandboxCode = this.prepareSandboxCode(code, testCode, framework);
      const result = await this.runInSandbox(sandboxCode);
      return this.parseResults(result, framework);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        passed: 0,
        failed: 0,
        total: 0,
        output: `Execution error: ${error.message}`
      };
    }
  }

  /**
   * Prepare code for sandbox execution
   */
  prepareSandboxCode(code, testCode, framework) {
    if (framework === 'jest') {
      return this.prepareJestCode(code, testCode);
    } else if (framework === 'mocha') {
      return this.prepareMochaCode(code, testCode);
    }
    throw new Error(`Unsupported framework: ${framework}`);
  }

  /**
   * Prepare Jest test code
   */
  prepareJestCode(code, testCode) {
    return `
// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Mock Jest functions
const describe = (name, fn) => {
  try {
    fn();
  } catch (error) {
    testResults.tests.push({
      suite: name,
      error: error.message
    });
  }
};

const test = (name, fn) => {
  try {
    fn();
    testResults.passed++;
    testResults.tests.push({
      name: name,
      status: 'passed'
    });
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({
      name: name,
      status: 'failed',
      error: error.message
    });
  }
};

const it = test; // Alias for test

// Mock expect function
const expect = (actual) => {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(\`Expected \${JSON.stringify(expected)} but got \${JSON.stringify(actual)}\`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(\`Expected \${JSON.stringify(expected)} but got \${JSON.stringify(actual)}\`);
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(\`Expected truthy value but got \${JSON.stringify(actual)}\`);
      }
    },
    toBeFalsy: () => {
      if (actual) {
        throw new Error(\`Expected falsy value but got \${JSON.stringify(actual)}\`);
      }
    },
    toBeNull: () => {
      if (actual !== null) {
        throw new Error(\`Expected null but got \${JSON.stringify(actual)}\`);
      }
    },
    toBeUndefined: () => {
      if (actual !== undefined) {
        throw new Error(\`Expected undefined but got \${JSON.stringify(actual)}\`);
      }
    },
    toThrow: (expectedError) => {
      if (typeof actual !== 'function') {
        throw new Error('Expected a function for toThrow matcher');
      }
      try {
        actual();
        throw new Error('Expected function to throw an error');
      } catch (error) {
        if (expectedError && !error.message.includes(expectedError)) {
          throw new Error(\`Expected error containing "\${expectedError}" but got "\${error.message}"\`);
        }
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(\`Expected \${actual} to be greater than \${expected}\`);
      }
    },
    toBeLessThan: (expected) => {
      if (actual >= expected) {
        throw new Error(\`Expected \${actual} to be less than \${expected}\`);
      }
    },
    toContain: (expected) => {
      if (!actual.includes(expected)) {
        throw new Error(\`Expected array to contain \${JSON.stringify(expected)}\`);
      }
    },
    toHaveLength: (expected) => {
      if (actual.length !== expected) {
        throw new Error(\`Expected length \${expected} but got \${actual.length}\`);
      }
    }
  };
};

// User's function code
${code}

// Test code
${testCode}

// Return results
testResults;
`;
  }

  /**
   * Prepare Mocha test code
   */
  prepareMochaCode(code, testCode) {
    return `
// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Mock Mocha functions
const describe = (name, fn) => {
  try {
    fn();
  } catch (error) {
    testResults.tests.push({
      suite: name,
      error: error.message
    });
  }
};

const it = (name, fn) => {
  try {
    fn();
    testResults.passed++;
    testResults.tests.push({
      name: name,
      status: 'passed'
    });
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({
      name: name,
      status: 'failed',
      error: error.message
    });
  }
};

// Mock assert library
const assert = {
  equal: (actual, expected, message) => {
    if (actual !== expected) {
      throw new Error(message || \`Expected \${expected} but got \${actual}\`);
    }
  },
  deepEqual: (actual, expected, message) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || \`Expected \${JSON.stringify(expected)} but got \${JSON.stringify(actual)}\`);
    }
  },
  strictEqual: (actual, expected, message) => {
    if (actual !== expected) {
      throw new Error(message || \`Expected \${expected} but got \${actual}\`);
    }
  },
  ok: (value, message) => {
    if (!value) {
      throw new Error(message || \`Expected truthy value but got \${value}\`);
    }
  },
  throws: (fn, expectedError, message) => {
    try {
      fn();
      throw new Error(message || 'Expected function to throw an error');
    } catch (error) {
      if (expectedError && !error.message.includes(expectedError)) {
        throw new Error(\`Expected error containing "\${expectedError}" but got "\${error.message}"\`);
      }
    }
  }
};

// User's function code
${code}

// Test code
${testCode}

// Return results
testResults;
`;
  }

  /**
   * Run code in VM2 sandbox
   */
  async runInSandbox(code) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Test execution timeout (5 seconds)'));
      }, this.timeout);

      try {
        const vm = new VM({
          timeout: this.timeout,
          sandbox: {
            console: {
              log: (...args) => {
                // Capture console.log output
                return args.join(' ');
              }
            }
          },
          eval: false,
          wasm: false
        });

        const result = vm.run(code);
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Parse test results
   */
  parseResults(result, framework) {
    const total = result.passed + result.failed;
    
    // Generate output text
    const output = this.generateOutput(result);

    return {
      success: result.failed === 0,
      passed: result.passed,
      failed: result.failed,
      total: total,
      tests: result.tests,
      output: output,
      framework: framework
    };
  }

  /**
   * Generate human-readable output
   */
  generateOutput(result) {
    let output = `Test Results:\n`;
    output += `✓ Passed: ${result.passed}\n`;
    output += `✗ Failed: ${result.failed}\n`;
    output += `Total: ${result.passed + result.failed}\n\n`;

    if (result.tests && result.tests.length > 0) {
      output += 'Details:\n';
      result.tests.forEach((test, index) => {
        const icon = test.status === 'passed' ? '✓' : '✗';
        output += `${icon} ${test.name || test.suite}\n`;
        if (test.error) {
          output += `  Error: ${test.error}\n`;
        }
      });
    }

    return output;
  }

  /**
   * Validate code before execution
   */
  validateCode(code) {
    // Check for dangerous patterns
    const dangerousPatterns = [
      /require\s*\(/,
      /import\s+.*\s+from/,
      /process\./,
      /fs\./,
      /child_process/,
      /eval\s*\(/,
      /Function\s*\(/,
      /__dirname/,
      /__filename/,
      /module\./
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return {
          valid: false,
          message: `Code contains potentially dangerous operation: ${pattern.source}`
        };
      }
    }

    return { valid: true };
  }
}

module.exports = new TestSandbox();
