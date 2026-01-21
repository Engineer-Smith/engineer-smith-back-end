# Frontend Rejoin Logic Testing Guide

## API Endpoints

### Check for Existing Session
```
GET /api/test-sessions/check-existing
Authorization: Bearer <token>
```

### Start New Session
```
POST /api/test-sessions
Authorization: Bearer <token>
Body: { "testId": "<test-id>", "forceNew": false }
```

### Rejoin Existing Session
```
POST /api/test-sessions/<sessionId>/rejoin
Authorization: Bearer <token>
```

### Abandon Session
```
POST /api/test-sessions/<sessionId>/abandon
Authorization: Bearer <token>
```

---

## Test Scenarios

### Scenario 1: Normal Rejoin Flow
**Steps:**
1. Start a test session
2. Answer 1-2 questions
3. Close the browser/tab (simulate disconnect)
4. Call `GET /check-existing`

**Expected Response:**
```json
{
  "success": true,
  "canRejoin": true,
  "sessionId": "abc123",
  "timeRemaining": 1800,
  "testInfo": {
    "title": "Test Name",
    "description": "...",
    "totalQuestions": 10,
    "totalPoints": 100,
    "useSections": true,
    "currentQuestionIndex": 2,
    "answeredQuestions": 2,
    "completedSections": 0
  },
  "message": "Active session found - you can rejoin or abandon it"
}
```

**Then:** Call `POST /<sessionId>/rejoin` to continue

---

### Scenario 2: Session Recovery (Corrupted Session)
**How to simulate:** This requires a corrupted session in the database (testSnapshot missing). The backend will attempt automatic recovery.

**Expected Response (recovery succeeded):**
```json
{
  "success": true,
  "canRejoin": true,
  "sessionId": "abc123",
  "timeRemaining": 1800,
  "testInfo": {
    "title": "Test Name",
    ...
  },
  "message": "Active session found - you can rejoin or abandon it"
}
```

**Note:** After recovery, `currentQuestionIndex` resets to 0 for the current section (question order may have changed).

---

### Scenario 3: Recovery Failed (Test Deleted)
**Condition:** Session exists but original test was deleted from database.

**Expected Response:**
```json
{
  "success": true,
  "canRejoin": false,
  "message": "Previous session could not be recovered due to a technical issue. This will not count against your attempts."
}
```

**Frontend Action:**
- Display the message to the user
- Allow them to start a new test
- Their attempt count is NOT affected

---

### Scenario 4: Session Expired
**Condition:** Time ran out on the session.

**Expected Response:**
```json
{
  "success": true,
  "canRejoin": false,
  "message": "Previous session expired and was auto-submitted"
}
```

---

### Scenario 5: No Active Session
**Condition:** User has no in-progress sessions.

**Expected Response:**
```json
{
  "success": true,
  "canRejoin": false,
  "message": "No active session found"
}
```

---

### Scenario 6: Force New Session (Abandon Previous)
**Steps:**
1. Have an active session
2. Call `POST /test-sessions` with `forceNew: true`

**Request:**
```json
{
  "testId": "<test-id>",
  "forceNew": true
}
```

**Expected:** Previous session marked as `abandoned`, new session created.

---

## Session Status Values

| Status | Description | Counts Against Attempts |
|--------|-------------|------------------------|
| `inProgress` | Currently active | No (not finished) |
| `paused` | Disconnected, within grace period | No (not finished) |
| `completed` | Finished and submitted | Yes |
| `abandoned` | User chose to abandon | Yes |
| `expired` | Time ran out | Yes |
| `failed` | Technical error/corruption | **No** |

---

## Frontend Testing Checklist

### Check Existing Flow
- [ ] Call `/check-existing` on app load or before starting a test
- [ ] If `canRejoin: true`, show rejoin dialog with session info
- [ ] Display `timeRemaining` (convert seconds to mm:ss)
- [ ] Display progress: `answeredQuestions / totalQuestions`
- [ ] Offer "Rejoin" and "Abandon" options

### Rejoin Flow
- [ ] Call `POST /<sessionId>/rejoin`
- [ ] Load returned question state
- [ ] Resume timer from `timeRemaining`
- [ ] Handle case where `currentQuestionIndex` may be 0 (after recovery)

### Recovery Failure Flow
- [ ] Check if message contains "technical issue"
- [ ] Display friendly message to user
- [ ] Emphasize "will not count against attempts"
- [ ] Allow starting fresh test

### Error Handling
- [ ] Handle 404 if session not found
- [ ] Handle 403 if session belongs to different user
- [ ] Handle 400 if session already completed

---

## Example Frontend Code

```typescript
async function checkAndHandleExistingSession(testId: string): Promise<'rejoin' | 'new' | 'blocked'> {
  const response = await api.get('/test-sessions/check-existing');
  const { canRejoin, sessionId, message, testInfo } = response.data;

  if (!canRejoin) {
    // Check if it was a technical failure
    if (message.includes('technical issue')) {
      showNotification({
        type: 'info',
        title: 'Previous Session Issue',
        message: message,
      });
    }
    return 'new'; // Can start fresh
  }

  // Show rejoin dialog
  const userChoice = await showRejoinDialog({
    testTitle: testInfo.title,
    progress: `${testInfo.answeredQuestions}/${testInfo.totalQuestions} questions`,
    timeRemaining: formatTime(response.data.timeRemaining),
  });

  if (userChoice === 'rejoin') {
    await api.post(`/test-sessions/${sessionId}/rejoin`);
    return 'rejoin';
  } else if (userChoice === 'abandon') {
    await api.post(`/test-sessions/${sessionId}/abandon`);
    return 'new';
  }

  return 'blocked'; // User cancelled
}

// Navigate endpoint (now returns success: true)
async function navigateToQuestion(sessionId: string, questionIndex: number) {
  const response = await api.post(`/test-sessions/${sessionId}/navigate`, {
    questionIndex,
  });

  // Response now correctly includes success: true
  if (response.data.success) {
    return {
      questionState: response.data.questionState,
      navigationContext: response.data.navigationContext,
    };
  }

  throw new Error(response.data.message || 'Navigation failed');
}
```

---

## Database Queries for Testing

If you need to manually create test scenarios:

```javascript
// Find active sessions for a user
db.testsessions.find({
  userId: ObjectId("user-id"),
  status: { $in: ["inProgress", "paused"] }
})

// Simulate corrupted session (remove testSnapshot)
db.testsessions.updateOne(
  { _id: ObjectId("session-id") },
  { $unset: { testSnapshot: "" } }
)

// Check session status
db.testsessions.findOne(
  { _id: ObjectId("session-id") },
  { status: 1, testSnapshot: 1, currentQuestionIndex: 1 }
)

// Mark session as failed (for testing)
db.testsessions.updateOne(
  { _id: ObjectId("session-id") },
  { $set: { status: "failed", completedAt: new Date() } }
)
```
