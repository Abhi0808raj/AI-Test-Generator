const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');


class AITestGenerator {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'openai';
    
    if (this.provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required when using OpenAI provider');
      }
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    } else if (this.provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is required when using Gemini provider');
      }
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  /**
   * Generate unit tests for the provided code
   * @param {string} code - The function code to generate tests for
   * @param {string} framework - Testing framework (jest or mocha)
   * @param {string} language - Programming language (javascript or typescript)
   * @returns {Promise<Object>} Generated test code and metadata
   */
  async generateTests(code, framework = 'jest', language = 'javascript') {
    const prompt = this.buildPrompt(code, framework, language);
    
    try {
      if (this.provider === 'openai') {
        return await this.generateWithOpenAI(prompt);
      } else if (this.provider === 'gemini') {
        return await this.generateWithGemini(prompt);
      }
    } catch (error) {
      console.error('AI generation error:', error);
      throw new Error(`Failed to generate tests: ${error.message}`);
    }
  }

  /**
   * Build the prompt for test generation
   */
  buildPrompt(code, framework, language) {
    return `You are an expert software testing engineer. Generate comprehensive unit tests for the following ${language} function.

Requirements:
- Use ${framework} testing framework
- Include tests for normal cases, edge cases, and error cases
- Test type validation and input sanitization
- Include descriptive test names
- Add comments explaining what each test validates
- Follow ${framework} best practices
- Generate only the test code, no explanations before or after

Function to test:
\`\`\`${language}
${code}
\`\`\`

Generate complete, ready-to-run ${framework} test code:`;
  }

  /**
   * Generate tests using OpenAI GPT-4
   */
  async generateWithOpenAI(prompt) {
    const startTime = Date.now();
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert software testing engineer who writes high-quality, comprehensive unit tests. Always respond with only the test code, properly formatted and ready to run.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const generationTime = Date.now() - startTime;
    const testCode = this.extractCodeFromResponse(completion.choices[0].message.content);

    return {
      testCode,
      metadata: {
        provider: 'openai',
        model: completion.model,
        tokensUsed: completion.usage.total_tokens,
        generationTime,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Generate tests using Google Gemini
   */
async generateWithGemini(prompt) {
  const startTime = Date.now();
  const model = this.gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  const generationTime = Date.now() - startTime;

  const testCode = this.extractCodeFromResponse(text);

  return {
    testCode,
    metadata: {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      generationTime,
      timestamp: new Date().toISOString()
    }
  };
}

  /**
   * Extract code from AI response, removing markdown formatting
   */
  extractCodeFromResponse(response) {
    // Remove markdown code blocks
    let code = response.trim();
    
    // Remove ```javascript, ```typescript, or ``` markers
    code = code.replace(/^```(?:javascript|typescript|js|ts)?\n?/gm, '');
    code = code.replace(/\n?```$/gm, '');
    
    return code.trim();
  }

  /**
   * Validate generated test code
   */
  validateTestCode(testCode, framework) {
    const requiredPatterns = {
      jest: ['describe', 'test', 'expect'],
      mocha: ['describe', 'it']
    };

    const patterns = requiredPatterns[framework] || requiredPatterns.jest;
    
    for (const pattern of patterns) {
      if (!testCode.includes(pattern)) {
        return {
          valid: false,
          message: `Generated test code is missing required ${framework} pattern: ${pattern}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Analyze code complexity to adjust test generation
   */
  analyzeComplexity(code) {
    const lines = code.split('\n').filter(line => line.trim());
    const hasLoops = /\b(for|while|forEach)\b/.test(code);
    const hasConditionals = /\b(if|else|switch|case)\b/.test(code);
    const hasTryCatch = /\b(try|catch|finally)\b/.test(code);
    const hasAsync = /\b(async|await|Promise)\b/.test(code);

    return {
      lines: lines.length,
      hasLoops,
      hasConditionals,
      hasTryCatch,
      hasAsync,
      complexity: this.calculateComplexityScore(
        lines.length,
        hasLoops,
        hasConditionals,
        hasTryCatch,
        hasAsync
      )
    };
  }

  /**
   * Calculate complexity score
   */
  calculateComplexityScore(lines, hasLoops, hasConditionals, hasTryCatch, hasAsync) {
    let score = Math.min(lines / 10, 5); // Max 5 points for lines
    if (hasLoops) score += 2;
    if (hasConditionals) score += 2;
    if (hasTryCatch) score += 1;
    if (hasAsync) score += 2;
    return Math.min(score, 10); // Max complexity of 10
  }
}

module.exports = new AITestGenerator();
