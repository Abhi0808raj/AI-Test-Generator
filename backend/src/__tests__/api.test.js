// Sample test file for the AI Test Generator backend
// To run: npm test

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const Project = require('../src/models/Project');

// Test configuration
const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/ai-test-generator-test';

describe('AI Test Generator API Tests', () => {
  // Setup: Connect to test database before all tests
  beforeAll(async () => {
    await mongoose.connect(TEST_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Cleanup: Clear database before each test
  beforeEach(async () => {
    await Project.deleteMany({});
  });

  // Teardown: Close database connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Health Check Tests
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  // Test Generation Tests
  describe('POST /api/tests/generate', () => {
    it('should generate tests for valid code', async () => {
      const response = await request(app)
        .post('/api/tests/generate')
        .send({
          code: 'function add(a, b) { return a + b; }',
          framework: 'jest',
          language: 'javascript'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('testCode');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.testCode).toContain('describe');
      expect(response.body.testCode).toContain('test');
    });

    it('should return error for empty code', async () => {
      const response = await request(app)
        .post('/api/tests/generate')
        .send({
          code: '',
          framework: 'jest'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for invalid framework', async () => {
      const response = await request(app)
        .post('/api/tests/generate')
        .send({
          code: 'function test() {}',
          framework: 'invalid-framework'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // Test Execution Tests
  describe('POST /api/tests/execute', () => {
    it('should execute valid tests successfully', async () => {
      const code = 'function add(a, b) { return a + b; }';
      const testCode = `
        describe('add function', () => {
          test('should add two numbers', () => {
            expect(add(2, 3)).toBe(5);
          });
        });
      `;

      const response = await request(app)
        .post('/api/tests/execute')
        .send({ code, testCode, framework: 'jest' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result).toHaveProperty('passed', 1);
      expect(response.body.result).toHaveProperty('failed', 0);
      expect(response.body.result).toHaveProperty('total', 1);
    });

    it('should detect failing tests', async () => {
      const code = 'function add(a, b) { return a + b; }';
      const testCode = `
        describe('add function', () => {
          test('should fail', () => {
            expect(add(2, 3)).toBe(10);
          });
        });
      `;

      const response = await request(app)
        .post('/api/tests/execute')
        .send({ code, testCode, framework: 'jest' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.result).toHaveProperty('passed', 0);
      expect(response.body.result).toHaveProperty('failed', 1);
    });

    it('should reject dangerous code', async () => {
      const code = 'const fs = require("fs"); function test() {}';
      const testCode = 'test("test", () => expect(true).toBe(true));';

      const response = await request(app)
        .post('/api/tests/execute')
        .send({ code, testCode, framework: 'jest' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Unsafe');
    });
  });

  // Framework Info Tests
  describe('GET /api/tests/frameworks', () => {
    it('should return list of supported frameworks', async () => {
      const response = await request(app)
        .get('/api/tests/frameworks')
        .expect(200);

      expect(response.body).toHaveProperty('frameworks');
      expect(response.body).toHaveProperty('languages');
      expect(response.body.frameworks).toBeInstanceOf(Array);
      expect(response.body.languages).toContain('javascript');
      expect(response.body.languages).toContain('typescript');
    });
  });

  // Project CRUD Tests
  describe('Project Management', () => {
    describe('POST /api/projects', () => {
      it('should create a new project', async () => {
        const projectData = {
          name: 'Test Project',
          code: 'function test() { return true; }',
          framework: 'jest',
          language: 'javascript'
        };

        const response = await request(app)
          .post('/api/projects')
          .send(projectData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.project).toHaveProperty('name', 'Test Project');
        expect(response.body.project).toHaveProperty('_id');
      });

      it('should reject duplicate project names', async () => {
        const projectData = {
          name: 'Duplicate Project',
          code: 'function test() {}'
        };

        await request(app).post('/api/projects').send(projectData);
        
        const response = await request(app)
          .post('/api/projects')
          .send(projectData)
          .expect(409);

        expect(response.body).toHaveProperty('error');
      });

      it('should reject projects without required fields', async () => {
        const response = await request(app)
          .post('/api/projects')
          .send({ name: 'Test' })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /api/projects', () => {
      it('should return empty array when no projects exist', async () => {
        const response = await request(app)
          .get('/api/projects')
          .expect(200);

        expect(response.body.projects).toBeInstanceOf(Array);
        expect(response.body.projects).toHaveLength(0);
      });

      it('should return list of projects', async () => {
        await Project.create({
          name: 'Project 1',
          code: 'function test1() {}'
        });
        await Project.create({
          name: 'Project 2',
          code: 'function test2() {}'
        });

        const response = await request(app)
          .get('/api/projects')
          .expect(200);

        expect(response.body.projects).toHaveLength(2);
      });

      it('should filter projects by framework', async () => {
        await Project.create({
          name: 'Jest Project',
          code: 'function test() {}',
          framework: 'jest'
        });
        await Project.create({
          name: 'Mocha Project',
          code: 'function test() {}',
          framework: 'mocha'
        });

        const response = await request(app)
          .get('/api/projects?framework=jest')
          .expect(200);

        expect(response.body.projects).toHaveLength(1);
        expect(response.body.projects[0].framework).toBe('jest');
      });
    });

    describe('GET /api/projects/:id', () => {
      it('should return a project by ID', async () => {
        const project = await Project.create({
          name: 'Test Project',
          code: 'function test() {}'
        });

        const response = await request(app)
          .get(`/api/projects/${project._id}`)
          .expect(200);

        expect(response.body.project).toHaveProperty('name', 'Test Project');
      });

      it('should return 404 for non-existent project', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await request(app)
          .get(`/api/projects/${fakeId}`)
          .expect(404);
      });

      it('should return 400 for invalid ID format', async () => {
        await request(app)
          .get('/api/projects/invalid-id')
          .expect(400);
      });
    });

    describe('PUT /api/projects/:id', () => {
      it('should update a project', async () => {
        const project = await Project.create({
          name: 'Original Name',
          code: 'function test() {}'
        });

        const response = await request(app)
          .put(`/api/projects/${project._id}`)
          .send({ name: 'Updated Name' })
          .expect(200);

        expect(response.body.project.name).toBe('Updated Name');
      });

      it('should return 404 for non-existent project', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await request(app)
          .put(`/api/projects/${fakeId}`)
          .send({ name: 'Updated' })
          .expect(404);
      });
    });

    describe('DELETE /api/projects/:id', () => {
      it('should delete a project', async () => {
        const project = await Project.create({
          name: 'To Delete',
          code: 'function test() {}'
        });

        await request(app)
          .delete(`/api/projects/${project._id}`)
          .expect(200);

        const deletedProject = await Project.findById(project._id);
        expect(deletedProject).toBeNull();
      });

      it('should return 404 for non-existent project', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await request(app)
          .delete(`/api/projects/${fakeId}`)
          .expect(404);
      });
    });
  });

  // Statistics Tests
  describe('GET /api/projects/statistics', () => {
    it('should return project statistics', async () => {
      await Project.create([
        { name: 'P1', code: 'test', framework: 'jest' },
        { name: 'P2', code: 'test', framework: 'jest' },
        { name: 'P3', code: 'test', framework: 'mocha' }
      ]);

      const response = await request(app)
        .get('/api/projects/statistics')
        .expect(200);

      expect(response.body.statistics).toHaveProperty('totalProjects', 3);
      expect(response.body.statistics).toHaveProperty('frameworks');
      expect(response.body.statistics).toHaveProperty('languages');
    });
  });
});

// Unit tests for utility functions
describe('Utility Functions', () => {
  const aiGenerator = require('../src/utils/aiGenerator');
  const sandbox = require('../src/utils/sandbox');

  describe('Code Complexity Analyzer', () => {
    it('should analyze simple code correctly', () => {
      const code = 'function add(a, b) { return a + b; }';
      const complexity = aiGenerator.analyzeComplexity(code);

      expect(complexity).toHaveProperty('lines');
      expect(complexity).toHaveProperty('hasLoops', false);
      expect(complexity).toHaveProperty('hasConditionals', false);
      expect(complexity).toHaveProperty('complexity');
      expect(complexity.complexity).toBeLessThan(3);
    });

    it('should detect loops', () => {
      const code = 'function loop() { for(let i = 0; i < 10; i++) {} }';
      const complexity = aiGenerator.analyzeComplexity(code);

      expect(complexity.hasLoops).toBe(true);
    });

    it('should detect conditionals', () => {
      const code = 'function check(x) { if (x > 0) return true; return false; }';
      const complexity = aiGenerator.analyzeComplexity(code);

      expect(complexity.hasConditionals).toBe(true);
    });

    it('should detect async code', () => {
      const code = 'async function fetch() { await getData(); }';
      const complexity = aiGenerator.analyzeComplexity(code);

      expect(complexity.hasAsync).toBe(true);
    });
  });

  describe('Code Validator', () => {
    it('should accept safe code', () => {
      const code = 'function safe() { return 42; }';
      const validation = sandbox.validateCode(code);

      expect(validation.valid).toBe(true);
    });

    it('should reject code with require', () => {
      const code = 'const fs = require("fs");';
      const validation = sandbox.validateCode(code);

      expect(validation.valid).toBe(false);
      expect(validation.message).toContain('dangerous');
    });

    it('should reject code with eval', () => {
      const code = 'eval("malicious code");';
      const validation = sandbox.validateCode(code);

      expect(validation.valid).toBe(false);
    });

    it('should reject code with process access', () => {
      const code = 'process.exit(1);';
      const validation = sandbox.validateCode(code);

      expect(validation.valid).toBe(false);
    });
  });
});
