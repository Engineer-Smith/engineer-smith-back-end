# Engineer Smith Nest - Full Architecture Analysis

## Project Overview

**Engineer Smith Nest** is a full-stack educational assessment and coding platform, rebuilt from the ground up as a **NestJS monolith** (V2 architecture). This is Jordan's **solo work** — a complete rewrite of the original Express-based microservices into a cohesive, production-grade NestJS application serving real students at coding bootcamps and educational institutions.

The platform enables instructors to create multi-format assessments (multiple choice, true/false, fill-in-the-blank, drag-drop cloze, code challenges, code debugging), run timed test sessions with real-time WebSocket communication, execute student code in sandboxed environments across 4 languages, grade automatically, and provide analytics — all within a single deployable monolith.

---

## Migration Rationale: V1 (Express) to V2 (NestJS)

The first commit (`d3dfe88`, Jan 21 2026) is titled **"NestJS server rewrite"** — a 174-file, 26,597-line initial commit that established the entire architecture from scratch. The subsequent commit `fc1665f` ("monolith app") added 249 files / 76,872 lines, consolidating the dashboard frontend into the monorepo.

**Why the migration happened:**

1. **Architectural Consolidation**: Moving from scattered Express microservices to a structured NestJS monolith with proper module boundaries, dependency injection, and clear separation of concerns
2. **Type Safety at Scale**: Full TypeScript with DTOs, interfaces, and decorators providing compile-time guarantees across the entire codebase
3. **Built-in Patterns**: NestJS guard/interceptor/pipe/filter architecture replaced hand-rolled middleware — the codebase has JWT guards, CSRF guards, role guards, organization guards, validation pipes, and exception filters all as composable, declarative units
4. **Operational Simplicity**: Single deployment target (monolith serving both API and static dashboard) instead of coordinating multiple services — the `render-build` script builds both API and dashboard in one step
5. **Module Encapsulation**: Each domain (auth, grading, questions, test-sessions, notifications, etc.) is a proper NestJS module with its own controllers, services, DTOs, and guards, but sharing schemas through a central `SchemasModule`

---

## Complete Tech Stack

### Backend (NestJS v11)
| Category | Technology |
|---|---|
| **Framework** | NestJS 11 (latest) |
| **Language** | TypeScript 5.7 |
| **Database** | MongoDB via Mongoose 9 / @nestjs/mongoose 11 |
| **Auth** | Passport JWT + bcrypt + cookie-based tokens + SSO |
| **Real-time** | Socket.IO via @nestjs/websockets + @nestjs/platform-socket.io |
| **Security** | Helmet, CORS, CSRF tokens, rate limiting (@nestjs/throttler) |
| **Scheduling** | @nestjs/schedule (cron-based session cleanup) |
| **Validation** | class-validator + class-transformer (global ValidationPipe) |
| **Code Execution** | Node.js sandboxed processes, Python sandboxed processes, sql.js (SQL in-memory DB), Dart SDK |
| **Static Serving** | @nestjs/serve-static (serves React dashboard in production) |

### Frontend (Dashboard — React + Vite)
| Category | Technology |
|---|---|
| **Framework** | React (TypeScript) |
| **Build** | Vite |
| **Styling** | Tailwind CSS |
| **Testing** | Playwright (E2E) |
| **Lines** | 168 TSX files, ~53,900 lines |

### Infrastructure
- **Deployment**: Render (single service — `render-build` script)
- **Database**: MongoDB Atlas (connection pooling configured)
- **Monorepo**: `npm run dev` starts both API and dashboard concurrently

---

## Codebase Metrics

| Metric | Value |
|---|---|
| **TypeScript files (backend)** | 228 |
| **TypeScript lines (backend)** | ~49,000 |
| **TSX files (frontend)** | 168 |
| **TSX lines (frontend)** | ~53,900 |
| **Total lines (full-stack)** | ~103,000 |
| **MongoDB schemas** | 15 (User, Organization, Question, Test, TestSession, Result, CodeChallenge, Track, ChallengeSubmission, UserChallengeProgress, UserTrackProgress, Notification, AttemptRequest, StudentTestOverride) |
| **NestJS modules** | 14 (Auth, Grading, Question, Test, TestSession, Result, User, Student, Organization, Admin, CodeChallenge, Tags, Notification, Gateway) |
| **Custom guards** | 5 (JWT, CSRF, Roles, Organization, WS-JWT) |
| **Custom decorators** | 5 (@CurrentUser, @Public, @Roles, @SkipCsrf, @RequireSuperOrg) |
| **Code runners** | 4 (Node/TS, Python, SQL, Dart) |

### Git History

| Stat | Value |
|---|---|
| **Total commits** | 21 |
| **Development period** | Jan 21, 2026 – Feb 9, 2026 (~3 weeks) |
| **Total insertions** | 125,481 |
| **Total deletions** | 2,493 |
| **Net lines** | ~122,988 |
| **Largest commit** | `fc1665f` — 249 files, 76,872 insertions (monolith consolidation with dashboard) |
| **Initial commit** | `d3dfe88` — 174 files, 26,597 insertions (NestJS server rewrite) |
| **Security hardening** | `f35bb2f` — dedicated security commit |

---

## Architecture Deep-Dive

### Module Structure

```
src/
├── main.ts                          # Bootstrap with helmet, CORS, validation pipe, exception filter
├── app.module.ts                    # Root module — imports all feature modules, global guards
├── schemas/                         # Centralized Mongoose schemas (15 schemas)
│   ├── schemas.module.ts            # Shared SchemasModule exports
│   ├── user.schema.ts               # User with SSO, preferences, roles
│   ├── organization.schema.ts       # Multi-tenant organizations
│   ├── question.schema.ts           # Polymorphic question model (6 types)
│   ├── test.schema.ts               # Assessment configuration
│   ├── test-session.schema.ts       # Live test session state machine
│   ├── result.schema.ts             # Graded results with per-question breakdown
│   ├── code-challenge.schema.ts     # Standalone coding challenges
│   ├── track.schema.ts              # Learning tracks (challenge collections)
│   ├── challenge-submission.schema.ts
│   ├── user-challenge-progress.schema.ts
│   ├── user-track-progress.schema.ts
│   ├── notification.schema.ts       # Real-time notifications
│   ├── attempt-request.schema.ts    # Student attempt request workflow
│   └── student-test-override.schema.ts
│
├── auth/                            # Authentication and Authorization
│   ├── auth.controller.ts           # 10 endpoints (register, login, SSO, refresh, etc.)
│   ├── auth.service.ts              # JWT + SSO + bcrypt + CSRF token generation
│   ├── strategies/jwt.strategy.ts   # Passport JWT strategy
│   ├── guards/                      # 4 guards
│   │   ├── jwt-auth.guard.ts        # Global JWT guard (respects @Public)
│   │   ├── csrf.guard.ts            # CSRF protection for cookie-based auth
│   │   ├── roles.guard.ts           # RBAC: admin, instructor, student
│   │   └── organization.guard.ts    # Multi-tenant org scoping + super-org admin detection
│   └── decorators/                  # 5 custom decorators
│       ├── current-user.decorator.ts
│       ├── public.decorator.ts
│       ├── roles.decorator.ts       # @Roles(), @AdminOrInstructor(), @AdminOnly(), @AnyRole()
│       ├── skip-csrf.decorator.ts
│       └── super-org.decorator.ts
│
├── grading/                         # Code Execution and Grading Engine
│   ├── grading.service.ts           # Orchestrates all grading (code + fill-in-blank)
│   ├── code-execution.service.ts    # Queue management with priority, concurrency, metrics
│   ├── runners/                     # 4 language-specific sandboxed runners
│   │   ├── node-runner.service.ts   # JS/TS execution in sandboxed process (128MB limit)
│   │   ├── python-runner.service.ts # Python execution with memory limits
│   │   ├── sql-runner.service.ts    # SQL execution via sql.js (in-memory DB per test)
│   │   └── dart-runner.service.ts   # Dart execution with heap limits
│   ├── graders/
│   │   └── fill-in-blank.grader.ts  # Partial credit grading with case sensitivity
│   └── security/
│       └── code-scanner.service.ts  # Pre-execution security scanning (banned patterns)
│
├── question/                        # Polymorphic Question System
│   ├── question.controller.ts       # Unified controller for all 6 question types
│   ├── question.module.ts
│   ├── question.builder.ts
│   ├── services/
│   │   ├── question.service.ts      # CRUD, filtering, pagination
│   │   ├── question-duplicate.service.ts
│   │   ├── question-formatter.service.ts
│   │   ├── question-testing.service.ts
│   │   └── question-validation.service.ts
│   ├── shared/                      # Shared types and constants
│   ├── multiple-choice/             # Builder pattern per question type
│   ├── true-false/
│   ├── fill-in-blank/
│   ├── code-challenge/
│   ├── code-debugging/
│   └── drag-drop-cloze/
│
├── test-session/                    # Real-time Test Session Engine
│   ├── test-session.service.ts      # Facade pattern — coordinates all sub-services
│   ├── test-session.controller.ts
│   └── services/
│       ├── session-manager.service.ts    # Session lifecycle, reconnection, recovery
│       ├── question-handler.service.ts   # Question navigation, answer submission
│       ├── snapshot.service.ts           # Test snapshot creation with seeded shuffling
│       ├── timer.service.ts             # Per-session timer management with warnings
│       └── session-cleanup.service.ts   # Cron-based stale session cleanup
│
├── code-challenge/                  # Standalone Coding Challenges (LeetCode-style)
│   ├── code-challenge.controller.ts
│   ├── code-challenge.service.ts     # Tracks, challenges, submissions, progress
│   ├── code-challenge-admin.controller.ts
│   └── code-challenge-admin.service.ts  # 1,065 lines — admin CRUD for challenges/tracks
│
├── gateway/                         # WebSocket Gateway
│   ├── gateway.ts                   # 727 lines — Socket.IO gateway with JWT auth
│   └── guards/ws-jwt.guard.ts       # WebSocket-specific JWT validation
│
├── notification/                    # Notification System
│   ├── notification.service.ts      # CRUD + attempt requests + real-time via gateway
│   └── notification.controller.ts
│
├── admin/                           # Admin Dashboard API
│   ├── admin.service.ts             # User management, analytics, attempt grants
│   └── admin.controller.ts
│
├── result/                          # Test Results and Analytics
│   └── services/
│       ├── result.service.ts
│       ├── result-formatter.service.ts
│       └── result-validation.service.ts
│
├── user/                            # User Management
├── student/                         # Student-specific operations
├── organization/                    # Multi-tenant Organization Management
├── tags/                            # Tagging System
└── common/
    └── filters/
        └── http-exception.filter.ts # Global exception filter (consistent error responses)
```

---

## Key Features and Technical Achievements

### 1. Multi-Language Code Execution Engine
The crown jewel of the system. Student-submitted code runs in sandboxed processes across 4 languages:

- **JavaScript/TypeScript** (`node-runner.service.ts`): Spawns Node.js process with `--max-old-space-size=128` memory limit. TypeScript is compiled on-the-fly using `ts.transpile()`. Captures console.log output by overriding console methods.
- **Python** (`python-runner.service.ts`): Spawns `python3` process. Sets `resource.RLIMIT_AS` to 128MB. Overrides `print()` to capture output without mixing with JSON results.
- **SQL** (`sql-runner.service.ts`): Uses `sql.js` (SQLite compiled to WASM) — creates a fresh in-memory database per test case with schema/seed SQL, validates single-statement, compares results with order sensitivity options. Max 1,000 rows per query.
- **Dart** (`dart-runner.service.ts`): Spawns `dart` process with `--old-gen-heap-size=64`. Handles async function calls and type conversion edge cases.

Each runner implements:
- Temporary directory creation with cryptographic IDs for isolation
- 1MB output limit with automatic process termination
- Configurable timeout with SIGTERM followed by SIGKILL escalation
- Deep equality comparison for test assertions
- Console log capture (type, message, timestamp per entry)
- Cleanup of temp files in `finally` blocks

### 2. Code Execution Queue System (`code-execution.service.ts`)
A production-grade in-memory job queue with:
- **Concurrency control**: Max 8 concurrent jobs total, max 3 per language
- **Priority queuing**: High-priority queue (timed test submissions) + normal queue
- **Pre-execution security scanning**: Every code submission is scanned by `CodeScannerService` before queuing
- **Health monitoring**: Queue depth, average wait time, running-by-language breakdown
- **Metrics tracking**: Total processed, timeouts, errors, rolling average wait times

### 3. Security Scanner (`code-scanner.service.ts`)
Pre-execution code analysis with language-specific banned patterns:
- **JavaScript/TypeScript**: Blocks dangerous module imports, eval, process manipulation, prototype pollution, infinite loops
- **Python**: Blocks dangerous imports (os, subprocess, socket), code execution functions, introspection abuse
- **Dart**: Blocks dangerous imports (dart:io, dart:ffi), file/network operations
- **SQL**: Blocks file operations (INTO OUTFILE), time delays (SLEEP, BENCHMARK), locking functions
- **Universal**: Path traversal detection across all languages
- **Metrics**: Tracks rejection rates and recent violations for admin monitoring

### 4. Real-Time Test Session Engine
Full WebSocket-based timed assessment system:
- **Session lifecycle**: `inProgress` → `paused` (disconnection) → `completed`/`abandoned`/`expired`
- **Reconnection handling**: Grace period on disconnect, timer pause/resume, session recovery
- **Timer service**: Per-session timers with 30-second sync, warnings at 5min/1min/30sec
- **Question navigation**: Forward/backward, skip, section transitions
- **Test snapshots**: Seeded random shuffling for consistent question order per student
- **Atomic section completion**: Uses MongoDB `findOneAndUpdate` with condition checks to prevent race conditions
- **Session cleanup**: Cron job (every hour) marks abandoned/expired sessions

### 5. Comprehensive Authentication System
- **Dual auth**: Traditional username/password (bcrypt, 10 rounds) + SSO (JWT shared secret)
- **Token architecture**: Short-lived access tokens (15min) + long-lived refresh tokens (7 days) + CSRF tokens
- **Cookie-based auth**: HttpOnly, Secure, SameSite=Strict cookies
- **SSO flow**: Validates external JWT, creates/updates user, generates local tokens, redirect with cookies
- **Open redirect protection**: `isValidRedirectPath()` blocks protocol-relative URLs, encoded characters
- **Socket authentication**: Separate socket tokens with 1-hour expiry

### 6. Multi-Tenant Organization System
- **Organization guard**: Every authenticated request enriched with org context
- **Super org admin**: Special role that bypasses org scoping for cross-tenant operations
- **Invite codes**: Organizations have unique invite codes for user registration
- **Scoped queries**: All data queries automatically scoped to user's organization

### 7. Automated Assessment Grading
Supports 6 question types with distinct grading strategies:
- **Multiple Choice**: Handles both numeric indices and string answers (A/B/C), case-insensitive
- **True/False**: Normalizes various answer formats (boolean, string, index)
- **Fill-in-the-Blank**: Partial credit scoring, multiple correct answers per blank, case sensitivity option
- **Drag-Drop Cloze**: Same grading engine as fill-in-blank
- **Code Challenge**: Runs test cases via code execution queue with priority escalation
- **Code Debugging**: Logic-category questions graded via code execution

Grading happens within MongoDB transactions — session update, result creation, and test statistics update are atomic.

### 8. Notification System with Real-Time Delivery
- **Persistent notifications**: Stored in MongoDB, paginated, filterable
- **Real-time delivery**: WebSocket push to connected users via gateway
- **Attempt request workflow**: Student requests → instructor notification → review → student notification → override creation
- **Safe gateway integration**: `safeGatewaySend()` gracefully handles gateway unavailability

### 9. WebSocket Gateway (727 lines)
Full-featured Socket.IO gateway:
- **JWT authentication on connection**: Extracts token from handshake auth, cookies, or query params
- **Room-based routing**: `org_{id}`, `user_{id}`, `org_{id}_instructors`, `session_{id}`
- **Session events**: join, rejoin, answer submission, timer sync
- **Notification events**: unread count, mark read, get recent
- **Attempt request events**: submit, review (with instructor-only permission check)
- **Utility methods**: Used by services to push events (timer sync, session paused/resumed, test completed)

### 10. Admin Analytics
- **Session analytics**: Per-question breakdown, performance metrics, engagement metrics
- **Class analytics**: Average/highest/lowest scores, pass rates
- **Test analytics**: Score distribution, median, standard deviation
- **User dashboard**: User statistics, performance overview, content stats (with MongoDB aggregation pipelines)

### 11. Standalone Coding Challenges (LeetCode-style)
Separate from assessments — a practice system with:
- **Tracks**: Collections of challenges organized by language/category/difficulty
- **Progress tracking**: Per-user challenge progress and track progress
- **Submissions**: History of student submissions with grading results
- **Admin CRUD**: Full management system for tracks and challenges (1,065 lines)

---

## Security Implementations

| Layer | Implementation |
|---|---|
| **Transport** | Helmet (security headers), CORS whitelist with origin validation |
| **Authentication** | JWT with separate access/refresh secrets, bcrypt (10 rounds), HttpOnly cookies |
| **Authorization** | Global JWT guard, RBAC guard, organization guard, super-org checks |
| **CSRF** | Double-submit token pattern, skip for Bearer auth and safe methods |
| **Input Validation** | Global ValidationPipe: whitelist + forbidNonWhitelisted + transform |
| **Code Execution** | Pre-scan banned patterns, process isolation, memory limits, output limits, timeout with SIGKILL |
| **Rate Limiting** | 3-tier throttling: 3/sec, 20/10sec, 100/min globally; 5/min on auth endpoints |
| **Error Handling** | Global exception filter — never leaks stack traces, logs 5xx errors |
| **Data Isolation** | Multi-tenant org scoping on all queries, ownership verification on sessions |
| **Open Redirect** | SSO redirect validation blocks protocol-relative URLs, encoded paths |
| **SQL Safety** | Single-statement validation, in-memory DB per test (no shared state) |
| **WebSocket** | JWT verification on connection, role checks on privileged events |

---

## What Demonstrates Senior-Level Architectural Thinking

### 1. Strategic Monolith Choice
Deliberately chose monolith over microservices — understanding that for a team of one, operational simplicity trumps theoretical scalability. The module-based architecture preserves the option to extract services later while avoiding distributed system complexity now.

### 2. Facade Pattern in Test Sessions
`TestSessionService` is a textbook facade — it coordinates `SessionManagerService`, `QuestionHandlerService`, `SnapshotService`, `GradingService`, and `CodeExecutionService` while presenting a clean API to the gateway and controller. Each sub-service has a single responsibility.

### 3. Guard Composition
The guard stack (`JWT -> Organization -> Roles -> CSRF`) is declarative and composable. The `@Public()` decorator allows specific routes to bypass auth without removing the guard from the module. The organization guard enriches the request context for downstream guards.

### 4. Code Execution Architecture
The separation of `GradingService` (orchestration) -> `CodeExecutionService` (queue management + security scanning) -> `*RunnerService` (language-specific execution) shows mature service decomposition. The queue system with priority, per-language concurrency limits, and health monitoring is production-caliber.

### 5. Transaction Safety
Test submission uses MongoDB transactions to ensure atomic state: session update, result creation, and statistics update either all succeed or all fail. The transaction handling includes proper abort on error and session cleanup in `finally`.

### 6. Reconnection Resilience
The timer pause/resume system, grace periods, and session recovery demonstrate understanding of real-world network unreliability. Students don't lose their test progress from a brief disconnection.

### 7. Builder Pattern for Questions
Each question type (multiple-choice, true-false, fill-in-blank, code-challenge, code-debugging, drag-drop-cloze) has its own module with builder, DTO, service, and validation — allowing type-specific logic while sharing common infrastructure.

### 8. Security in Depth
Code scanning before queueing, process isolation, memory limits, output limits, timeout escalation — this is defense-in-depth thinking applied to a genuinely dangerous feature (arbitrary code execution).

### 9. Graceful Degradation
Throughout the codebase, non-critical operations are wrapped in try/catch with "non-fatal" logging. The gateway methods check `isGatewayOperational()` before sending. The notification service has `safeGatewaySend()`. Timer callbacks use `safeCallback()`. This prevents cascading failures.

### 10. Seeded Randomization
Test question shuffling uses a seeded PRNG — so each student gets a consistent order across reconnections, but different students get different orderings. This shows attention to both fairness and UX.

---

## Business Impact

- **Active educational platform**: Serves real students at coding bootcamps and educational institutions
- **Multi-language support**: JavaScript, TypeScript, Python, SQL, Dart — covering full-stack and mobile curricula
- **Complete LMS feature set**: Question authoring, test creation, timed assessments, automated grading, analytics, progress tracking, notifications
- **Real-time testing**: WebSocket-based test sessions with timer sync, reconnection handling, and live progress
- **Self-service coding practice**: LeetCode-style challenge system with tracks and progress tracking
- **Multi-tenant**: Organizations can be created with invite codes, each with isolated data

---

## Summary

This is a **~103,000-line full-stack application** built solo in approximately 3 weeks. It demonstrates:

- **Systems architecture**: 14-module NestJS monolith with proper module boundaries, dependency injection, and shared schema layer
- **Security engineering**: 10+ distinct security measures from transport to code execution
- **Real-time systems**: WebSocket gateway with session management, timer sync, and reconnection resilience
- **Language runtime engineering**: 4 sandboxed code execution environments with queue management
- **Database design**: 15 MongoDB schemas with indexes, virtuals, static methods, and transaction support
- **Production operations**: Rate limiting, cron-based cleanup, health monitoring, graceful degradation
- **Full-stack delivery**: Backend API + React dashboard + deployment pipeline in a single monorepo
