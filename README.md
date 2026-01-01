# AI-Based Unit Test Generator

An intelligent tool that automatically generates unit tests for JavaScript/TypeScript functions using AI (OpenAI GPT-4 or Google Gemini). Features include a Monaco code editor, live test execution in a secure sandbox, and project persistence with MongoDB.

## 🚀 Features

- **AI-Powered Test Generation**: Generate Jest/Mocha tests using OpenAI or Google Gemini
- **Monaco Code Editor**: Professional code editing experience with syntax highlighting
- **Lightning Fast**: Built with Vite for instant dev server and HMR
- **Live Test Execution**: Run tests in a secure sandboxed environment
- **Project Management**: Save and retrieve projects with MongoDB
- **Test History**: Track all generated tests and their results
- **Secure Sandbox**: Isolated code execution to prevent malicious operations
- **Multi-Framework Support**: Generate tests for Jest or Mocha

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- OpenAI API Key OR Google Gemini API Key

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ai-test-generator
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-test-generator
NODE_ENV=development

# Choose one AI provider:
OPENAI_API_KEY=your_openai_api_key_here
# OR
GEMINI_API_KEY=your_gemini_api_key_here

# AI Provider (openai or gemini)
AI_PROVIDER=openai

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

Make sure MongoDB is running:

```bash
# If using Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or start local MongoDB:
mongod
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📖 Usage Guide

### 1. Write or Paste Your Function

Enter your JavaScript/TypeScript function in the Monaco editor:

```javascript
function calculateSum(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return a + b;
}
```

### 2. Generate Tests

- Select your preferred test framework (Jest or Mocha)
- Click "Generate Tests" button
- AI will analyze your function and generate comprehensive test cases

### 3. Review and Edit

- Generated tests appear in the test editor below
- Edit tests as needed
- Tests include edge cases, error handling, and type validation

### 4. Run Tests

- Click "Run Tests" to execute in the secure sandbox
- View results with pass/fail status
- Check console output for detailed information

### 5. Save Project

- Enter a project name
- Click "Save Project" to persist to MongoDB
- Load saved projects anytime from the sidebar

## 🏗️ Architecture

```
ai-test-generator/
├── backend/
│   ├── src/
│   │   ├── routes/          # API route definitions
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── utils/           # Helper functions (AI, sandbox)
│   │   ├── middleware/      # Auth, error handling
│   │   └── server.js        # Express app setup
│   ├── .env                 # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── services/        # API calls
    │   ├── hooks/           # Custom React hooks
    │   └── App.js           # Main component
    ├── .env
    └── package.json
```

## 🔒 Security Features

### Sandbox Execution
- Uses `vm2` library for isolated code execution
- Restricted access to system resources
- Timeout limits to prevent infinite loops
- Memory limits to prevent resource exhaustion
- No access to filesystem, network, or process

### API Security
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 🧪 Sample Demo Function

Try this sample function to see the tool in action:

```javascript
/**
 * Validates and formats a user's email address
 * @param {string} email - Email address to validate
 * @returns {string} Formatted email in lowercase
 * @throws {Error} If email is invalid
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('Email must be a non-empty string');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  
  return email.toLowerCase().trim();
}
```

Expected generated tests will cover:
- Valid email formats
- Invalid formats (missing @, missing domain, etc.)
- Edge cases (null, undefined, empty string)
- Type validation
- Trimming and lowercase conversion

## 📊 API Endpoints

### Test Generation
```http
POST /api/tests/generate
Content-Type: application/json

{
  "code": "function code here",
  "framework": "jest",
  "language": "javascript"
}
```

### Project Management
```http
POST /api/projects
GET /api/projects
GET /api/projects/:id
PUT /api/projects/:id
DELETE /api/projects/:id
```

### Test Execution
```http
POST /api/tests/execute
Content-Type: application/json

{
  "code": "function code",
  "testCode": "test code"
}
```

## 🔧 Configuration Options

### AI Provider Selection

The tool supports two AI providers:

**OpenAI (GPT-4):**
- More expensive but highly accurate
- Better at understanding complex code patterns
- Set `AI_PROVIDER=openai` in .env

**Google Gemini:**
- More cost-effective
- Good for simpler functions
- Set `AI_PROVIDER=gemini` in .env

### Test Framework Selection

- **Jest**: Modern, feature-rich, zero config
- **Mocha**: Flexible, widely adopted

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running:
mongo --eval "db.stats()"

# Restart MongoDB:
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod            # Linux
```

### Sandbox Execution Errors
- Ensure vm2 is properly installed: `npm install vm2`
- Check Node.js version (v16+ required)
- Verify code doesn't use restricted operations

### AI API Errors
- Verify API key is correct in .env
- Check API quota and billing status
- Ensure proper network connectivity

## 📝 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

Built with ❤️ for developers who want to write better tests faster.
