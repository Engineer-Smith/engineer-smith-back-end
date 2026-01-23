# Engineer Smith Backend

NestJS backend for the Engineer Smith coding assessment platform. Handles user authentication, question management, test administration, and secure code execution.

## Architecture Overview

```
src/
├── auth/              # JWT authentication, guards, SSO
├── user/              # User management
├── organization/      # Multi-tenant organization support
├── question/          # Question CRUD and type-specific logic
├── test/              # Test (assessment) management
├── test-session/      # Live test-taking sessions
├── grading/           # Code execution and grading engine
├── code-challenge/    # Practice mode code challenges
├── result/            # Test results and analytics
├── gateway/           # WebSocket gateway for real-time updates
├── notification/      # User notifications
├── admin/             # Admin-only endpoints
├── schemas/           # Mongoose schemas
├── tags/              # Question tagging system
└── common/            # Shared utilities
```

## Core Systems

### Question Types

| Type | Description |
|------|-------------|
| `multipleChoice` | Single correct answer from options |
| `trueFalse` | Boolean answer |
| `fillInTheBlank` | Text input blanks in code |
| `dragDropCloze` | Drag tokens into blanks |
| `codeChallenge` | Write code, run against test cases |
| `codeDebugging` | Fix buggy code to pass tests |

### Supported Languages

**Logic languages** (support `codeChallenge` and `codeDebugging`):
- JavaScript, TypeScript, Python, SQL, Dart, Swift, Express

**UI languages** (no code execution):
- HTML, CSS, React, React Native, Flutter, SwiftUI

### Code Execution Runtimes

| Runtime | Languages | Execution Method |
|---------|-----------|------------------|
| `node` | JavaScript, TypeScript, React, Express | Child process with isolated-vm |
| `python` | Python | Child process with memory limits |
| `sql` | SQL | sql.js (in-memory SQLite) |
| `dart` | Dart | Child process with heap limits |
| `swift` | Swift, SwiftUI | Child process |

## Grading System

### Queue System

Code execution uses a priority queue to manage concurrency:

- **Max concurrent jobs**: 8 total, 3 per language
- **Priority levels**: `high` (test sessions), `normal` (practice)
- **Security scanning**: All code scanned before queueing

```
POST /grading/queue/status    # Lightweight status (any auth user)
GET  /grading/queue/metrics   # Full metrics (admin only)
POST /grading/queue/reset-metrics  # Reset counters (admin only)
```

### Security Scanner

All submitted code is scanned for prohibited patterns before execution:

- **JavaScript**: `eval()`, `require('fs')`, `process.exit`, prototype pollution
- **Python**: `import os`, `exec()`, `subprocess`, infinite loops
- **Swift**: `FileManager`, `URLSession`, `Process`
- **Dart**: `dart:io`, `dart:ffi`, `Process`
- **SQL**: `INTO OUTFILE`, `SLEEP()`, `BENCHMARK()`

Rejected code returns an error without entering the queue.

### Resource Limits

| Limit | Value |
|-------|-------|
| Output size | 1 MB |
| Default timeout | 5000 ms |
| SQL row limit | 1000 rows |
| Python memory | ~128 MB |
| Dart heap | 64 MB |

## Test Sessions

Test sessions are stateful, real-time assessments:

1. **Start**: Creates a snapshot of the test (questions frozen at start time)
2. **Progress**: WebSocket connection tracks answers, time, navigation
3. **Sections**: Optional timed sections with independent timers
4. **Grace period**: 5-minute reconnection window on disconnect
5. **Completion**: Auto-submit on timeout, manual submit, or expiration

### Session States

```
inProgress → paused (disconnect) → inProgress (reconnect)
                                 → expired (grace period exceeded)
inProgress → completed (submitted)
inProgress → expired (time limit)
```

## API Structure

### Authentication
- `POST /auth/login` - Email/password login
- `POST /auth/register` - New user registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/sso` - SSO token exchange

### Questions
- `GET /questions` - List with filters
- `POST /questions` - Create (by type)
- `PATCH /questions/:id` - Update
- `DELETE /questions/:id` - Soft delete
- `POST /questions/:id/test` - Test question execution

### Tests
- `GET /tests` - List assessments
- `POST /tests` - Create assessment
- `PATCH /tests/:id` - Update
- `POST /tests/:id/start` - Start session

### Test Sessions
- `GET /test-sessions/active` - Get active session
- `POST /test-sessions/:id/answer` - Submit answer
- `POST /test-sessions/:id/navigate` - Change question
- `POST /test-sessions/:id/submit` - Submit test

### Code Challenges (Practice)
- `POST /code-challenge/run` - Execute code with tests

## WebSocket Events

Connection: `wss://{WS_URL}/gateway`

### Client → Server
- `test:heartbeat` - Keep-alive ping
- `test:answer` - Submit answer
- `test:navigate` - Change question

### Server → Client
- `test:state` - Full session state
- `test:timeUpdate` - Remaining time
- `test:questionResult` - Answer feedback
- `test:completed` - Test finished

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB
- Python 3 (for Python execution)
- Dart SDK (for Dart execution)
- Swift (for Swift execution)

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your values
```

### Environment Variables

```bash
# Required
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<random-32-byte-hex>
JWT_REFRESH_SECRET=<random-32-byte-hex>

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# WebSocket
WS_URL=ws.yourdomain.com

# Optional
SSO_SHARED_SECRET=<for-sso-integration>
FRONTEND_URL=http://localhost:5173
```

### Running

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Tests
npm run test
npm run test:e2e
```

## Multi-Tenancy

Questions and tests are scoped by organization:

- **Global** (`isGlobal: true`): Available to all organizations
- **Organization-specific**: Only visible to that org's users
- **User-created**: Owned by creating user, scoped to their org

## Admin Features

Admin endpoints require `AdminOnly()` decorator and admin role:

- Queue metrics and reset
- Security scan metrics
- Organization management
- Global question/test management
