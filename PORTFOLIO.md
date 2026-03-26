# EngineerSmith NestJS (V2) — Portfolio Entry

## Project Overview
**EngineerSmith Assessment Platform — NestJS Monolith** — A ~103,000-line full-stack educational assessment platform rebuilt from the ground up as a NestJS monolith. Supports multi-format assessments (6 question types), real-time WebSocket test sessions, sandboxed code execution across 4 languages, automated grading, and analytics — all within a single deployable monorepo.

## Jordan's Role & Ownership
- **100% sole author** — 21 commits, built in ~3 weeks
- **~103,000 lines** (49K backend TypeScript + 54K frontend TSX)
- Complete architectural rewrite from Express microservices (V1) to NestJS monolith (V2)

## Architecture Evolution: V1 → V2
**Why the migration happened:**
1. **Architectural consolidation** — scattered Express microservices → structured NestJS monolith with module boundaries and dependency injection
2. **Type safety at scale** — full TypeScript with DTOs, interfaces, and decorators providing compile-time guarantees
3. **Built-in patterns** — NestJS guard/interceptor/pipe/filter architecture replaced hand-rolled middleware
4. **Operational simplicity** — single deployment target instead of coordinating multiple services
5. **Module encapsulation** — each domain is a proper NestJS module while sharing schemas through a central SchemasModule

## Key Features Built

### 1. Multi-Language Code Execution Engine
4 sandboxed language runners:
- **JavaScript/TypeScript** — Node.js process with 128MB memory limit, TypeScript on-the-fly compilation
- **Python** — python3 process with resource.RLIMIT_AS enforcement
- **SQL** — sql.js (SQLite WASM) with fresh in-memory DB per test case
- **Dart** — dart process with heap size limits

Each runner: temp directory isolation, 1MB output limit, configurable timeout with SIGTERM→SIGKILL escalation, deep equality assertions, console log capture.

### 2. Code Execution Queue System
Production-grade in-memory job queue:
- Max 8 concurrent jobs, max 3 per language
- Priority queuing (timed test submissions get priority)
- Pre-execution security scanning
- Health monitoring (queue depth, wait times, per-language breakdown)

### 3. Security Scanner
Pre-execution code analysis with language-specific banned patterns:
- JS/TS: dangerous imports, eval, process manipulation, prototype pollution
- Python: os/subprocess/socket imports, code execution functions
- Dart: dart:io/dart:ffi imports, file/network operations
- SQL: file operations, time delays, locking functions
- Universal: path traversal detection

### 4. Real-Time Test Session Engine
WebSocket-based timed assessments:
- Session lifecycle with reconnection recovery
- Timer service with per-session management and multi-level warnings
- Seeded random shuffling (consistent order per student across reconnections)
- Atomic section completion via MongoDB findOneAndUpdate
- Cron-based stale session cleanup

### 5. Comprehensive Auth & Security (10+ measures)
| Layer | Implementation |
|---|---|
| Transport | Helmet, CORS whitelist |
| Authentication | JWT (access/refresh), bcrypt, HttpOnly cookies, SSO |
| Authorization | Global JWT guard, RBAC guard, organization guard |
| CSRF | Double-submit token pattern |
| Input Validation | Global ValidationPipe (whitelist + forbidNonWhitelisted) |
| Code Execution | Pre-scan, process isolation, memory limits, timeouts |
| Rate Limiting | 3-tier throttling globally; 5/min on auth |
| Error Handling | Global exception filter (never leaks stack traces) |
| Data Isolation | Multi-tenant org scoping on all queries |
| WebSocket | JWT verification on connection, role checks |

### 6. 14-Module NestJS Architecture
Auth · Grading · Question · Test · TestSession · Result · User · Student · Organization · Admin · CodeChallenge · Tags · Notification · Gateway

### 7. LeetCode-Style Coding Challenges
Standalone practice system with tracks, progress tracking, submission history, and full admin CRUD.

## Tech Stack
**Backend:** NestJS 11 · TypeScript 5.7 · MongoDB/Mongoose 9 · Passport JWT · Socket.IO · @nestjs/throttler · @nestjs/schedule · class-validator
**Frontend:** React · TypeScript · Vite · Tailwind CSS · Playwright
**Infrastructure:** Render · MongoDB Atlas · Monorepo (single deploy)

## What Demonstrates Senior-Level Thinking

1. **Strategic monolith choice** — operational simplicity over theoretical scalability for a solo developer, with module boundaries preserving future extraction options
2. **Facade pattern** — TestSessionService coordinates 5 sub-services while presenting a clean API
3. **Guard composition** — declarative, composable guard stack (JWT → Organization → Roles → CSRF)
4. **Code execution architecture** — three-layer decomposition: GradingService → CodeExecutionService → *RunnerService
5. **Transaction safety** — MongoDB transactions for atomic test submission (session + result + stats)
6. **Reconnection resilience** — timer pause/resume, grace periods, session recovery
7. **Seeded randomization** — consistent question order per student across reconnections
8. **Defense in depth** — 10+ distinct security measures from transport to code execution
9. **Graceful degradation** — safeGatewaySend(), safeCallback(), non-fatal logging throughout

## Business Impact
- **Active educational platform** serving real students at coding bootcamps
- **Multi-language assessment** covering full-stack and mobile curricula
- **Anti-cheating architecture** with server-authoritative state
- **Self-service platform** — instructors create tests, grade automatically, view analytics

## Skills Demonstrated
- Systems architecture (14-module NestJS monolith)
- Security engineering (10+ security layers)
- Real-time systems (WebSocket gateway with session management)
- Language runtime engineering (4 sandboxed code runners with queue management)
- Database design (15 MongoDB schemas with transactions)
- Production operations (rate limiting, cron cleanup, health monitoring)
- Full-stack delivery (API + React dashboard + deployment pipeline)
- Architectural migration (Express → NestJS with clear rationale)

## Portfolio Soundbites
> Rebuilt a complete assessment platform from Express microservices to a 103,000-line NestJS monolith in 3 weeks — featuring real-time WebSocket test sessions, sandboxed code execution across 4 languages, 10+ security layers, and a 14-module architecture with proper dependency injection.

> Designed a multi-language code execution engine with priority job queuing, pre-execution security scanning, and defense-in-depth sandboxing — enabling students to safely run JavaScript, Python, SQL, and Dart code during timed assessments.

> Made the deliberate architectural choice to consolidate Express microservices into a NestJS monolith — prioritizing operational simplicity and module encapsulation over distributed complexity, while preserving the option to extract services later.

## Metrics to Highlight
- ~103,000 lines full-stack (solo, built in ~3 weeks)
- 14 NestJS modules / 15 MongoDB schemas / 5 custom guards / 5 custom decorators
- 4 language runners with execution queue (8 max concurrent, 3 per language)
- 10+ security implementations
- 727-line WebSocket gateway with JWT auth
- Complete architectural migration from Express to NestJS
