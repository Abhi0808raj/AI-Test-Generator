const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const projectController = require('../controllers/projectController');
const validate = require('../middleware/validator');

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Public
 */
router.post(
  '/',
  [
    body('name').notEmpty().trim().withMessage('Project name is required'),
    body('code').notEmpty().withMessage('Code is required'),
    body('description').optional().trim(),
    body('language').optional().isIn(['javascript', 'typescript']),
    body('framework').optional().isIn(['jest', 'mocha']),
    validate
  ],
  projectController.createProject
);

/**
 * @route   GET /api/projects
 * @desc    Get all projects
 * @access  Public
 */
router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('framework').optional().isIn(['jest', 'mocha']),
    query('language').optional().isIn(['javascript', 'typescript']),
    validate
  ],
  projectController.getProjects
);

/**
 * @route   GET /api/projects/statistics
 * @desc    Get project statistics
 * @access  Public
 */
router.get('/statistics', projectController.getStatistics);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    validate
  ],
  projectController.getProjectById
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Public
 */
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    body('name').optional().trim(),
    body('code').optional(),
    body('description').optional().trim(),
    validate
  ],
  projectController.updateProject
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Public
 */
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    validate
  ],
  projectController.deleteProject
);

/**
 * @route   POST /api/projects/:id/test-results
 * @desc    Add test result to project history
 * @access  Public
 */
router.post(
  '/:id/test-results',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    body('testCode').notEmpty().withMessage('Test code is required'),
    body('result').notEmpty().withMessage('Result is required'),
    validate
  ],
  projectController.addTestResult
);

module.exports = router;
