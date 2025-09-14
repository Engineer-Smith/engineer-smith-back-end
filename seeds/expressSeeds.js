// seeds/expressSeeds.js - Comprehensive Express questions with enhanced validation (67 total questions)
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Question = require('../models/Question');
const Organization = require('../models/Organization');
const User = require('../models/User');

// Import enhanced utilities
const QuestionTemplateGenerator = require('../utils/questionTemplate');
const QuestionSeedValidator = require('../utils/seedValidator');
const BatchProcessor = require('../utils/batchProcessor');

// Comprehensive Express questions data - 67 questions total
const expressQuestions = {
  // 25 Multiple Choice Questions (no category needed)
  multipleChoice: [
    {
      title: "Express Application",
      description: "What is the method to create an Express application?",
      options: ["express.create()", "express()", "new Express()", "express.init()"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["express", "nodejs"]
    },
    {
      title: "HTTP Methods",
      description: "Which Express method handles HTTP GET requests?",
      options: ["app.post()", "app.get()", "app.put()", "app.delete()"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["express", "routing"]
    },
    {
      title: "Middleware",
      description: "What is the role of middleware in Express?",
      options: ["Render templates", "Handle HTTP requests", "Serve static files", "All of the above"],
      correctAnswer: 3,
      difficulty: "easy",
      tags: ["express", "middleware"]
    },
    {
      title: "Request Object",
      description: "Which property of the request object contains URL parameters?",
      options: ["req.query", "req.body", "req.params", "req.headers"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Response Methods",
      description: "Which method sends a JSON response in Express?",
      options: ["res.send()", "res.json()", "res.render()", "res.status()"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["express", "routing"]
    },
    {
      title: "Error Handling",
      description: "How many arguments does an Express error-handling middleware function take?",
      options: ["2", "3", "4", "5"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["express", "error-handling"]
    },
    {
      title: "Static Files",
      description: "Which middleware serves static files in Express?",
      options: ["express.static()", "express.file()", "express.serve()", "express.assets()"],
      correctAnswer: 0,
      difficulty: "easy",
      tags: ["express", "middleware"]
    },
    {
      title: "Route Parameters",
      description: "How do you define a route parameter in Express?",
      options: ["/:param", "/{param}", "/<param>", "/param"],
      correctAnswer: 0,
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "JWT Authentication",
      description: "Which middleware is commonly used to verify JWT tokens in Express?",
      options: ["express-jwt", "jsonwebtoken", "jwt-verify", "auth-jwt"],
      correctAnswer: 0,
      difficulty: "hard",
      tags: ["express", "jwt"]
    },
    {
      title: "Express Router",
      description: "What is the purpose of express.Router()?",
      options: ["Serve static files", "Handle errors", "Group routes", "Parse JSON"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Body Parser",
      description: "Which middleware parses incoming JSON payloads?",
      options: ["express.json()", "express.urlencoded()", "express.body()", "express.parse()"],
      correctAnswer: 0,
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Response Status",
      description: "Which method sets the HTTP status code in Express?",
      options: ["res.sendStatus()", "res.status()", "res.setStatus()", "res.code()"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["express", "routing"]
    },
    {
      title: "Middleware Order",
      description: "When is middleware executed in Express?",
      options: ["After routes", "Before routes", "During response", "In parallel"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "CORS Handling",
      description: "Which middleware enables CORS in Express?",
      options: ["express.cors()", "cors()", "enable-cors()", "cross-origin()"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Express App Listen",
      description: "Which method starts an Express server?",
      options: ["app.start()", "app.run()", "app.listen()", "app.serve()"],
      correctAnswer: 2,
      difficulty: "easy",
      tags: ["express", "nodejs"]
    },
    {
      title: "Route Matching",
      description: "How does Express handle route matching?",
      options: ["Random order", "Alphabetical order", "First match wins", "All matches execute"],
      correctAnswer: 2,
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Express Templating",
      description: "Which method renders templates in Express?",
      options: ["res.template()", "res.render()", "res.view()", "res.display()"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Request Query Parameters",
      description: "How do you access query parameters in Express?",
      options: ["req.params", "req.query", "req.body", "req.url"],
      correctAnswer: 1,
      difficulty: "easy",
      tags: ["express", "routing"]
    },
    {
      title: "Express Session",
      description: "Which middleware is used for session management?",
      options: ["express-session", "session-express", "express-cookies", "cookie-session"],
      correctAnswer: 0,
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Response Headers",
      description: "Which method sets response headers in Express?",
      options: ["res.header()", "res.set()", "res.setHeader()", "All of the above"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Express Middleware Types",
      description: "Which type of middleware is executed for every request?",
      options: ["Route-level", "Application-level", "Error-handling", "Built-in"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Express App Configuration",
      description: "Which method is used to set application-level variables?",
      options: ["app.config()", "app.set()", "app.use()", "app.configure()"],
      correctAnswer: 1,
      difficulty: "medium",
      tags: ["express", "nodejs"]
    },
    {
      title: "Express Route Handlers",
      description: "How many callback functions can be passed to a route method?",
      options: ["Only one", "Up to two", "Up to three", "Multiple"],
      correctAnswer: 3,
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "Express Cookie Parser",
      description: "Which middleware is used to parse cookies in Express?",
      options: ["cookie-parser", "express-cookies", "cookie-middleware", "express-parser"],
      correctAnswer: 0,
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Express Response Redirect",
      description: "Which method redirects the client to a different URL?",
      options: ["res.redirect()", "res.forward()", "res.route()", "res.navigate()"],
      correctAnswer: 0,
      difficulty: "easy",
      tags: ["express", "routing"]
    }
  ],

  // 15 True/False Questions (no category needed)
  trueFalse: [
    {
      title: "Express Framework",
      description: "Express is a minimal and flexible Node.js web application framework.",
      options: ["true", "false"],
      correctAnswer: 0, // 0 for true, 1 for false
      difficulty: "easy",
      tags: ["express", "nodejs"]
    },
    {
      title: "Middleware Requirement",
      description: "Express requires middleware to handle all HTTP requests.",
      options: ["true", "false"],
      correctAnswer: 1, // false - Express can handle requests without middleware
      difficulty: "easy",
      tags: ["express", "middleware"]
    },
    {
      title: "Route Specificity",
      description: "Express matches routes in the order they are defined.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "JSON Parsing",
      description: "Express automatically parses JSON request bodies.",
      options: ["true", "false"],
      correctAnswer: 1, // false - needs express.json() middleware
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Error Middleware",
      description: "Error-handling middleware must have four parameters (err, req, res, next).",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["express", "error-handling"]
    },
    {
      title: "Static Files",
      description: "express.static() can serve files from multiple directories.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Route Parameters",
      description: "Route parameters in Express are accessed via req.query.",
      options: ["true", "false"],
      correctAnswer: 1, // false - they're accessed via req.params
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "JWT Security",
      description: "JWT tokens are secure without additional validation.",
      options: ["true", "false"],
      correctAnswer: 1, // false - they need validation
      difficulty: "hard",
      tags: ["express", "jwt"]
    },
    {
      title: "Response Methods",
      description: "res.json() automatically sets the Content-Type header to application/json.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "easy",
      tags: ["express", "routing"]
    },
    {
      title: "Middleware Chaining",
      description: "Multiple middleware functions can be applied to a single route.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Express Router",
      description: "express.Router() can be mounted as middleware.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["express", "routing"]
    },
    {
      title: "CORS Default",
      description: "Express enables CORS by default for all routes.",
      options: ["true", "false"],
      correctAnswer: 1, // false - CORS needs middleware
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "Error Propagation",
      description: "Calling next(error) passes errors to error-handling middleware.",
      options: ["true", "false"],
      correctAnswer: 0, // true
      difficulty: "medium",
      tags: ["express", "error-handling"]
    },
    {
      title: "Request Body",
      description: "req.body is always available without middleware.",
      options: ["true", "false"],
      correctAnswer: 1, // false - needs body parser middleware
      difficulty: "medium",
      tags: ["express", "middleware"]
    },
    {
      title: "HTTPS Support",
      description: "Express natively supports HTTPS without additional modules.",
      options: ["true", "false"],
      correctAnswer: 1, // false - needs https module
      difficulty: "hard",
      tags: ["express", "nodejs"]
    }
  ],

  // 12 Code Challenge Questions (logic category only)
  codeChallenge: [
    {
      title: "Create Basic Express Server",
      description: "Create a function that sets up a basic Express server that listens on port 3000.",
      difficulty: "easy",
      preferredCategory: "logic",
      tags: ["express", "nodejs", "functions"],
      codeTemplate: `function createServer() {
  // Write your code here
  // Import express, create app, add a basic route, and return the app
  // Hint: const express = require('express');
  
}`,
      codeConfig: {
        entryFunction: 'createServer',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [], expected: "express app", hidden: false },
        { args: [], expected: "server created", hidden: false },
        { args: [], expected: "app object", hidden: true },
        { args: [], expected: "configured", hidden: true }
      ]
    },
    {
      title: "Route Handler Function",
      description: "Create a function that adds a GET route handler to an Express app and returns a confirmation message.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["express", "routing", "functions"],
      codeTemplate: `function addGetRoute(path) {
  // Write your code here
  // Return a message indicating the route was added
  // Format: "GET route added for [path]"
  
}`,
      codeConfig: {
        entryFunction: 'addGetRoute',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ["/test"], expected: "GET route added for /test", hidden: false },
        { args: ["/api"], expected: "GET route added for /api", hidden: false },
        { args: ["/users"], expected: "GET route added for /users", hidden: true },
        { args: ["/home"], expected: "GET route added for /home", hidden: true }
      ]
    },
    {
      title: "Middleware Function",
      description: "Create a middleware function that logs requests and returns a confirmation message.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["express", "middleware", "functions"],
      codeTemplate: `function loggerMiddleware(method, path) {
  // Write your code here
  // Return a message: "Logged [method] request to [path]"
  
}`,
      codeConfig: {
        entryFunction: 'loggerMiddleware',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ["GET", "/test"], expected: "Logged GET request to /test", hidden: false },
        { args: ["POST", "/api"], expected: "Logged POST request to /api", hidden: false },
        { args: ["PUT", "/users"], expected: "Logged PUT request to /users", hidden: true },
        { args: ["DELETE", "/items"], expected: "Logged DELETE request to /items", hidden: true }
      ]
    },
    {
      title: "JSON Response Handler",
      description: "Create a function that formats a JSON response with status code information.",
      difficulty: "easy",
      preferredCategory: "logic",
      tags: ["express", "routing", "json"],
      codeTemplate: `function sendJsonResponse(data, statusCode = 200) {
  // Write your code here
  // Return a string: "JSON response with status [statusCode]"
  
}`,
      codeConfig: {
        entryFunction: 'sendJsonResponse',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [{ message: "success" }], expected: "JSON response with status 200", hidden: false },
        { args: [{ error: "not found" }, 404], expected: "JSON response with status 404", hidden: false },
        { args: [{ data: "test" }, 201], expected: "JSON response with status 201", hidden: true },
        { args: [{ warning: "deprecated" }, 410], expected: "JSON response with status 410", hidden: true }
      ]
    },
    {
      title: "Route Parameter Extractor",
      description: "Create a function that extracts and formats route parameters from a params object.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["express", "routing", "parameters"],
      codeTemplate: `function extractParams(params) {
  // Write your code here
  // If params has 'id', return just the id value
  // If params has multiple properties, return "key1:value1,key2:value2" format
  // If empty params, return "no params"
  
}`,
      codeConfig: {
        entryFunction: 'extractParams',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [{ id: "123" }], expected: "123", hidden: false },
        { args: [{ id: "456", name: "test" }], expected: "id:456,name:test", hidden: false },
        { args: [{}], expected: "no params", hidden: true },
        { args: [{ userId: "789", action: "edit" }], expected: "userId:789,action:edit", hidden: true }
      ]
    },
    {
      title: "Error Handler Middleware",
      description: "Create an error-handling function that processes errors and returns appropriate messages.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["express", "error-handling", "middleware"],
      codeTemplate: `function errorHandler(error, statusCode = 500) {
  // Write your code here
  // Return "Error handled: [error.message] (status: [statusCode])"
  // If no error message, use "Unknown error"
  
}`,
      codeConfig: {
        entryFunction: 'errorHandler',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [new Error("test error")], expected: "Error handled: test error (status: 500)", hidden: false },
        { args: [new Error("not found"), 404], expected: "Error handled: not found (status: 404)", hidden: false },
        { args: [new Error(""), 400], expected: "Error handled: Unknown error (status: 400)", hidden: true },
        { args: [new Error("server error"), 503], expected: "Error handled: server error (status: 503)", hidden: true }
      ]
    },
    {
      title: "Query Parameter Parser",
      description: "Create a function that processes and formats query parameters.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["express", "routing", "query-parameters"],
      codeTemplate: `function parseQuery(queryParams) {
  // Write your code here
  // Return query string format: "key1=value1&key2=value2"
  // If empty, return "no query params"
  
}`,
      codeConfig: {
        entryFunction: 'parseQuery',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [{ page: "1" }], expected: "page=1", hidden: false },
        { args: [{ page: "2", limit: "10" }], expected: "page=2&limit=10", hidden: false },
        { args: [{}], expected: "no query params", hidden: true },
        { args: [{ sort: "name", order: "asc", filter: "active" }], expected: "sort=name&order=asc&filter=active", hidden: true }
      ]
    },
    {
      title: "Static File Server",
      description: "Create a function that configures static file serving and returns a confirmation.",
      difficulty: "easy",
      preferredCategory: "logic",
      tags: ["express", "middleware", "static-files"],
      codeTemplate: `function setupStatic(directory) {
  // Write your code here
  // Return "Static files configured for [directory]"
  
}`,
      codeConfig: {
        entryFunction: 'setupStatic',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ["public"], expected: "Static files configured for public", hidden: false },
        { args: ["assets"], expected: "Static files configured for assets", hidden: false },
        { args: ["uploads"], expected: "Static files configured for uploads", hidden: true },
        { args: ["dist"], expected: "Static files configured for dist", hidden: true }
      ]
    },
    {
      title: "Router Module Creator",
      description: "Create a function that creates and configures an Express router.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["express", "routing", "modules"],
      codeTemplate: `function createRouter(basePath) {
  // Write your code here
  // Return "Router created for [basePath]" if basePath provided
  // Return "Router created" if no basePath
  
}`,
      codeConfig: {
        entryFunction: 'createRouter',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ["/users"], expected: "Router created for /users", hidden: false },
        { args: ["/api"], expected: "Router created for /api", hidden: false },
        { args: [], expected: "Router created", hidden: true },
        { args: ["/admin"], expected: "Router created for /admin", hidden: true }
      ]
    },
    {
      title: "Request Body Validator",
      description: "Create a function that validates request body data for required fields.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["express", "middleware", "validation"],
      codeTemplate: `function validateBody(body) {
  // Write your code here
  // Check if body has 'name' and 'email' properties
  // Return "valid" if both exist and are non-empty strings
  // Return "invalid" otherwise
  
}`,
      codeConfig: {
        entryFunction: 'validateBody',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [{ name: "test", email: "test@example.com" }], expected: "valid", hidden: false },
        { args: [{ name: "test" }], expected: "invalid", hidden: false },
        { args: [{ name: "", email: "invalid" }], expected: "invalid", hidden: true },
        { args: [{}], expected: "invalid", hidden: true }
      ]
    },
    {
      title: "HTTP Status Code Handler",
      description: "Create a function that returns appropriate HTTP status codes for different scenarios.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["express", "routing", "status-codes"],
      codeTemplate: `function getStatusCode(scenario) {
  // Write your code here
  // Return appropriate status codes:
  // "created" -> 201, "not_found" -> 404, "server_error" -> 500
  // "success" -> 200, "unauthorized" -> 401, default -> 200
  
}`,
      codeConfig: {
        entryFunction: 'getStatusCode',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ["created"], expected: 201, hidden: false },
        { args: ["not_found"], expected: 404, hidden: false },
        { args: ["server_error"], expected: 500, hidden: true },
        { args: ["unauthorized"], expected: 401, hidden: true }
      ]
    },
    {
      title: "Route Path Matcher",
      description: "Create a function that checks if a request path matches a route pattern.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["express", "routing", "patterns"],
      codeTemplate: `function matchRoute(requestPath, routePattern) {
  // Write your code here
  // Check if requestPath matches routePattern
  // Handle parameter patterns like /users/:id
  // Return true if match, false otherwise
  
}`,
      codeConfig: {
        entryFunction: 'matchRoute',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: ["/users/123", "/users/:id"], expected: true, hidden: false },
        { args: ["/posts/abc/comments", "/posts/:id/comments"], expected: true, hidden: false },
        { args: ["/invalid/path", "/users/:id"], expected: false, hidden: true },
        { args: ["/api/v1/users/456", "/api/v1/users/:id"], expected: true, hidden: true }
      ]
    }
  ],

  // Fixed codeDebugging section for expressSeeds.js
  codeDebugging: [
    {
      title: "Fix Missing JSON Middleware",
      description: "This function should return 'configured' when middleware is properly set up. Fix it.",
      difficulty: "easy",
      preferredCategory: "logic",
      tags: ["express", "middleware", "debugging"],
      buggyCode: `function solution() {
  // Missing middleware setup
  return 'not-configured';
}`,
      solutionCode: `function solution() {
  // Middleware properly configured
  return 'configured';
}`,
      codeConfig: {
        entryFunction: 'solution',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [], expected: 'configured', hidden: false },
        { args: [], expected: 'configured', hidden: false },
        { args: [], expected: 'configured', hidden: true }
      ]
    },
    {
      title: "Fix Route Parameter Access",
      description: "This function accesses route parameters incorrectly. Fix the property access.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["express", "routing", "debugging"],
      buggyCode: `function solution(reqObject) {
  return 'User: ' + reqObject.query.id;
}`,
      solutionCode: `function solution(reqObject) {
  return 'User: ' + reqObject.params.id;
}`,
      codeConfig: {
        entryFunction: 'solution',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [{ params: { id: '123' }, query: { id: '456' } }], expected: 'User: 123', hidden: false },
        { args: [{ params: { id: '789' }, query: { id: '000' } }], expected: 'User: 789', hidden: false },
        { args: [{ params: { id: 'abc' }, query: { id: 'xyz' } }], expected: 'User: abc', hidden: true }
      ]
    },
    {
      title: "Fix Error Handler Parameters",
      description: "This error handler has the wrong number of parameters. Fix it to return the correct parameter count.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["express", "error-handling", "debugging"],
      buggyCode: `function solution() {
  function errorHandler(req, res, next) {
    return 'Error handler';
  }
  return errorHandler.length;
}`,
      solutionCode: `function solution() {
  function errorHandler(err, req, res, next) {
    return 'Error handler';
  }
  return errorHandler.length;
}`,
      codeConfig: {
        entryFunction: 'solution',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [], expected: 4, hidden: false },
        { args: [], expected: 4, hidden: false },
        { args: [], expected: 4, hidden: true }
      ]
    },
    {
      title: "Fix Route Order Logic",
      description: "This function determines route precedence incorrectly. Fix the logic for Express route matching.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["express", "routing", "debugging"],
      buggyCode: `function solution(routes) {
  const specificIndex = routes.indexOf('/users/new');
  const paramIndex = routes.indexOf('/users/:id');
  return paramIndex < specificIndex;
}`,
      solutionCode: `function solution(routes) {
  const specificIndex = routes.indexOf('/users/new');
  const paramIndex = routes.indexOf('/users/:id');
  return specificIndex < paramIndex;
}`,
      codeConfig: {
        entryFunction: 'solution',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [['/users/new', '/users/:id']], expected: true, hidden: false },
        { args: [['/users/:id', '/users/new']], expected: false, hidden: false },
        { args: [['/users/new', '/users/edit', '/users/:id']], expected: true, hidden: true }
      ]
    },
    {
      title: "Fix Middleware Chain Function",
      description: "This middleware function has the wrong number of parameters. Fix it to have the correct Express middleware signature.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["express", "middleware", "debugging"],
      buggyCode: `function solution() {
  function middleware(req, res) {
    return 'middleware';
  }
  return middleware.length;
}`,
      solutionCode: `function solution() {
  function middleware(req, res, next) {
    return 'middleware';
  }
  return middleware.length;
}`,
      codeConfig: {
        entryFunction: 'solution',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [], expected: 3, hidden: false },
        { args: [], expected: 3, hidden: false },
        { args: [], expected: 3, hidden: true }
      ]
    },
    {
      title: "Fix Status Code Function",
      description: "This function returns the wrong status code for resource creation. Fix it to return the correct HTTP status.",
      difficulty: "easy",
      preferredCategory: "logic",
      tags: ["express", "routing", "debugging"],
      buggyCode: `function solution() {
  return 200;
}`,
      solutionCode: `function solution() {
  return 201;
}`,
      codeConfig: {
        entryFunction: 'solution',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [], expected: 201, hidden: false },
        { args: [], expected: 201, hidden: false },
        { args: [], expected: 201, hidden: true }
      ]
    },
    {
      title: "Fix CORS Header Function",
      description: "This function sets CORS headers incorrectly. Fix the origin header value to allow all origins.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["express", "middleware", "debugging"],
      buggyCode: `function solution(headers) {
  headers = headers || {};
  headers['Access-Control-Allow-Origin'] = 'localhost';
  return headers['Access-Control-Allow-Origin'];
}`,
      solutionCode: `function solution(headers) {
  headers = headers || {};
  headers['Access-Control-Allow-Origin'] = '*';
  return headers['Access-Control-Allow-Origin'];
}`,
      codeConfig: {
        entryFunction: 'solution',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [{}], expected: '*', hidden: false },
        { args: [{ 'Custom-Header': 'test' }], expected: '*', hidden: false },
        { args: [{}], expected: '*', hidden: true }
      ]
    },
    {
      title: "Fix Express Router Logic",
      description: "This function should return whether a router is properly configured. Fix the logic to check both conditions correctly.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["express", "routing", "debugging"],
      buggyCode: `function solution(routerInfo) {
  return routerInfo.hasRoutes && !routerInfo.isMounted;
}`,
      solutionCode: `function solution(routerInfo) {
  return routerInfo.hasRoutes && routerInfo.isMounted;
}`,
      codeConfig: {
        entryFunction: 'solution',
        runtime: 'node',
        timeoutMs: 3000
      },
      testCases: [
        { args: [{ hasRoutes: true, isMounted: true }], expected: true, hidden: false },
        { args: [{ hasRoutes: true, isMounted: false }], expected: false, hidden: false },
        { args: [{ hasRoutes: false, isMounted: true }], expected: false, hidden: true }
      ]
    }
  ],

  // 7 Fill in the Blank Questions - 4 Syntax + 3 Logic
  fillInTheBlank: [
    // 4 Syntax category questions
    {
      title: "Complete Express Server Setup",
      description: "Fill in the blanks to create a basic Express server.",
      difficulty: "easy",
      preferredCategory: "syntax",
      tags: ["express", "nodejs"],
      codeTemplate: `const express = require('express');
const app = ___blank1___;

app.get('/', (req, res) => {
  res.___blank2___('Hello World!');
});

app.___blank3___(3000);`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["express()", "express()"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["send", "json"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank3",
          correctAnswers: ["listen"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "Complete Middleware Function",
      description: "Fill in the blanks to create proper middleware.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["express", "middleware"],
      codeTemplate: `app.use((req, res, ___blank1___) => {
  console.log('Request method:', req.___blank2___);
  ___blank3___();
});`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["next"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["method"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank3",
          correctAnswers: ["next", "next()"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "Complete Route with Parameters",
      description: "Fill in the blanks for route parameters.",
      difficulty: "medium",
      preferredCategory: "syntax",
      tags: ["express", "routing"],
      codeTemplate: `app.get('/user/___blank1___', (req, res) => {
  const userId = req.___blank2___.id;
  res.json({ id: ___blank3___ });
});`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: [":id"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["params"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank3",
          correctAnswers: ["userId"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "Complete Error Handler",
      description: "Fill in the blanks for error handling middleware.",
      difficulty: "hard",
      preferredCategory: "syntax",
      tags: ["express", "error-handling"],
      codeTemplate: `app.use((___blank1___, req, res, next) => {
  res.status(500).___blank2___({
    error: err.___blank3___
  });
});`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["err", "error"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["json", "send"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank3",
          correctAnswers: ["message"],
          caseSensitive: false,
          points: 1
        }
      ]
    },

    // 3 Logic category questions
    {
      title: "Complete Router Logic",
      description: "Fill in the blanks to create and mount a router with logic.",
      difficulty: "medium",
      preferredCategory: "logic",
      tags: ["express", "routing"],
      codeTemplate: `const router = express.Router();

router.get('/users', (req, res) => {
  const users = ___blank1___.filter(u => u.active);
  res.json(users.___blank2___(___blank3___));
});

app.use('/api', router);`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["userData", "userList", "users"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["slice", "splice"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank3",
          correctAnswers: ["0, 10", "0,10"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "Complete Validation Logic",
      description: "Fill in the blanks for request validation logic.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["express", "middleware"],
      codeTemplate: `app.post('/users', (req, res) => {
  const { name, email } = req.body;
  
  if (!name || name.___blank1___ < 2) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  
  if (!email || !email.___blank2___('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  res.status(___blank3___).json({ message: 'User created' });
});`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["length"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["includes", "indexOf"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank3",
          correctAnswers: ["201"],
          caseSensitive: false,
          points: 1
        }
      ]
    },
    {
      title: "Complete Authentication Logic",
      description: "Fill in the blanks for JWT authentication logic.",
      difficulty: "hard",
      preferredCategory: "logic",
      tags: ["express", "jwt", "middleware"],
      codeTemplate: `const authenticateToken = (req, res, next) => {
  const authHeader = req.___blank1___['authorization'];
  const token = authHeader && authHeader.___blank2___(' ')[1];
  
  if (!token) {
    return res.___blank3___(401);
  }
  
  // Verify token logic here
  next();
};`,
      blanks: [
        {
          id: "blank1",
          correctAnswers: ["headers"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank2",
          correctAnswers: ["split"],
          caseSensitive: false,
          points: 1
        },
        {
          id: "blank3",
          correctAnswers: ["sendStatus"],
          caseSensitive: false,
          points: 1
        }
      ]
    }
  ]
};

async function seedExpressQuestions() {
  const startTime = Date.now();
  const validator = new QuestionSeedValidator();
  const processor = new BatchProcessor({ logProgress: true, batchSize: 15 });

  try {
    console.log('🚀 Starting COMPREHENSIVE Express question seeding with enhanced validation...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Get super organization and user
    const superOrg = await Organization.findOne({ isSuperOrg: true });
    if (!superOrg) throw new Error('No super organization found');

    const superUser = await User.findOne({ organizationId: superOrg._id, role: 'admin' });
    if (!superUser) throw new Error('No super admin user found');

    console.log(`🏢 Using organization: ${superOrg.name}`);
    console.log(`👤 Using user: ${superUser.name || 'Admin User'}\n`);

    // Count questions by type with enhanced stats
    const questionCounts = Object.entries(expressQuestions).map(([type, questions]) =>
      `${type}: ${questions.length}`
    ).join(', ');
    const totalQuestions = Object.values(expressQuestions).reduce((sum, arr) => sum + arr.length, 0);
    const fillInBlankCount = expressQuestions.fillInTheBlank.length;
    const totalBlanks = expressQuestions.fillInTheBlank.reduce((sum, q) => sum + q.blanks.length, 0);

    // Count categories
    const syntaxFillInBlanks = expressQuestions.fillInTheBlank.filter(q => q.preferredCategory === 'syntax').length;
    const logicFillInBlanks = expressQuestions.fillInTheBlank.filter(q => q.preferredCategory === 'logic').length;

    console.log(`📊 COMPREHENSIVE Question breakdown: ${questionCounts}`);
    console.log(`📈 Total questions to seed: ${totalQuestions}`);
    console.log(`🔥 Fill-in-blank questions: ${fillInBlankCount} with ${totalBlanks} total blanks`);
    console.log(`🎯 Fill-in-blank categories: ${syntaxFillInBlanks} syntax + ${logicFillInBlanks} logic`);
    console.log(`🎯 Difficulty distribution: Easy, Medium, Hard across all types\n`);

    // Create backup of existing questions
    const backup = await processor.createBackup('express');

    // Delete existing Express questions
    await processor.deleteByLanguage('express');

    // Prepare all questions with proper templates
    console.log('🔧 Preparing questions with templates...');
    const allQuestions = [];

    for (const [type, questions] of Object.entries(expressQuestions)) {
      console.log(`  Processing ${questions.length} ${type} questions...`);

      for (const questionData of questions) {
        try {
          const templated = QuestionTemplateGenerator.createQuestionTemplate(
            { ...questionData, type, language: 'express', status: 'active' },
            superOrg._id,
            superUser._id
          );
          allQuestions.push(templated);
        } catch (error) {
          console.error(`  ❌ Template generation failed for "${questionData.title}": ${error.message}`);
        }
      }
    }

    console.log(`📊 Generated ${allQuestions.length} templated questions\n`);

    // Enhanced validation with comprehensive testing
    console.log('🔍 Running COMPREHENSIVE validation with enhanced grading testing...');
    const validationResults = await validator.validateBatch(allQuestions, {
      testAutoGrading: true // Includes both code execution AND fill-in-blank grading validation
    });

    console.log('');
    validator.printValidationSummary();
    console.log('');

    // Insert valid questions
    if (validationResults.validQuestions.length > 0) {
      console.log(`📦 Inserting ${validationResults.validQuestions.length} valid questions...`);
      const insertResults = await processor.insertBatch(validationResults.validQuestions);

      processor.printProcessingSummary(insertResults, 'Express');

      // Verify insertions
      if (insertResults.insertedIds.length > 0) {
        const verification = await processor.verifyInsertedQuestions(insertResults.insertedIds);
        console.log(`\n🔍 Verification: ${verification.found}/${insertResults.insertedIds.length} questions found in database`);
      }

      // Comprehensive success reporting
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('\n🎉 COMPREHENSIVE Express question seeding completed successfully!');
      console.log(`📈 Final count: ${insertResults.success} questions inserted`);
      console.log(`⏱️  Total time: ${duration} seconds`);
      console.log(`🚀 Performance: ${(insertResults.success / parseFloat(duration)).toFixed(1)} questions/second`);

      // Enhanced validation breakdown
      if (validationResults.summary) {
        console.log(`\n📊 Validation Results:`);
        console.log(`   ✅ Valid: ${validationResults.summary.valid}/${validationResults.summary.total} (${((validationResults.summary.valid / validationResults.summary.total) * 100).toFixed(1)}%)`);
        console.log(`   ❌ Invalid: ${validationResults.summary.invalid}/${validationResults.summary.total}`);
        console.log(`   ⚠️  With Warnings: ${validationResults.summary.warnings}`);
      }

      // Show detailed question type breakdown
      const insertedByType = {};
      allQuestions.forEach(q => {
        insertedByType[q.type] = (insertedByType[q.type] || 0) + 1;
      });

      console.log(`\n🎯 Question Type Breakdown:`);
      Object.entries(insertedByType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} questions`);
      });

      // Show invalid questions if any
      if (validationResults.invalidQuestions.length > 0) {
        console.log(`\n❌ ${validationResults.invalidQuestions.length} questions failed validation:`);
        validationResults.invalidQuestions.forEach(({ question, result }) => {
          console.log(`   - ${question.title}: ${result.errors.join(', ')}`);
        });
      }

      // Return the inserted questions for the master script
      return await Question.find({ language: 'express' }).select('_id title type');

    } else {
      console.log('❌ No valid questions to insert');

      // Restore backup if available
      if (backup) {
        console.log('🔄 Restoring from backup...');
        await processor.restoreFromBackup(backup);
      }

      return [];
    }

  } catch (error) {
    console.error('💥 Express seeding failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedExpressQuestions()
    .then((questions) => {
      console.log(`\n🎉 SUCCESS! Seeded ${questions.length} comprehensive Express questions with enhanced validation!`);
      console.log(`🔥 Ready for production use with robust validation testing!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to seed Express questions:', error);
      process.exit(1);
    });
}

module.exports = { seedExpressQuestions, expressQuestions };