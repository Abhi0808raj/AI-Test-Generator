const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  testCode: {
    type: String,
    required: true
  },
  result: {
    passed: Boolean,
    failed: Boolean,
    total: Number,
    output: String,
    error: String
  },
  executedAt: {
    type: Date,
    default: Date.now
  }
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['javascript', 'typescript'],
    default: 'javascript'
  },
  framework: {
    type: String,
    enum: ['jest', 'mocha'],
    default: 'jest'
  },
  generatedTests: [{
    type: String
  }],
  currentTest: {
    type: String
  },
  testHistory: [testResultSchema],
  metadata: {
    aiProvider: String,
    generatedAt: Date,
    tokensUsed: Number
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ name: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ tags: 1 });

// Virtual for test count
projectSchema.virtual('testCount').get(function() {
  return this.generatedTests ? this.generatedTests.length : 0;
});

// Method to add test result to history
projectSchema.methods.addTestResult = function(testCode, result) {
  this.testHistory.push({
    testCode,
    result,
    executedAt: new Date()
  });
  
  // Keep only last 20 test results
  if (this.testHistory.length > 20) {
    this.testHistory = this.testHistory.slice(-20);
  }
  
  return this.save();
};

// Static method to find recent projects
projectSchema.statics.findRecent = function(limit = 10) {
  return this.find()
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('name description framework language updatedAt');
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
