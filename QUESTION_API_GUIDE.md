# Question API Guide

This document covers the question creation and update endpoints for the frontend.

## Overview

Questions are now created via **type-specific endpoints** instead of a single generic endpoint. Each question type has its own validation and required fields.

## Question Types

| Type | Endpoint | Description |
|------|----------|-------------|
| Multiple Choice | `/questions/multiple-choice` | Standard multiple choice with options |
| True/False | `/questions/true-false` | Binary true/false questions |
| Fill in the Blank | `/questions/fill-in-blank` | Code template with blanks to fill |
| Code Challenge | `/questions/code-challenge` | Write code to pass test cases |
| Code Debugging | `/questions/code-debugging` | Fix buggy code to pass tests |

---

## Common Fields (All Question Types)

These fields are shared across all question types:

```typescript
{
  title: string;           // Required
  description: string;     // Required
  language: Language;      // Required - see values below
  difficulty: Difficulty;  // Required - see values below
  category?: Category;     // Optional - see values below
  status?: QuestionStatus; // Optional - defaults to 'draft'
  isGlobal?: boolean;      // Optional - only super admins can set true
  tags?: string[];         // Optional
}
```

### Enum Values

**Language:**
```typescript
'javascript' | 'typescript' | 'python' | 'dart' | 'sql' | 'express' | 'html' | 'css' | 'general'
```

**Difficulty:**
```typescript
'easy' | 'medium' | 'hard'
```

**Category:**
```typescript
'syntax' | 'logic' | 'debugging' | 'concept' | 'best-practice'
```

**Status:**
```typescript
'draft' | 'published' | 'archived'
```

---

## 1. Multiple Choice

### Create: `POST /questions/multiple-choice`

```typescript
{
  // Common fields
  title: string;
  description: string;
  language: Language;
  difficulty: Difficulty;

  // Type-specific fields
  options: string[];      // Required - minimum 2 options
  correctAnswer: number;  // Required - 0-based index of correct option

  // Optional
  category?: Category;
  status?: QuestionStatus;
  isGlobal?: boolean;
  tags?: string[];
}
```

**Example:**
```json
{
  "title": "JavaScript Array Method",
  "description": "Which method adds an element to the end of an array?",
  "language": "javascript",
  "difficulty": "easy",
  "options": ["unshift()", "push()", "pop()", "shift()"],
  "correctAnswer": 1,
  "category": "syntax",
  "tags": ["arrays", "methods"]
}
```

### Update: `PATCH /questions/:id/multiple-choice`

All fields optional. Only send fields you want to update.

```json
{
  "options": ["Option A", "Option B", "Option C"],
  "correctAnswer": 2
}
```

---

## 2. True/False

### Create: `POST /questions/true-false`

```typescript
{
  // Common fields
  title: string;
  description: string;
  language: Language;
  difficulty: Difficulty;

  // Type-specific fields
  correctAnswer: number;  // Required - 0 for True, 1 for False

  // Optional
  category?: Category;
  status?: QuestionStatus;
  isGlobal?: boolean;
  tags?: string[];
}
```

**Example:**
```json
{
  "title": "Python List Mutability",
  "description": "In Python, lists are immutable data structures.",
  "language": "python",
  "difficulty": "easy",
  "correctAnswer": 1,
  "category": "concept"
}
```

> **Note:** The `options` field is automatically set to `["True", "False"]` and cannot be changed.

### Update: `PATCH /questions/:id/true-false`

```json
{
  "correctAnswer": 0,
  "description": "Updated statement here"
}
```

---

## 3. Fill in the Blank

### Create: `POST /questions/fill-in-blank`

```typescript
{
  // Common fields
  title: string;
  description: string;
  language: Language;
  difficulty: Difficulty;

  // Type-specific fields
  codeTemplate: string;   // Required - code with {{blankId}} placeholders
  blanks: Blank[];        // Required - at least one blank

  // Optional
  category?: Category;
  status?: QuestionStatus;
  isGlobal?: boolean;
  tags?: string[];
}

interface Blank {
  id: string;              // Unique identifier matching {{id}} in template
  correctAnswers: string[]; // Array of acceptable answers
  hint?: string;           // Optional hint for the blank
}
```

**Example:**
```json
{
  "title": "JavaScript Arrow Function",
  "description": "Complete the arrow function syntax",
  "language": "javascript",
  "difficulty": "easy",
  "codeTemplate": "const add = (a, b) {{arrow}} a + b;",
  "blanks": [
    {
      "id": "arrow",
      "correctAnswers": ["=>", " => "],
      "hint": "The arrow function operator"
    }
  ],
  "category": "syntax"
}
```

**Multiple Blanks Example:**
```json
{
  "title": "Python List Comprehension",
  "description": "Complete the list comprehension",
  "language": "python",
  "difficulty": "medium",
  "codeTemplate": "squares = [{{expr}} {{keyword}} x in range(10)]",
  "blanks": [
    {
      "id": "expr",
      "correctAnswers": ["x**2", "x*x", "x ** 2", "x * x"]
    },
    {
      "id": "keyword",
      "correctAnswers": ["for"]
    }
  ]
}
```

### Update: `PATCH /questions/:id/fill-in-blank`

```json
{
  "codeTemplate": "const multiply = (a, b) {{arrow}} a * b;",
  "blanks": [
    {
      "id": "arrow",
      "correctAnswers": ["=>"]
    }
  ]
}
```

---

## 4. Code Challenge

### Create: `POST /questions/code-challenge`

```typescript
{
  // Common fields
  title: string;
  description: string;
  language: Language;      // javascript, typescript, python, dart, sql, express
  difficulty: Difficulty;

  // Type-specific fields
  codeConfig: CodeConfig;  // Required
  testCases: TestCase[];   // Required - at least one
  starterCode?: string;    // Optional - initial code shown to user

  // Optional
  status?: QuestionStatus;
  isGlobal?: boolean;
  tags?: string[];
}

interface CodeConfig {
  entryFunction: string;   // Required for non-SQL languages
  runtime?: string;        // Auto-set based on language if not provided
}

// For non-SQL languages:
interface TestCase {
  args: any[];             // Arguments to pass to function
  expected: any;           // Expected return value
  isHidden?: boolean;      // Hide from user (for grading only)
  description?: string;    // Optional description
}

// For SQL:
interface SqlTestCase {
  schemaSql: string;       // SQL to create tables
  seedSql?: string;        // SQL to insert test data
  expectedRows: any[];     // Expected query results
  isHidden?: boolean;
  description?: string;
}
```

**JavaScript Example:**
```json
{
  "title": "Sum Two Numbers",
  "description": "Write a function that returns the sum of two numbers.",
  "language": "javascript",
  "difficulty": "easy",
  "starterCode": "function sum(a, b) {\n  // Your code here\n}",
  "codeConfig": {
    "entryFunction": "sum"
  },
  "testCases": [
    {
      "args": [1, 2],
      "expected": 3,
      "description": "Basic addition"
    },
    {
      "args": [-1, 1],
      "expected": 0,
      "description": "Negative numbers"
    },
    {
      "args": [100, 200],
      "expected": 300,
      "isHidden": true
    }
  ]
}
```

**SQL Example:**
```json
{
  "title": "Select All Users",
  "description": "Write a query to select all users ordered by name.",
  "language": "sql",
  "difficulty": "easy",
  "starterCode": "SELECT * FROM users",
  "codeConfig": {},
  "testCases": [
    {
      "schemaSql": "CREATE TABLE users (id INT, name VARCHAR(50), email VARCHAR(100));",
      "seedSql": "INSERT INTO users VALUES (1, 'Alice', 'alice@test.com'), (2, 'Bob', 'bob@test.com');",
      "expectedRows": [
        { "id": 1, "name": "Alice", "email": "alice@test.com" },
        { "id": 2, "name": "Bob", "email": "bob@test.com" }
      ]
    }
  ]
}
```

### Update: `PATCH /questions/:id/code-challenge`

```json
{
  "testCases": [
    { "args": [5, 5], "expected": 10 },
    { "args": [0, 0], "expected": 0 }
  ]
}
```

---

## 5. Code Debugging

### Create: `POST /questions/code-debugging`

```typescript
{
  // Common fields
  title: string;
  description: string;
  language: Language;      // javascript, typescript, python, dart, express (NOT sql)
  difficulty: Difficulty;

  // Type-specific fields
  buggyCode: string;       // Required - code with bugs
  solutionCode: string;    // Required - correct solution
  codeConfig: CodeConfig;  // Required
  testCases: TestCase[];   // Required - at least one
  hints?: string[];        // Optional hints about the bugs

  // Optional
  status?: QuestionStatus;
  isGlobal?: boolean;
  tags?: string[];
}

interface CodeConfig {
  entryFunction: string;   // Required
  runtime?: string;        // Auto-set based on language
}

interface TestCase {
  args: any[];
  expected: any;
  isHidden?: boolean;
  description?: string;
}
```

**Example:**
```json
{
  "title": "Fix the Factorial Function",
  "description": "The factorial function has a bug. Find and fix it.",
  "language": "javascript",
  "difficulty": "medium",
  "buggyCode": "function factorial(n) {\n  if (n === 0) return 0;\n  return n * factorial(n - 1);\n}",
  "solutionCode": "function factorial(n) {\n  if (n === 0) return 1;\n  return n * factorial(n - 1);\n}",
  "codeConfig": {
    "entryFunction": "factorial"
  },
  "testCases": [
    { "args": [0], "expected": 1, "description": "Base case" },
    { "args": [5], "expected": 120 },
    { "args": [10], "expected": 3628800, "isHidden": true }
  ],
  "hints": [
    "Check the base case return value"
  ]
}
```

### Update: `PATCH /questions/:id/code-debugging`

```json
{
  "buggyCode": "function factorial(n) {\n  if (n <= 1) return 0;\n  return n * factorial(n - 1);\n}",
  "hints": ["What should factorial(0) return?", "The base case is wrong"]
}
```

---

## Response Format

All create/update endpoints return:

```typescript
{
  success: boolean;
  message: string;
  question: {
    id: string;
    type: QuestionType;
    title: string;
    description: string;
    language: Language;
    difficulty: Difficulty;
    category?: Category;
    status: QuestionStatus;
    isGlobal: boolean;
    tags: string[];
    createdBy: string;
    organizationId?: string;
    createdAt: string;
    updatedAt: string;
    // ... type-specific fields
  }
}
```

---

## Error Responses

**400 Bad Request** - Validation errors:
```json
{
  "statusCode": 400,
  "message": "title is required, at least one test case is required",
  "error": "Bad Request"
}
```

**401 Unauthorized** - Not authenticated

**403 Forbidden** - No permission to update question

---

## Language Support by Question Type

| Language | Multiple Choice | True/False | Fill in Blank | Code Challenge | Code Debugging |
|----------|----------------|------------|---------------|----------------|----------------|
| javascript | ✅ | ✅ | ✅ | ✅ | ✅ |
| typescript | ✅ | ✅ | ✅ | ✅ | ✅ |
| python | ✅ | ✅ | ✅ | ✅ | ✅ |
| dart | ✅ | ✅ | ✅ | ✅ | ✅ |
| sql | ✅ | ✅ | ✅ | ✅ | ❌ |
| express | ✅ | ✅ | ✅ | ✅ | ✅ |
| html | ✅ | ✅ | ✅ | ❌ | ❌ |
| css | ✅ | ✅ | ✅ | ❌ | ❌ |
| general | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## Legacy Endpoint

The generic `POST /questions` endpoint still works but requires you to specify the `type` field:

```json
{
  "type": "multipleChoice",
  "title": "...",
  // ... all fields for that type
}
```

**Recommended:** Use the type-specific endpoints for better validation and clearer API contracts.
