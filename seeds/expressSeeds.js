const mongoose = require('mongoose');
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');
require('dotenv').config();

const expressQuestions = {
  multipleChoice: [
    {
      title: "Express Application",
      description: "What is the method to create an Express application?",
      options: ["", "express.create()", "express()", "new Express()", "express.init()"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["express", "nodejs"]
    },
    {
      title: "HTTP Methods",
      description: "Which Express method handles HTTP GET requests?",
      options: ["", "app.post()", "app.get()", "app.put()", "app.delete()"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["express", "routing"]
    },
    {
      title: "Middleware",
      description: "What is the role of middleware in Express?",
      options: ["", "Render templates", "Handle HTTP requests", "Serve static files", "All of the above"],
      correctAnswer: 4,
      difficulty: "easy",
      tags: ["express", "middleware"]
    },
    {
      title: "Request Object",
      description: "Which property of the request object contains URL parameters?",
      options: ["", "req.query", "req.body", "req.params", "req.headers"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Response Methods",
      description: "Which method sends a JSON response in Express?",
      options: ["", "res.send()", "res.json()", "res.render()", "res.status()"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["express", "routing"]
    },
    {
      title: "Error Handling",
      description: "How many arguments does an Express error-handling middleware function take?",
      options: ["", "2", "3", "4", "5"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["express", "error-handling"]
    },
    {
      title: "Static Files",
      description: "Which middleware serves static files in Express?",
      options: ["", "express.static()", "express.file()", "express.serve()", "express.assets()"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["express", "middleware"]
    },
    {
      title: "Route Parameters",
      description: "How do you define a route parameter in Express?",
      options: ["", "/:param", "/{param}", "/<param>", "/param"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "JWT Authentication",
      description: "Which middleware is commonly used to verify JWT tokens in Express?",
      options: ["", "express-jwt", "jsonwebtoken", "jwt-verify", "auth-jwt"],
      correctAnswer: 1,
      difficulty: "hard",
      tags: ["express", "middleware"]
    },
    {
      title: "Express Router",
      description: "What is the purpose of express.Router()?",
      options: ["", "Serve static files", "Handle errors", "Group routes", "Parse JSON"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Body Parser",
      description: "Which middleware parses incoming JSON payloads?",
      options: ["", "express.json()", "express.urlencoded()", "express.body()", "express.parse()"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Response Status",
      description: "Which method sets the HTTP status code in Express?",
      options: ["", "res.sendStatus()", "res.status()", "res.setStatus()", "res.code()"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["express", "routing"]
    },
    {
      title: "Middleware Order",
      description: "When is middleware executed in Express?",
      options: ["", "After routes", "Before routes", "During response", "In parallel"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "CORS Handling",
      description: "Which middleware enables CORS in Express?",
      options: ["", "express.cors()", "cors()", "enable-cors()", "cross-origin()"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Express App Listen",
      description: "Which method starts an Express server?",
      options: ["", "app.start()", "app.run()", "app.listen()", "app.serve()"],
      correctAnswer: 3,
      difficulty: "easy",
      tags: ["express", "nodejs"]
    }
  ],
  trueFalse: [
    {
      title: "Express Framework",
      description: "Express is a minimal and flexible Node.js web application framework.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["express", "nodejs"]
    },
    {
      title: "Middleware Requirement",
      description: "Express requires middleware to handle all HTTP requests.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "easy",
      tags: ["express", "middleware"]
    },
    {
      title: "Route Specificity",
      description: "Express matches routes in the order they are defined.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "JSON Parsing",
      description: "Express automatically parses JSON request bodies.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Error Middleware",
      description: "Error-handling middleware must have four parameters (err, req, res, next).",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["express", "error-handling"]
    },
    {
      title: "Static Files",
      description: "express.static() can serve files from multiple directories.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Route Parameters",
      description: "Route parameters in Express are accessed via req.query.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "JWT Security",
      description: "JWT tokens are secure without additional validation.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "hard",
      tags: ["express", "middleware"]
    },
    {
      title: "Response Methods",
      description: "res.json() automatically sets the Content-Type header to application/json.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "easy",
      tags: ["express", "routing"]
    },
    {
      title: "Middleware Chaining",
      description: "Multiple middleware functions can be applied to a single route.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Express Router",
      description: "express.Router() can be mounted as middleware.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "CORS Default",
      description: "Express enables CORS by default for all routes.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Error Propagation",
      description: "Calling next(error) passes errors to error-handling middleware.",
      options: ["", "true", "false"],
      correctAnswer: true,
      difficulty: "medium",
      tags: ["express", "error-handling"]
    },
    {
      title: "Request Body",
      description: "req.body is always available without middleware.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "HTTPS Support",
      description: "Express natively supports HTTPS without additional modules.",
      options: ["", "true", "false"],
      correctAnswer: false,
      difficulty: "hard",
      tags: ["express", "nodejs"]
    }
  ],
  codeChallenge: [
    {
      title: "Create a Basic Express Server",
      description: "Set up an Express server that listens on port 3000 and responds with 'Hello, World!' on the root route.",
      options: ["const express = require('express');\nconst app = express();\n// Your code here"],
      testCases: [
        { input: "Server setup", output: "Uses app.listen(3000)", hidden: false },
        { input: "Root route", output: "Handles GET / with Hello, World!", hidden: false },
        { input: "Correct response", output: "Sends text response", hidden: true }
      ],
      difficulty: "easy",
      tags: ["express", "nodejs", "routing"]
    },
    {
      title: "Create a REST API Endpoint",
      description: "Create a GET endpoint that returns a JSON array of users.",
      options: ["const express = require('express');\nconst app = express();\n// Your code here"],
      testCases: [
        { input: "GET endpoint", output: "Handles GET /users", hidden: false },
        { input: "JSON response", output: "Returns array of users", hidden: false },
        { input: "Content-Type", output: "Sets application/json header", hidden: true }
      ],
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Implement Middleware",
      description: "Create a middleware that logs the request method and URL.",
      options: ["const express = require('express');\nconst app = express();\n// Your code here"],
      testCases: [
        { input: "Middleware setup", output: "Logs method and URL", hidden: false },
        { input: "Middleware chain", output: "Calls next()", hidden: false },
        { input: "Correct logging", output: "Logs to console", hidden: true }
      ],
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Create a POST Endpoint",
      description: "Create a POST endpoint that accepts JSON data and returns it.",
      options: ["const express = require('express');\nconst app = express();\n// Your code here"],
      testCases: [
        { input: "JSON parsing", output: "Uses express.json()", hidden: false },
        { input: "POST handling", output: "Handles POST request", hidden: false },
        { input: "Response data", output: "Returns request body", hidden: true }
      ],
      difficulty: "medium",
      tags: ["express", "routing", "middleware"]
    },
    {
      title: "Implement Route Parameters",
      description: "Create an endpoint with a route parameter to return a specific item by ID.",
      options: ["const express = require('express');\nconst app = express();\n// Your code here"],
      testCases: [
        { input: "Route parameter", output: "Uses /:id in route", hidden: false },
        { input: "Parameter access", output: "Accesses req.params.id", hidden: false },
        { input: "Item response", output: "Returns item data", hidden: true }
      ],
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Create Error Handling Middleware",
      description: "Implement an error-handling middleware that returns a 500 status with error message.",
      options: ["const express = require('express');\nconst app = express();\n// Your code here"],
      testCases: [
        { input: "Error middleware", output: "Has four parameters", hidden: false },
        { input: "Status code", output: "Sets 500 status", hidden: false },
        { input: "Error response", output: "Returns error message", hidden: true }
      ],
      difficulty: "hard",
      tags: ["express", "error-handling"]
    },
    {
      title: "Set Up Static File Serving",
      description: "Configure Express to serve static files from a 'public' directory.",
      options: ["const express = require('express');\nconst app = express();\n// Your code here"],
      testCases: [
        { input: "Static middleware", output: "Uses express.static()", hidden: false },
        { input: "Directory setup", output: "Serves from public directory", hidden: false },
        { input: "File access", output: "Serves files correctly", hidden: true }
      ],
      difficulty: "easy",
      tags: ["express", "middleware"]
    },
    {
      title: "Implement JWT Authentication",
      description: "Create a protected route using JWT middleware.",
      options: ["const express = require('express');\nconst jwt = require('express-jwt');\nconst app = express();\n// Your code here"],
      testCases: [
        { input: "JWT middleware", output: "Uses express-jwt", hidden: false },
        { input: "Protected route", output: "Requires valid token", hidden: false },
        { input: "Error handling", output: "Handles invalid tokens", hidden: true }
      ],
      difficulty: "hard",
      tags: ["express", "middleware"]
    },
    {
      title: "Create a Router Module",
      description: "Create an Express Router for user-related routes.",
      options: ["const express = require('express');\nconst router = express.Router();\n// Your code here"],
      testCases: [
        { input: "Router setup", output: "Uses express.Router()", hidden: false },
        { input: "Route definitions", output: "Defines user routes", hidden: false },
        { input: "Router export", output: "Exports router module", hidden: true }
      ],
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Implement Query Parameters",
      description: "Create an endpoint that filters data based on query parameters.",
      options: ["const express = require('express');\nconst app = express();\n// Your code here"],
      testCases: [
        { input: "Query access", output: "Uses req.query", hidden: false },
        { input: "Filtering", output: "Processes query parameters", hidden: false },
        { input: "Response data", output: "Returns filtered results", hidden: true }
      ],
      difficulty: "medium",
      tags: ["express", "routing"]
    }
  ],
  codeDebugging: [
    {
      title: "Fix Missing Middleware",
      description: "This POST endpoint doesn't parse JSON. Add the necessary middleware.",
      options: ["const express = require('express');\nconst app = express();\napp.post('/data', (req, res) => {\n  res.json(req.body);\n});"],
      testCases: [
        { input: "JSON parsing", output: "Adds express.json()", hidden: false },
        { input: "POST handling", output: "Accesses req.body", hidden: false },
        { input: "Correct response", output: "Returns JSON data", hidden: true }
      ],
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Fix Route Order",
      description: "This route order causes incorrect handling. Fix the route definitions.",
      options: ["const express = require('express');\nconst app = express();\napp.get('/users/:id', (req, res) => res.send('User'));\napp.get('/users/list', (req, res) => res.send('List'));"],
      testCases: [
        { input: "Route order", output: "Places specific routes first", hidden: false },
        { input: "Correct handling", output: "Handles /users/list correctly", hidden: false },
        { input: "Parameter route", output: "Preserves /users/:id", hidden: true }
      ],
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Fix Error Handling",
      description: "This app doesn't handle errors properly. Add error-handling middleware.",
      options: ["const express = require('express');\nconst app = express();\napp.get('/', (req, res, next) => {\n  next(new Error('Something went wrong'));\n});"],
      testCases: [
        { input: "Error middleware", output: "Adds error-handling middleware", hidden: false },
        { input: "Status code", output: "Sets appropriate status", hidden: false },
        { input: "Error response", output: "Returns error message", hidden: true }
      ],
      difficulty: "hard",
      tags: ["express", "error-handling"]
    },
    {
      title: "Fix Static File Path",
      description: "This static file serving is broken. Fix the path configuration.",
      options: ["const express = require('express');\nconst app = express();\napp.use(express.static('files'));"],
      testCases: [
        { input: "Correct path", output: "Uses valid directory path", hidden: false },
        { input: "Static serving", output: "Serves files correctly", hidden: false },
        { input: "Middleware setup", output: "Uses express.static()", hidden: true }
      ],
      difficulty: "easy",
      tags: ["express", "middleware"]
    },
    {
      title: "Fix Route Parameter",
      description: "This route parameter isn't working. Fix the parameter access.",
      options: ["const express = require('express');\nconst app = express();\napp.get('/user/:id', (req, res) => {\n  res.send(`User: ${req.query.id}`);\n});"],
      testCases: [
        { input: "Parameter access", output: "Uses req.params.id", hidden: false },
        { input: "Correct response", output: "Returns correct user ID", hidden: false },
        { input: "Route definition", output: "Maintains /user/:id", hidden: true }
      ],
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Fix JWT Middleware",
      description: "This JWT middleware isn't applied correctly. Fix the authentication.",
      options: ["const express = require('express');\nconst jwt = require('express-jwt');\nconst app = express();\napp.get('/protected', (req, res) => res.send('Protected'));"],
      testCases: [
        { input: "JWT middleware", output: "Uses express-jwt", hidden: false },
        { input: "Protected route", output: "Requires valid token", hidden: false },
        { input: "Error handling", output: "Handles invalid tokens", hidden: true }
      ],
      difficulty: "hard",
      tags: ["express", "middleware"]
    },
    {
      title: "Fix Response Status",
      description: "This endpoint returns incorrect status codes. Fix the response handling.",
      options: ["const express = require('express');\nconst app = express();\napp.get('/data', (req, res) => {\n  res.send('Success');\n});"],
      testCases: [
        { input: "Status code", output: "Sets 200 status explicitly", hidden: false },
        { input: "Response data", output: "Maintains response content", hidden: false },
        { input: "Correct headers", output: "Sets appropriate headers", hidden: true }
      ],
      difficulty: "easy",
      tags: ["express", "routing"]
    },
    {
      title: "Fix Router Mounting",
      description: "This router isn't mounted correctly. Fix the router setup.",
      options: ["const express = require('express');\nconst app = express();\nconst router = express.Router();\nrouter.get('/users', (req, res) => res.send('Users'));"],
      testCases: [
        { input: "Router mounting", output: "Uses app.use() for router", hidden: false },
        { input: "Route handling", output: "Handles /users correctly", hidden: false },
        { input: "Router export", output: "Maintains router structure", hidden: true }
      ],
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Fix Query Parameter Handling",
      description: "This endpoint doesn't handle query parameters correctly. Fix it.",
      options: ["const express = require('express');\nconst app = express();\napp.get('/search', (req, res) => {\n  res.send('Results');\n});"],
      testCases: [
        { input: "Query access", output: "Uses req.query", hidden: false },
        { input: "Filtering", output: "Processes query parameters", hidden: false },
        { input: "Response data", output: "Returns filtered results", hidden: true }
      ],
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Fix Middleware Chain",
      description: "This middleware chain is broken. Fix the next() calls.",
      options: ["const express = require('express');\nconst app = express();\napp.use((req, res) => {\n  console.log('Middleware');\n});"],
      testCases: [
        { input: "Middleware chain", output: "Calls next()", hidden: false },
        { input: "Request handling", output: "Allows request to proceed", hidden: false },
        { input: "Correct logging", output: "Maintains middleware logic", hidden: true }
      ],
      difficulty: "medium",
      tags: ["express", "middleware"]
    }
  ]
};

async function seedExpressQuestions() {
  try {
    console.log('Seeding Express questions...');

    await mongoose.connect(process.env.MONGO_URL);

    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    await Question.deleteMany({ language: 'express' });

    const allQuestions = [];

    ['multipleChoice', 'trueFalse', 'codeChallenge', 'codeDebugging'].forEach(type => {
      expressQuestions[type].forEach(q => {
        allQuestions.push({
          ...q,
          type,
          language: 'express',
          status: 'draft',
          isGlobal: true,
          organizationId: superOrg._id,
          createdBy: superUser._id
        });
      });
    });

    const inserted = await Question.insertMany(allQuestions);
    console.log(`✅ Inserted ${inserted.length} Express questions`);
    console.log(`   - Multiple Choice: ${expressQuestions.multipleChoice.length}`);
    console.log(`   - True/False: ${expressQuestions.trueFalse.length}`);
    console.log(`   - Code Challenge: ${expressQuestions.codeChallenge.length}`);
    console.log(`   - Code Debugging: ${expressQuestions.codeDebugging.length}`);

    return inserted;
  } catch (error) {
    console.error('Error seeding Express questions:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  seedExpressQuestions()
    .then(() => {
      console.log('Express questions seeded successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to seed Express questions:', error);
      process.exit(1);
    });
}

module.exports = { seedExpressQuestions, expressQuestions };