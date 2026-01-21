# Frontend Changes for Session Recovery & Unlimited Attempts

## Overview

The backend now handles corrupted test sessions gracefully by attempting automatic recovery. A new `'failed'` status has been added for sessions that cannot be recovered due to technical issues. This status does **not** count against the student's attempt limit.

Additionally, certain users (demo accounts) can now have **unlimited test attempts**.

---

## Changes Required

### 1. Handle New `'failed'` Session Status

If your frontend displays session status or has conditional logic based on status values, add support for `'failed'`:

```typescript
// Before
type SessionStatus = 'inProgress' | 'paused' | 'completed' | 'abandoned' | 'expired';

// After
type SessionStatus = 'inProgress' | 'paused' | 'completed' | 'abandoned' | 'expired' | 'failed';
```

**Display suggestion:**
```typescript
const statusLabels = {
  inProgress: 'In Progress',
  paused: 'Paused',
  completed: 'Completed',
  abandoned: 'Abandoned',
  expired: 'Expired',
  failed: 'Technical Error',  // NEW
};
```

---

### 2. Updated `checkRejoinSession` Response Messages

The `GET /test-sessions/check-existing` endpoint now returns additional messages:

| Scenario | `canRejoin` | `message` |
|----------|-------------|-----------|
| No active session | `false` | `'No active session found'` |
| Session completed | `false` | `'Previous session was completed'` |
| Session expired | `false` | `'Previous session expired and was auto-submitted'` |
| **Session recovered** | `true` | `'Active session found - you can rejoin or abandon it'` |
| **Recovery failed** | `false` | `'Previous session could not be recovered due to a technical issue. This will not count against your attempts.'` |

**Recommendation:** Display the `message` field to users, especially the recovery failure message so they understand:
1. Something went wrong (not their fault)
2. It won't count against their attempts

```typescript
// Example handling
const checkResult = await api.checkExistingSession();

if (!checkResult.canRejoin && checkResult.message.includes('technical issue')) {
  // Show friendly message about the technical error
  showNotification({
    type: 'info',
    message: checkResult.message,
  });
}
```

---

### 3. Navigate/Skip Endpoints Now Return `success: true`

**No changes required** if your frontend already checks for `success: true`.

The `POST /test-sessions/:sessionId/navigate` and `POST /test-sessions/:sessionId/skip` endpoints now correctly return:

```typescript
// Before (bug)
{
  questionState: { ... },
  navigationContext: { ... }
}

// After (fixed)
{
  success: true,
  questionState: { ... },
  navigationContext: { ... }
}
```

If your code was working around the missing `success` field, you can remove that workaround.

---

### 4. Session Recovery Side Effects

When a session is recovered, the student's **question index is reset to 0** for the current section. This is a safety measure since question order may have changed.

**What this means for the frontend:**
- After rejoining a recovered session, the student starts at the first question of their current section
- Their answers and section progress are preserved
- The `questionState` returned will reflect question index 0

**No code changes needed** - just be aware of this behavior.

---

---

## 5. Unlimited Attempts for Demo Accounts

Some users (demo accounts) now have unlimited test attempts. The backend handles this automatically, but the UI should display it appropriately.

### User Object Change

```typescript
interface User {
  // ... existing fields
  unlimitedAttempts?: boolean;  // NEW - true for demo accounts
}
```

### Admin Attempts API Response Change

The `GET /admin/students/:userId/tests/:testId/attempts` endpoint now returns:

```typescript
// Normal user
{
  student: {
    id: "...",
    name: "John Doe",
    email: "john@example.com",
    unlimitedAttempts: false  // NEW
  },
  attempts: {
    total: 3,
    used: 1,
    remaining: 2,
    unlimited: false  // NEW
  }
}

// Demo user with unlimited attempts
{
  student: {
    id: "...",
    name: "Demo Student",
    email: "demo.student@example.com",
    unlimitedAttempts: true  // NEW
  },
  attempts: {
    total: "unlimited",      // string instead of number
    used: 5,
    remaining: "unlimited",  // string instead of number
    unlimited: true          // NEW - use this flag for conditional rendering
  }
}
```

### UI Display Recommendations

**Test Card / Attempt Counter:**
```typescript
function AttemptsDisplay({ attempts }) {
  if (attempts.unlimited) {
    return <span className="text-green-600">Unlimited attempts</span>;
  }
  return <span>{attempts.remaining} of {attempts.total} attempts remaining</span>;
}
```

**Admin Panel - Student Attempts View:**
```typescript
function StudentAttemptsInfo({ data }) {
  const { attempts, student } = data;

  return (
    <div>
      {student.unlimitedAttempts && (
        <Badge variant="info">Demo Account - Unlimited</Badge>
      )}
      <p>
        Used: {attempts.used} |
        Remaining: {attempts.unlimited ? '∞' : attempts.remaining}
      </p>
    </div>
  );
}
```

**Before Starting Test:**
```typescript
// No need to show "X attempts remaining" warning for unlimited users
if (!user.unlimitedAttempts && attemptsRemaining <= 1) {
  showWarning("This is your last attempt!");
}
```

### Demo Accounts with Unlimited Attempts

| Login ID | Email | Org |
|----------|-------|-----|
| `demo_instructor_es` | demo.instructor@engineersmith.com | EngineerSmith |
| `demo_student_es` | demo.student@engineersmith.com | EngineerSmith |
| `demo_instructor_sc` | demo.instructor@simplycoding.com | Simply Coding |
| `demo_student_sc` | demo.student@simplycoding.com | Simply Coding |

---

## No Changes Required For

- Session creation flow (backend handles unlimited check)
- Answer submission
- Section submission
- Review mode

---

## Testing Checklist

- [ ] Verify navigate endpoint returns `{ success: true, ... }`
- [ ] Verify skip endpoint returns `{ success: true, ... }`
- [ ] Test displaying `'failed'` status in any session history views
- [ ] Test the recovery failure message displays correctly
- [ ] Verify rejoining a recovered session works (starts at question 0 of current section)
- [ ] Test unlimited attempts: demo accounts can start tests without attempt limit
- [ ] Test unlimited attempts display: shows "Unlimited" instead of number
- [ ] Test admin panel shows `unlimitedAttempts` badge for demo users
