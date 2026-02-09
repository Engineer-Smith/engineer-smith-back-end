# Engineer Smith — Technical Documentation

> For external dev team onboarding. Covers architecture, modules, data flow, security, and deployment.

---

## 1. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | NestJS | 11 |
| Language | TypeScript | 5.7.3 |
| Runtime | Node.js | ES2023 target |
| Database | MongoDB (Mongoose ODM) | Latest |
| Auth | Passport + JWT (@nestjs/jwt) | — |
| Real-time | Socket.IO via @nestjs/websockets | — |
| Code Execution | Child processes (Node, Python), sql.js (SQL), Dart CLI | — |
| Validation | class-validator + class-transformer | — |
| Rate Limiting | @nestjs/throttler | — |
| Task Scheduling | @nestjs/schedule | — |
| Testing | Jest 30 + ts-jest | — |
| Frontend | React (Vite) in `dashboard/` | — |
| Deployment | Render.com (PaaS) | — |

The module resolution is `nodenext`. Strict null checks are on; `noImplicitAny` is off.

---

## 2. Project Structure

```
engineer-smith-nest/
├── src/                      # NestJS API source
│   ├── admin/                # Admin dashboard & overrides
│   ├── auth/                 # JWT auth, SSO, guards, strategies
│   ├── code-challenge/       # Code challenges & tracks (LeetCode-style)
│   ├── common/               # Global exception filter
│   ├── constants/            # Tag constants (126+ predefined tags)
│   ├── gateway/              # WebSocket gateway (Socket.IO)
│   ├── grading/              # Code execution engine & graders
│   ├── notification/         # In-app notifications & attempt requests
│   ├── organization/         # Multi-tenant org management
│   ├── question/             # 6 question types with sub-modules
│   ├── result/               # Test results & analytics
│   ├── schemas/              # All 13 Mongoose schemas + global module
│   ├── student/              # Student dashboard
│   ├── tags/                 # Tag aggregation endpoints
│   ├── test/                 # Test CRUD & configuration
│   ├── test-session/         # Live test session lifecycle
│   ├── user/                 # User CRUD & preferences
│   ├── app.module.ts         # Root module — wires everything
│   └── main.ts               # Bootstrap — middleware, CORS, pipes
├── dashboard/                # React frontend (separate build)
├── dist/                     # Compiled output
└── package.json
```

**Module philosophy:** Feature-based vertical slices. Each module owns its controller, service(s), and DTOs. Schemas live in a shared `schemas/` directory. The `SchemasModule` is `@Global()` and exports User + Organization for convenience.

---

## 3. All 14 Modules

### 3.1 AuthModule
Handles registration, login (credential + SSO), token lifecycle, and password management. Houses all 4 HTTP guards, the JWT strategy, and 8 custom decorators. Exports guards and JwtModule for reuse.

### 3.2 UserModule
CRUD for users within an organization. Profile and preferences management. Admin-only user creation/deletion. Search by name for autocomplete.

### 3.3 OrganizationModule
Multi-tenant org management. Each org has an invite code, configurable settings (self-registration, default attempts, time limits), and a `isSuperOrg` flag for the platform owner.

### 3.4 AdminModule
Instructor/admin dashboard for user management. Grants additional test attempts via `StudentTestOverride` records. Manages attempt overrides with CRUD.

### 3.5 QuestionModule
The most complex module. Manages 6 question types through sub-modules (one per type). Services split into: validation, formatting, testing, and duplicate detection. Imports `GradingModule` for live question testing.

### 3.6 TestModule
Assembles questions into tests. Tests can be flat (question list) or sectioned (multiple timed sections). Supports draft/active/archived lifecycle. Tests belong to an organization or are global.

### 3.7 TestSessionModule
Drives the live test-taking experience. Sub-services: `SessionManagerService` (lifecycle), `QuestionHandlerService` (answer submission, navigation), `SnapshotService` (point-in-time test copy), `TimerService` (countdown sync). Imports `GradingModule` for code question execution.

### 3.8 ResultModule
Stores graded test results with per-question breakdowns. Provides analytics endpoints (by result, user, section, question). Supports manual grading and score overrides by instructors.

### 3.9 StudentModule
Lightweight module providing a student dashboard endpoint. Aggregates available tests, active sessions, and past results for the logged-in student.

### 3.10 GradingModule
Code execution engine with a priority queue. Provides 4 language runners (Node, Python, SQL, Dart), a security code scanner, and a fill-in-the-blank grader. No database imports — pure computation. Exported for use by QuestionModule, TestSessionModule, and CodeChallengeModule.

### 3.11 CodeChallengeModule
Standalone challenge system (LeetCode-style). Manages challenges, tracks, submissions, and progress. Has separate user-facing and admin controllers. Uses `GradingModule` for code execution.

### 3.12 NotificationModule
In-app notification system. Handles attempt requests (student requests more attempts, instructor reviews). Pushes real-time notifications via `GatewayModule` (uses `forwardRef` for circular dependency).

### 3.13 TagsModule
Aggregates unique tags from questions and code challenges. Single GET endpoint for tag autocomplete in the UI.

### 3.14 GatewayModule
WebSocket server using Socket.IO. Handles test session events (join, answer submit, timer sync), notification events (unread count, mark read), and attempt request review. Provides utility methods for pushing events to users/sessions/organizations.

---

## 4. Authentication System

### Token Architecture

| Token | Type | Expiry | Storage | Secret |
|-------|------|--------|---------|--------|
| Access Token | JWT | 15 min | httpOnly cookie `accessToken` | `JWT_SECRET` |
| Refresh Token | JWT | 7 days | httpOnly cookie `refreshToken` | `JWT_REFRESH_SECRET` |
| CSRF Token | Random hex (32 bytes) | 7 days | Non-httpOnly cookie `csrfToken` | — |
| Socket Token | JWT | 1 hour | In-memory (client) | `JWT_SECRET` |

### JWT Payload

Every JWT contains: `userId`, `loginId`, `organizationId`, `role`.

### Cookie Strategy

All auth cookies use `sameSite: 'strict'` and `path: '/'`. In production, `secure: true` is set. The access and refresh cookies are `httpOnly`; the CSRF cookie is readable by JavaScript (intentionally — the client sends it as a header for state-changing requests).

### Token Extraction Order

The `JwtStrategy` custom extractor checks:
1. `req.cookies.accessToken` (cookie-first)
2. `Authorization: Bearer <token>` header (fallback)

### Refresh Flow

1. Client calls `POST /api/auth/refresh-token`
2. Server reads refresh token from cookie or request body
3. Verifies against `JWT_REFRESH_SECRET`
4. Issues new access token, refresh token, and CSRF token
5. Sets all three cookies in response
6. On failure, clears all auth cookies

### SSO Flow

1. External system signs a JWT with the shared `SSO_SHARED_SECRET` containing `user_id`, `first_name`, `last_name`, and optionally `email`, `username`, `organization_code`, `role`
2. User is redirected to `GET /api/auth/sso/login?token=xxx&redirect=/path`
3. Server validates the token, finds or creates the user, assigns organization
4. Sets auth cookies and redirects to the frontend URL
5. Open redirect protection validates the `redirect` parameter (must be relative path, no protocol)

### Password Hashing

bcrypt with 10 salt rounds. SSO users have no password — login attempts are rejected with a message to use SSO.

---

## 5. Role-Based Access Control (RBAC)

### The 3 Roles

| Role | Scope | Capabilities |
|------|-------|-------------|
| `admin` | Organization-level | Full CRUD on users, tests, questions, overrides. Access to all analytics. |
| `instructor` | Organization-level | Create/edit tests and questions. View student results. Review attempt requests. |
| `student` | Organization-level | Take tests, submit answers, view own results, submit attempt requests. |

A special `isSuperOrgAdmin` flag exists for users in the super organization — they bypass role checks entirely and can manage all organizations.

### Guard Chain

Guards execute in this order (when all applied):

1. **JwtAuthGuard** — Validates JWT. If `@Public()` is set, allows unauthenticated access. Applied globally via `APP_GUARD`.
2. **OrganizationGuard** — Verifies the user's organization exists. Sets `isSuperOrgAdmin` on the request. Enforces `@RequireSuperOrg()`.
3. **RolesGuard** — Checks `@Roles()` metadata. Super org admins bypass. Applied globally via `APP_GUARD`.
4. **CsrfGuard** — Applied per-route (not global). Validates `x-csrf-token` header matches cookie. Skips for GET/HEAD/OPTIONS and Bearer token auth.
5. **ThrottlerGuard** — Rate limiting. Applied globally via `APP_GUARD`.

### Key Decorators

- `@Public()` — Bypass authentication entirely
- `@Roles('admin', 'instructor')` — Require specific roles
- `@AdminOrInstructor()` — Convenience shorthand
- `@AdminOnly()` — Admin role only
- `@AnyRole()` — Any authenticated user
- `@RequireSuperOrg()` — Must be in the super organization
- `@SkipCsrf()` — Bypass CSRF check
- `@CurrentUser()` — Extract user from request

---

## 6. Question Types

All 6 types share a single `Question` schema with type-specific fields.

### 6.1 Multiple Choice (`multipleChoice`)
- `options`: Array of answer strings (minimum 2)
- `correctAnswer`: Index (number) of the correct option
- Auto-graded by index comparison

### 6.2 True/False (`trueFalse`)
- `options`: Always `['True', 'False']`
- `correctAnswer`: `0` for True, `1` for False
- Auto-graded by index comparison

### 6.3 Fill in the Blank (`fillInTheBlank`)
- `codeTemplate`: Code with `{{blank_id}}` placeholders
- `blanks[]`: Each blank has `id`, `correctAnswers[]` (multiple accepted), `caseSensitive` flag, optional `hint`, and `points`
- Graded by the `FillInBlankGraderService` — trims whitespace, checks against all accepted answers, supports partial credit per blank

### 6.4 Drag & Drop Cloze (`dragDropCloze`)
- `codeTemplate`: Code with `{{blank_id}}` placeholders (same as fill-in-blank)
- `blanks[]`: Each blank has `id`, `correctAnswers[]`, optional `hint` and `points`
- `dragOptions[]`: Pool of draggable options with `id` and `text` (includes distractors)
- Graded the same way as fill-in-blank but the UI presents drag-and-drop instead of text input

### 6.5 Code Challenge (`codeChallenge`)
- `codeConfig`: `runtime` (node/python/sql/dart), `entryFunction`, `timeoutMs`, `allowPreview`
- `testCases[]`: `args`, `expected` output, `hidden` flag. SQL test cases also have `schemaSql`, `seedSql`, `expectedRows`, `orderMatters`
- Graded by executing student code against test cases via the grading engine

### 6.6 Code Debugging (`codeDebugging`)
- `buggyCode`: The broken code students must fix
- `solutionCode`: Reference solution
- `codeConfig` + `testCases[]`: Same structure as code challenge
- Graded by running the student's fixed code against test cases

### Language-Runtime Mapping

Languages auto-map to runtimes via a pre-save hook:

| Languages | Runtime |
|-----------|---------|
| javascript, typescript, react, reactNative, express, json | `node` |
| python | `python` |
| sql | `sql` |
| dart, flutter | `dart` |
| html, css, swift, swiftui | No runtime (non-executable) |

---

## 7. Test Session Flow

### Starting a Test

1. Student calls `POST /api/test-sessions` with `{ testId }`
2. System checks for existing active sessions (returns 409 if found)
3. Verifies attempt count against `settings.attemptsAllowed` + any `StudentTestOverride` extra attempts
4. `SnapshotService` creates a deep copy of the test (questions embedded, not referenced) — this freezes the test content for the duration
5. If `shuffleQuestions` is enabled, question order is randomized
6. Session is created with status `inProgress` and `startedAt` timestamp
7. Response includes session info, first question data, and navigation context

### Navigating Questions

- `GET .../current-question` — Returns current question (stripped of answers)
- `POST .../navigate` with `{ questionIndex }` — Jump to specific question
- `POST .../skip` — Skip current and advance
- `POST .../submit-answer` — Save answer, mark question status, advance

For **sectioned tests**, question indices are section-relative. The session tracks `currentSectionIndex` and `currentQuestionIndex` within that section.

### Section Flow (when `useSections: true`)

1. Each section has its own `timeLimit`
2. `POST .../submit-section` — Lock current section and move to the next
3. `POST .../start-section-review` — Enter section review before submitting
4. Sections track `startedAt`, `submittedAt`, and status independently

### Code Question Execution

- `POST .../run-code` with `{ code }` — Runs code against visible test cases (preview mode)
- On answer submission for code questions, code is executed against all test cases (including hidden)

### Timer Synchronization

- `GET .../time-sync` — Returns server-calculated time remaining
- `POST .../heartbeat` — Keeps session alive, updates connection status
- Timer sync also available via WebSocket `timer:request_sync` event
- `TimerService` calculates remaining time from `startedAt` + `timeLimit`, accounting for section times

### Review Phase

- `POST .../start-review` — Enters review phase where student can revisit answered questions
- `reviewPhase` flag is set on the session
- Student can navigate back to any question and change answers

### Submission

1. Student calls `POST .../submit` (or time expires)
2. All questions are graded (code questions executed, blanks checked, MC compared)
3. `finalScore` is calculated on the session
4. A `Result` document is created with per-question breakdowns
5. Session status changes to `completed`
6. WebSocket `test:completed` event fires to the session room

### Connection Handling

- `isConnected` / `disconnectedAt` fields track WebSocket connection
- Grace period of 5 minutes after disconnect before session can be expired
- `POST .../rejoin` — Reconnects to an active session after disconnect

---

## 8. Code Execution Engine

Located in `src/grading/`. No database dependencies — pure computation module.

### Architecture

```
Request → CodeScannerService → CodeExecutionService (Queue) → Runner → Result
```

### Priority Queue (`CodeExecutionService`)

| Setting | Value |
|---------|-------|
| Max concurrent jobs | 8 |
| Per-runtime concurrent limit | 3 |
| Priority levels | `high`, `normal` |
| Queue depth warning | >10 jobs |
| Unhealthy queue depth | ≥20 |
| Unhealthy wait time | ≥10,000ms |

**Flow:** Security scan runs first (before queueing). If a slot is available (respects both global and per-runtime limits), the job executes immediately. Otherwise it's queued by priority. High-priority queue is checked before normal. Metrics track wait times (rolling 100-sample average), throughput, and errors.

### Language Runners

#### Node Runner (`node-runner.service.ts`)
- Spawns `node --max-old-space-size=128` as a child process
- Transpiles TypeScript to JavaScript via `ts.transpile()` if needed
- Overrides `console.log/warn/info` to capture output
- Deep equality checking for test assertions (handles arrays, objects, NaN, type coercion)
- 128MB heap limit, 1MB stdout/stderr limit
- SIGTERM on timeout, SIGKILL after 1s fallback

#### Python Runner (`python-runner.service.ts`)
- Spawns `python3` as a child process
- Sets `resource.setrlimit(RLIMIT_AS, 128MB)` inside the script
- Overrides global `print()` to capture console output
- Classifies `SyntaxError`/`IndentationError` as compilation errors
- Same timeout/kill strategy as Node

#### SQL Runner (`sql-runner.service.ts`)
- Uses `sql.js` (SQLite compiled to WASM) — runs in-process, no child process
- Creates a fresh in-memory database per test case
- Executes: schema SQL → seed SQL → student query
- Validates single-statement input (strips comments, checks for multiple semicolons)
- Supports `orderMatters` flag — if false, sorts rows before comparing
- Max 1000 rows per query result

#### Dart Runner (`dart-runner.service.ts`)
- Spawns `dart --old-gen-heap-size=64` as a child process
- 64MB heap limit
- Custom `capturedPrint()` function routes output to stderr
- Results extracted via JSON markers in stderr (`RESULT_JSON_START`...`RESULT_JSON_END`)
- Handles async/await (awaits Future results)
- Type coercion for int/double conversions

### Code Scanner (`code-scanner.service.ts`)

Runs **before** queueing. Rejects code containing banned patterns.

| Language | Banned Pattern Categories | Count |
|----------|--------------------------|-------|
| JavaScript | Infinite loops, dangerous modules (child_process, fs, net, http, etc.), process manipulation, eval/Function, prototype pollution | 23 |
| Python | Infinite loops, system modules (os, subprocess, sys, socket, etc.), exec/eval/compile, globals/locals introspection | 18 |
| Dart | Infinite loops, system libraries (dart:io, dart:mirrors, dart:ffi), Process/File/Socket access | 11 |
| SQL | File operations (OUTFILE, DUMPFILE, LOAD), delay functions (SLEEP, BENCHMARK), lock functions | 6 |
| Universal | Path traversal (`../`) | 1 |

Tracks metrics: total scans, rejection rate, last 50 violations with timestamps.

### Fill-in-the-Blank Grader (`fill-in-blank.grader.ts`)

Separate from the code execution pipeline. Compares student answers against accepted answer arrays per blank. Supports case-insensitive matching, whitespace trimming, and per-blank point values.

---

## 9. Code Challenge System

Separate from the test/question system. Think of it as a standalone LeetCode-style practice area.

### Core Concepts

- **Challenge** (`CodeChallenge` schema): A standalone coding problem with problem statement, examples, constraints, hints, and test cases. Supports multiple languages (JS, Python, Dart, SQL) with per-language starting code, solution code, and config.
- **Track** (`Track` schema): An ordered collection of challenges for a specific language. Has difficulty level, category (e.g., "arrays", "dynamic-programming", "interview-prep"), estimated hours, and prerequisites (other tracks).
- **Submission** (`ChallengeSubmission` schema): Records every code submission with test results, execution time, console logs, and error details.

### Progress Tracking

- **UserChallengeProgress**: Per-user, per-challenge. Tracks solution status per language (not_attempted / attempted / solved), attempt count, best submission, hints used, bookmarks, and time spent.
- **UserTrackProgress**: Per-user, per-track. Tracks enrollment, completion percentage, current challenge index, streaks, achievements, and estimated time remaining. Auto-calculates progress percentage via pre-save hook.

### Track Unlocking

Each challenge in a track has an `unlockAfter` field — the number of preceding challenges that must be completed before it becomes available. Challenges can be marked `isOptional`.

### Endpoints

Two controllers: `CodeChallengeController` (user-facing) and `CodeChallengeAdminController` (super org admin). Users can browse tracks/challenges publicly, enroll in tracks, test code against sample cases, and submit solutions. Admins can create/update/delete challenges and tracks, run validation, bulk create, and view analytics.

---

## 10. Database Schemas

### Schema Map (13 schemas)

| # | Schema | Collection | Key Relationships |
|---|--------|-----------|-------------------|
| 1 | **User** | users | → Organization |
| 2 | **Organization** | organizations | — (top-level entity) |
| 3 | **Test** | tests | → Organization, → User (createdBy), embeds Question refs |
| 4 | **Question** | questions | → Organization, → User (createdBy) |
| 5 | **TestSession** | testsessions | → Test, → User, → Organization. Embeds full test snapshot |
| 6 | **Result** | results | → TestSession, → Test, → User, → Organization |
| 7 | **CodeChallenge** | codechallenges | → User (createdBy), → Organization, → Track (via trackAssignments) |
| 8 | **Track** | tracks | → CodeChallenge (via challenges[]), → User (createdBy), → Track (prerequisites) |
| 9 | **ChallengeSubmission** | challengesubmissions | → User, → CodeChallenge, → Track |
| 10 | **UserChallengeProgress** | usechallengeprogresses | → User, → CodeChallenge, → Track |
| 11 | **UserTrackProgress** | usertrackprogresses | → User, → Track |
| 12 | **AttemptRequest** | attemptrequests | → User (requester + reviewer), → Test, → Organization |
| 13 | **StudentTestOverride** | studenttestoverrides | → User (student + granter), → Test, → Organization |
| 14 | **Notification** | notifications | → User (recipient + sender), → Organization |

### Key Design Decisions

- **Test snapshots:** When a session starts, the entire test (including question content) is deep-copied into `TestSession.testSnapshot`. This means editing a test after a student starts doesn't affect their session.
- **Organization scoping:** Nearly every query filters by `organizationId` to enforce multi-tenancy.
- **Embedded subdocuments:** Test sections, question test cases, blanks, drag options, and result question details are all embedded (not referenced) for read performance.
- **Unique constraints:** `User.loginId`, `User.email` (sparse), `Organization.inviteCode`, `CodeChallenge.slug` (sparse), `UserChallengeProgress{userId, challengeId, trackId}`, `UserTrackProgress{userId, trackId}`, `StudentTestOverride{userId, testId}`, `AttemptRequest.requestHash`.
- **Virtual fields:** `User.fullName`, `User.displayName`, `CodeChallenge.url`, `CodeChallenge.difficultyColor`, `Track.totalChallenges`, `Track.path`, `UserTrackProgress.estimatedCompletionDate`, `ChallengeSubmission.summary`.

---

## 11. WebSocket / Gateway

### Transport

Socket.IO with `['polling', 'websocket']` transports. Ping timeout 60s, ping interval 25s. Upgrades from polling to WebSocket when available. CORS configured to match the HTTP API.

### Authentication

`WsJwtGuard` validates JWT from:
1. `socket.handshake.auth.token`
2. `socket.handshake.headers.cookie` (parses `accessToken`)
3. `socket.handshake.query.token`

On connection, the socket joins a room named `user:{userId}` for targeted pushes.

### Client → Server Events

| Event | Data | Purpose |
|-------|------|---------|
| `session:join` | `{ sessionId }` | Join a test session room |
| `session:rejoin` | `{ sessionId }` | Rejoin after reconnect |
| `answer:submit` | Answer data | Submit answer via WebSocket |
| `timer:request_sync` | `{ sessionId }` | Request server time sync |
| `notifications:get_unread_count` | — | Get unread notification count |
| `notifications:mark_read` | `{ notificationId }` | Mark notification as read |
| `notifications:mark_all_read` | — | Mark all as read |
| `notifications:get_recent` | `{ limit?, page? }` | Get recent notifications |
| `attempt_request:submit` | `{ testId, requestedAttempts, reason }` | Submit attempt request |
| `attempt_request:review` | `{ requestId, decision, reviewNotes? }` | Review attempt request |

### Server → Client Events (pushed by services)

| Method | Target | Purpose |
|--------|--------|---------|
| `sendToSession()` | Session room | Broadcast to all in a session |
| `sendToUser()` | `user:{id}` room | Target a specific user |
| `sendToOrganization()` | `org:{id}` room | Broadcast to entire org |
| `sendToInstructors()` | `org:{id}` + role filter | Target instructors only |
| `sendNotificationToUser()` | User room | Push notification |
| `sendTimerSync()` | Session room | Timer countdown data |
| `sendTimerWarning()` | Session room | Low time warning |
| `sendSessionPaused()` | Session room | Session paused event |
| `sendSessionResumed()` | Session room | Session resumed event |
| `sendTestCompleted()` | Session room | Test finished event |
| `sendSectionExpired()` | Session room | Section time up event |

---

## 12. API Surface

All routes are prefixed with `/api`. Authentication is global (JWT guard applied via `APP_GUARD`) — routes marked `@Public()` are exempt.

### Auth — `/api/auth` (10 endpoints)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login with credentials |
| POST | `/refresh-token` | Public | Refresh access token |
| POST | `/validate-invite` | Public | Check invite code |
| GET | `/sso/login` | Public | SSO login redirect |
| POST | `/logout` | JWT + CSRF | Clear auth cookies |
| GET | `/me` | JWT | Get current user |
| GET | `/socket-token` | JWT | Get WebSocket auth token |
| POST | `/change-password` | JWT + CSRF | Change password |
| GET | `/status` | JWT | Auth health check |

### Users — `/api/users` (10 endpoints)

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | `/` | Admin/Instructor | List users (paginated, filterable) |
| GET | `/me` | Any | Get own profile |
| PATCH | `/me` | Any | Update own profile |
| GET | `/me/preferences` | Any | Get preferences |
| PATCH | `/me/preferences` | Any | Update preferences |
| GET | `/search` | Admin/Instructor | Search users by name |
| GET | `/:userId` | Any | Get user by ID |
| POST | `/` | Admin | Create user |
| PATCH | `/:userId` | Admin | Update user |
| DELETE | `/:userId` | Admin | Delete user |

### Organizations — `/api/organizations` (7 endpoints)

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | `/` | Super Org | Create organization |
| GET | `/` | Super Org | List all organizations |
| POST | `/validate-invite` | Public | Validate invite code |
| GET | `/:id/settings` | Admin | Get org settings |
| PATCH | `/:id/settings` | Admin | Update org settings |
| GET | `/:id` | Admin/Instructor | Get organization |
| PATCH | `/:id` | Admin | Update organization |
| DELETE | `/:id` | Super Org | Delete organization |

### Admin — `/api/admin` (6 endpoints)

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | `/users/dashboard` | Admin/Instructor | User management dashboard |
| GET | `/users/:userId/dashboard` | Admin/Instructor | Individual user details |
| POST | `/grant-attempts` | Admin/Instructor | Grant extra attempts |
| GET | `/overrides` | Admin/Instructor | List attempt overrides |
| PATCH | `/overrides/:overrideId` | Admin/Instructor | Update override |
| DELETE | `/overrides/:overrideId` | Admin/Instructor | Delete override |
| GET | `/status/:testId/:userId` | Admin/Instructor | Student attempt status |

### Questions — `/api/questions` (21 endpoints)

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | `/multiple-choice` | Admin/Instructor | Create MC question |
| PATCH | `/multiple-choice/:id` | Admin/Instructor | Update MC question |
| POST | `/true-false` | Admin/Instructor | Create T/F question |
| PATCH | `/true-false/:id` | Admin/Instructor | Update T/F question |
| POST | `/fill-in-blank` | Admin/Instructor | Create fill-in-blank |
| PATCH | `/fill-in-blank/:id` | Admin/Instructor | Update fill-in-blank |
| POST | `/drag-drop-cloze` | Admin/Instructor | Create drag-drop |
| PATCH | `/drag-drop-cloze/:id` | Admin/Instructor | Update drag-drop |
| POST | `/code-challenge` | Admin/Instructor | Create code challenge |
| PATCH | `/code-challenge/:id` | Admin/Instructor | Update code challenge |
| POST | `/code-debugging` | Admin/Instructor | Create code debugging |
| PATCH | `/code-debugging/:id` | Admin/Instructor | Update code debugging |
| GET | `/stats` | Any | Question statistics |
| POST | `/import` | Admin/Instructor | Bulk import |
| GET | `/global` | Admin/Instructor | Global questions |
| GET | `/check-duplicates` | Admin/Instructor | Duplicate detection |
| GET | `/supported-configs` | Any | Supported language/runtime combos |
| GET | `/` | Any | List questions (filtered) |
| POST | `/` | Admin/Instructor | Create question (legacy) |
| POST | `/test` | Any | Test a question live |
| GET | `/:id` | Any | Get question |
| PATCH | `/:id` | Admin/Instructor | Update question (legacy) |
| DELETE | `/:id` | Admin/Instructor | Delete question |

### Tests — `/api/tests` (6 endpoints)

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | `/` | Admin/Instructor | Create test |
| GET | `/global` | Admin | Global tests |
| GET | `/:id/with-questions` | Any | Test with populated questions |
| GET | `/:id` | Any | Get test |
| GET | `/` | Any | List tests (filtered) |
| PATCH | `/:id` | Admin/Instructor | Update test |
| DELETE | `/:id` | Admin/Instructor | Delete test |

### Test Sessions — `/api/test-sessions` (17 endpoints)

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | `/check-existing` | Any | Check for active session |
| POST | `/` | Any | Start new session |
| POST | `/:id/rejoin` | Any | Rejoin session |
| POST | `/:id/abandon` | Any | Abandon session |
| POST | `/:id/submit` | Any | Submit final test |
| GET | `/:id/current-question` | Any | Get current question |
| POST | `/:id/submit-answer` | Any | Submit answer |
| POST | `/:id/navigate` | Any | Navigate to question |
| POST | `/:id/skip` | Any | Skip question |
| POST | `/:id/run-code` | Any | Run code (preview) |
| POST | `/:id/start-review` | Any | Enter review phase |
| POST | `/:id/submit-section` | Any | Submit section |
| POST | `/:id/start-section-review` | Any | Start section review |
| GET | `/:id/time-sync` | Any | Time sync |
| POST | `/:id/heartbeat` | Any | Heartbeat |
| GET | `/` | Any | List sessions |
| GET | `/analytics/class` | Admin/Instructor | Class analytics |
| GET | `/tests/:testId/analytics` | Admin/Instructor | Test analytics |
| GET | `/:id/overview` | Admin/Instructor | Session overview |
| GET | `/:id/analytics` | Admin/Instructor | Session analytics |
| GET | `/:id` | Any | Get session |

### Results — `/api/results` (7 endpoints)

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | `/analytics/results` | Admin/Instructor | Result analytics |
| GET | `/analytics/users` | Admin/Instructor | User analytics |
| GET | `/analytics/sections` | Admin/Instructor | Section analytics |
| GET | `/analytics/questions` | Admin/Instructor | Question analytics |
| GET | `/` | Any | List results |
| GET | `/:id/breakdown` | Any | Score breakdown |
| GET | `/:id` | Any | Get result |

### Notifications — `/api/notifications` (10 endpoints)

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | `/` | Any | List notifications |
| GET | `/unread-count` | Any | Unread count |
| PATCH | `/mark-all-read` | Any | Mark all read |
| GET | `/attempt-requests/pending` | Admin/Instructor | Pending requests |
| GET | `/attempt-requests/my-requests` | Any | Own requests |
| GET | `/attempt-requests/:id` | Any | Get request |
| PATCH | `/:id/read` | Any | Mark one read |
| DELETE | `/:id` | Any | Delete notification |
| POST | `/send-custom` | Admin | Send custom notification |
| POST | `/attempt-request` | Any | Submit attempt request |
| POST | `/attempt-request/review` | Admin/Instructor | Review request |

### Code Challenges — `/api/code-challenges` (user: 9, admin: 21 = 30 endpoints)

**User endpoints:**

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/tracks` | Public | Browse tracks |
| GET | `/tracks/:lang/:slug` | Public | Get track |
| GET | `/challenges` | Public | Browse challenges |
| GET | `/challenges/:id` | Public | Get challenge |
| GET | `/dashboard` | JWT | User stats |
| POST | `/challenges/:id/test` | JWT | Test code |
| POST | `/challenges/:id/submit` | JWT | Submit solution |
| POST | `/tracks/:lang/:slug/enroll` | JWT | Enroll in track |
| GET | `/tracks/:lang/:slug/progress` | JWT | Track progress |

**Admin endpoints (`/api/code-challenges/admin`):**

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/challenges` | Create challenge |
| POST | `/challenges/bulk` | Bulk create |
| GET | `/challenges` | List all |
| GET | `/challenges/available/:lang` | Available for track |
| GET | `/challenges/track-assignments` | Track assignments |
| GET | `/challenges/:slug` | Get by slug |
| PUT | `/challenges/:slug` | Update |
| DELETE | `/challenges/:slug` | Archive |
| POST | `/challenges/:slug/test` | Test solution |
| POST | `/validate-code` | Validate code |
| POST | `/tracks` | Create track |
| GET | `/tracks` | List tracks |
| GET | `/tracks/:lang/:slug` | Get track |
| PUT | `/tracks/:lang/:slug` | Update track |
| DELETE | `/tracks/:lang/:slug` | Archive track |
| POST | `/tracks/:lang/:slug/challenges` | Add challenge to track |
| DELETE | `/tracks/:lang/:slug/challenges/:id` | Remove from track |
| GET | `/dashboard/tracks` | Tracks overview |
| GET | `/dashboard/challenges` | Challenges overview |
| GET | `/analytics` | Platform analytics |

### Grading — `/api/grading` (3 endpoints)

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | `/queue/status` | JWT | Queue status (lightweight) |
| GET | `/queue/metrics` | Admin | Full queue metrics |
| POST | `/queue/reset-metrics` | Admin | Reset counters |

### Tags — `/api/tags` (1 endpoint)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/` | JWT | Get all unique tags |

### Student — `/api/student` (1 endpoint)

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | `/dashboard` | Any | Student dashboard |

### Root — `/api` (1 endpoint)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/` | Public | Health check |

**Total: ~130 endpoints** (including CRUD variants and analytics)

---

## 13. Security Stack

### Rate Limiting (3 tiers — global)

| Tier | Limit | Window |
|------|-------|--------|
| Short | 3 requests | 1 second |
| Medium | 20 requests | 10 seconds |
| Long | 100 requests | 1 minute |

Auth endpoints have additional custom throttling: 5 requests/minute for login/register, 10/minute for token refresh.

### Helmet

Enabled globally in `main.ts` with CSP and COEP disabled (required for the SPA frontend). Provides X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, and other security headers.

### CORS

Configured from `CORS_ORIGINS` environment variable (comma-separated). Defaults to `localhost:3000` and `localhost:5173` in development. Allows credentials, standard methods (GET, POST, PUT, PATCH, DELETE), and common headers.

### CSRF Protection

Double-submit cookie pattern. The CSRF token is stored in a non-httpOnly cookie (readable by JS). The client must send it as the `x-csrf-token` header on state-changing requests. The `CsrfGuard` compares the header against the cookie. Bypassed for:
- GET, HEAD, OPTIONS methods
- Bearer token authentication (API clients)
- Routes decorated with `@SkipCsrf()`

### Password Security

bcrypt with 10 salt rounds. Enforced minimum 8 characters via DTO validation.

### Code Execution Sandboxing

See Section 8. Key isolation measures:
- Pre-execution code scanning (60+ banned patterns)
- Child process isolation with closed stdin
- Memory limits (64-128MB depending on runtime)
- Output limits (1MB per stream)
- Timeout enforcement (SIGTERM → SIGKILL)
- Temp directory isolation (cleaned after execution)
- Network access blocked via code scanner

### Input Validation

Global `ValidationPipe` with:
- `whitelist: true` — strips unexpected properties
- `transform: true` — auto-transforms types
- Applied to all incoming requests

### Error Handling

`GlobalExceptionFilter` ensures no stack traces or internal details leak to clients. All errors return a consistent shape: `{ success, statusCode, message, error, timestamp, path }`.

### Answer Size Limit

Test session answer submissions are validated to not exceed 100KB to prevent oversized payloads.

---

## 14. Deployment

### Platform: Render.com

No Dockerfile or render.yaml in the repo — configuration is managed in the Render dashboard.

### Build Scripts

```
npm run render-build
```

This runs: `npm install --include=dev && npm run build && cd dashboard && npm install && npm run build`

Steps:
1. Installs all dependencies (including devDependencies for the TypeScript compiler)
2. Builds the NestJS API (`nest build` → compiles to `dist/`)
3. Installs dashboard dependencies
4. Builds the React frontend (`vite build` → compiles to `dashboard/dist/`)

### Production Start

```
npm run start:prod
```

Runs `node dist/main` — the compiled JavaScript entry point.

### Static File Serving

In production, NestJS serves the React build via `ServeStaticModule` from `../dashboard/dist`. The API prefix `/api` prevents route conflicts with the SPA's client-side routing.

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Access token signing key |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing key |
| `PORT` | No (default: 3000) | Server port |
| `NODE_ENV` | No (default: development) | Environment mode |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |
| `WS_URL` | No | WebSocket URL (Cloudflare proxy) |
| `SSO_SHARED_SECRET` | No | SSO JWT validation key |
| `FRONTEND_URL` | No | Frontend URL for redirects |

### MongoDB Connection Pool

- Min connections: 2
- Max connections: 10
- Server selection timeout: 5,000ms
- Socket timeout: 45,000ms

### Process Resilience

Global handlers for `unhandledRejection` and `uncaughtException` in `main.ts` log errors but keep the process running.
