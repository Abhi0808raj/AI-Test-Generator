const Project = require('../models/Project');

/**
 * Create a new project
 */
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, code, language, framework, generatedTests, currentTest, metadata, tags } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Project name and code are required'
      });
    }

    // Check if project with same name exists
    const existingProject = await Project.findOne({ name });
    if (existingProject) {
      return res.status(409).json({
        error: 'Project already exists',
        message: `A project with the name "${name}" already exists`
      });
    }

    // Create new project
    const project = new Project({
      name,
      description,
      code,
      language: language || 'javascript',
      framework: framework || 'jest',
      generatedTests: generatedTests || [],
      currentTest,
      metadata,
      tags: tags || []
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });

  } catch (error) {
    console.error('Create project error:', error);
    next(error);
  }
};

/**
 * Get all projects
 */
exports.getProjects = async (req, res, next) => {
  try {
    const { limit = 50, sort = '-updatedAt', search, framework, language } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (framework) {
      query.framework = framework;
    }
    if (language) {
      query.language = language;
    }

    // Execute query
    const projects = await Project.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .select('-testHistory'); // Exclude test history for list view

    res.json({
      success: true,
      count: projects.length,
      projects
    });

  } catch (error) {
    console.error('Get projects error:', error);
    next(error);
  }
};

/**
 * Get project by ID
 */
exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: `No project found with ID: ${id}`
      });
    }

    res.json({
      success: true,
      project
    });

  } catch (error) {
    console.error('Get project error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid project ID',
        message: 'The provided project ID is not valid'
      });
    }
    next(error);
  }
};

/**
 * Update project
 */
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating createdAt
    delete updates.createdAt;
    delete updates._id;

    const project = await Project.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: `No project found with ID: ${id}`
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      project
    });

  } catch (error) {
    console.error('Update project error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid project ID',
        message: 'The provided project ID is not valid'
      });
    }
    next(error);
  }
};

/**
 * Delete project
 */
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: `No project found with ID: ${id}`
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully',
      project: { id: project._id, name: project.name }
    });

  } catch (error) {
    console.error('Delete project error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid project ID',
        message: 'The provided project ID is not valid'
      });
    }
    next(error);
  }
};

/**
 * Add test result to project history
 */
exports.addTestResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { testCode, result } = req.body;

    if (!testCode || !result) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both testCode and result are required'
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: `No project found with ID: ${id}`
      });
    }

    await project.addTestResult(testCode, result);

    res.json({
      success: true,
      message: 'Test result added to history',
      project
    });

  } catch (error) {
    console.error('Add test result error:', error);
    next(error);
  }
};

/**
 * Get project statistics
 */
exports.getStatistics = async (req, res, next) => {
  try {
    const totalProjects = await Project.countDocuments();
    
    const frameworkStats = await Project.aggregate([
      { $group: { _id: '$framework', count: { $sum: 1 } } }
    ]);

    const languageStats = await Project.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } }
    ]);

    const recentProjects = await Project.findRecent(5);

    res.json({
      success: true,
      statistics: {
        totalProjects,
        frameworks: frameworkStats,
        languages: languageStats,
        recentProjects
      }
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    next(error);
  }
};
