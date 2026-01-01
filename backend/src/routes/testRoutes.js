const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const testController = require('../controllers/testController');
const validate = require('../middleware/validator');

/**
 * @route   POST /api/tests/generate
 * @desc    Generate unit tests using AI
 * @access  Public
 */
router.post(
  '/generate',
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('framework').optional().isIn(['jest', 'mocha']).withMessage('Framework must be jest or mocha'),
    body('language').optional().isIn(['javascript', 'typescript']).withMessage('Language must be javascript or typescript'),
    validate
  ],
  testController.generateTests
);

/**
 * @route   POST /api/tests/execute
 * @desc    Execute tests in sandbox
 * @access  Public
 */
router.post(
  '/execute',
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('testCode').notEmpty().withMessage('Test code is required'),
    body('framework').optional().isIn(['jest', 'mocha']).withMessage('Framework must be jest or mocha'),
    validate
  ],
  testController.executeTests
);

/**
 * @route   GET /api/tests/frameworks
 * @desc    Get supported frameworks and languages
 * @access  Public
 */
router.get('/frameworks', testController.getFrameworks);

/**
 * @route   POST /api/tests/analyze
 * @desc    Analyze code complexity
 * @access  Public
 */
router.post(
  '/analyze',
  [
    body('code').notEmpty().withMessage('Code is required'),
    validate
  ],
  testController.analyzeCode
);

module.exports = router;
