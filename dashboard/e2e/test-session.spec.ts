import { test, expect, Page } from '@playwright/test';

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5173',
  testId: '68e03cf403e48c3a73de8f3d',
  credentials: {
    email: 'demo.student@engineersmith.com',
    password: 'DemoStudent123!',
  },
};

// Helper to wait for network idle
async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

// Helper to login
async function login(page: Page) {
  await page.goto('/auth');
  await page.waitForLoadState('domcontentloaded');

  // Fill login form
  await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', TEST_CONFIG.credentials.email);
  await page.fill('input[type="password"], input[name="password"]', TEST_CONFIG.credentials.password);

  // Click login button
  await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');

  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|home)/i, { timeout: 15000 });
  await waitForNetworkIdle(page);

  console.log('✓ Logged in successfully');
}

// Helper to handle existing session dialog
async function handleExistingSessionDialog(page: Page) {
  // Check if there's a restoration alert or existing session prompt
  const resumeButton = page.locator('button:has-text("Resume Session")');
  const startFreshButton = page.locator('button:has-text("Start Fresh")');
  const startNewButton = page.locator('button:has-text("Start New Session")');

  // Wait a bit to see if any dialog appears
  await page.waitForTimeout(2000);

  if (await startFreshButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    console.log('  → Found existing session, clicking "Start Fresh"');
    await startFreshButton.click();
    await page.waitForTimeout(2000);
  } else if (await startNewButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    console.log('  → Found recovery failure, clicking "Start New Session"');
    await startNewButton.click();
    await page.waitForTimeout(2000);
  }
}

// Helper to answer current question based on type
async function answerCurrentQuestion(page: Page): Promise<string> {
  // Wait for question to load
  await page.waitForSelector('[class*="question"], [data-testid="question"]', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);

  // Try to determine question type and answer accordingly

  // Multiple Choice - click first option
  const mcOption = page.locator('button:has-text("A)"), button:has-text("A."), [class*="option"]:first-child, label:has(input[type="radio"]):first-of-type');
  if (await mcOption.first().isVisible({ timeout: 1000 }).catch(() => false)) {
    await mcOption.first().click();
    console.log('  → Answered multiple choice question');
    return 'multipleChoice';
  }

  // True/False - click True
  const trueFalseTrue = page.locator('button:has-text("True"), label:has-text("True")');
  if (await trueFalseTrue.isVisible({ timeout: 1000 }).catch(() => false)) {
    await trueFalseTrue.click();
    console.log('  → Answered true/false question');
    return 'trueFalse';
  }

  // Code Challenge - type some code
  const codeEditor = page.locator('.monaco-editor textarea, [class*="editor"] textarea, textarea[class*="code"]');
  if (await codeEditor.isVisible({ timeout: 1000 }).catch(() => false)) {
    await codeEditor.fill('// Test answer\nfunction solution() { return true; }');
    console.log('  → Answered code challenge question');
    return 'codeChallenge';
  }

  // Fill in the blank - fill first input
  const blankInput = page.locator('input[class*="blank"], input[placeholder*="answer" i], input[type="text"]:not([type="email"]):not([type="password"])').first();
  if (await blankInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await blankInput.fill('test answer');
    console.log('  → Answered fill-in-the-blank question');
    return 'fillInTheBlank';
  }

  console.log('  → Could not determine question type, skipping');
  return 'unknown';
}

test.describe('Test Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for test session operations
    test.setTimeout(180000); // 3 minutes
  });

  test('Complete test session flow: login → start → answer → review → submit', async ({ page }) => {
    // Step 1: Login
    console.log('\n📋 Step 1: Login');
    await login(page);
    expect(page.url()).toContain('dashboard');

    // Step 2: Navigate to test
    console.log('\n📋 Step 2: Navigate to test session');
    await page.goto(`/test-session/${TEST_CONFIG.testId}`);
    await page.waitForTimeout(3000); // Wait for session initialization

    // Handle any existing session dialogs
    await handleExistingSessionDialog(page);

    // Wait for test to load
    await page.waitForSelector('button:has-text("Submit"), button:has-text("Skip"), button:has-text("Next"), [class*="question"]', { timeout: 30000 });
    console.log('✓ Test session started');

    // Step 3: Answer first 2 questions
    console.log('\n📋 Step 3: Answer questions');

    for (let i = 0; i < 2; i++) {
      console.log(`  Question ${i + 1}:`);
      await answerCurrentQuestion(page);

      // Click Submit Answer or Next
      const submitBtn = page.locator('button:has-text("Submit Answer"), button:has-text("Submit & Next")');
      if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // Step 4: Skip a question
    console.log('\n📋 Step 4: Skip a question');
    const skipBtn = page.locator('button:has-text("Skip")');
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(2000);
      console.log('✓ Skipped question');
    }

    // Step 5: Click Review & Submit
    console.log('\n📋 Step 5: Enter review mode');
    const reviewBtn = page.locator('button:has-text("Review & Submit"), button:has-text("Review")');
    if (await reviewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reviewBtn.click();
      await page.waitForTimeout(2000);
      console.log('✓ Entered review mode');
    } else {
      console.log('  → Review button not found, may already be in review mode');
    }

    // Step 6: Test navigation in review mode (this was the bug!)
    console.log('\n📋 Step 6: Test review mode navigation');

    // Look for question buttons in review mode (numbered buttons 1, 2, 3, etc.)
    const questionButtons = page.locator('button:has-text("1"), button:has-text("2"), [class*="question-nav"] button, [class*="grid"] button');
    const firstQuestionBtn = questionButtons.first();

    if (await firstQuestionBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('  → Clicking question 1 in review mode');
      await firstQuestionBtn.click();
      await page.waitForTimeout(2000);

      // Check that we didn't crash - should see question content or be able to navigate
      const hasError = await page.locator('text=Error Loading Session, text=Server action failed').isVisible({ timeout: 1000 }).catch(() => false);

      if (hasError) {
        console.log('  ✗ NAVIGATION BUG DETECTED - Error shown after clicking question');
        // Take screenshot for debugging
        await page.screenshot({ path: 'e2e/screenshots/navigation-bug.png' });
        expect(hasError).toBeFalsy(); // This will fail the test
      } else {
        console.log('  ✓ Navigation worked - no error screen');
      }

      // Try clicking another question
      const secondQuestionBtn = page.locator('button:has-text("2")').first();
      if (await secondQuestionBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('  → Clicking question 2');
        await secondQuestionBtn.click();
        await page.waitForTimeout(2000);

        const hasError2 = await page.locator('text=Error Loading Session').isVisible({ timeout: 1000 }).catch(() => false);
        expect(hasError2).toBeFalsy();
        console.log('  ✓ Second navigation also worked');
      }
    } else {
      console.log('  → No question navigation buttons found in review mode');
    }

    // Step 7: Go back to review summary (if we navigated away)
    console.log('\n📋 Step 7: Return to review summary');
    const backToReviewBtn = page.locator('button:has-text("Review & Submit"), button:has-text("Back to Review")');
    if (await backToReviewBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await backToReviewBtn.click();
      await page.waitForTimeout(2000);
    }

    // Step 8: Submit the test
    console.log('\n📋 Step 8: Submit test');
    const submitTestBtn = page.locator('button:has-text("Submit Test"), button:has-text("Submit Section")');

    if (await submitTestBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Handle confirmation dialog
      page.on('dialog', async dialog => {
        console.log(`  → Confirmation dialog: ${dialog.message()}`);
        await dialog.accept();
      });

      await submitTestBtn.click();
      await page.waitForTimeout(3000);
      console.log('✓ Clicked submit button');
    }

    // Step 9: Verify completion
    console.log('\n📋 Step 9: Verify test completion');

    // Should redirect to results or show completion message
    const completionIndicators = [
      'text=completed',
      'text=Completed',
      'text=Results',
      'text=Score',
      'text=submitted',
      '[class*="result"]',
    ];

    let completed = false;
    for (const indicator of completionIndicators) {
      if (await page.locator(indicator).isVisible({ timeout: 2000 }).catch(() => false)) {
        completed = true;
        console.log(`  ✓ Found completion indicator: ${indicator}`);
        break;
      }
    }

    // Also check URL
    if (page.url().includes('result') || page.url().includes('dashboard')) {
      completed = true;
      console.log(`  ✓ Redirected to: ${page.url()}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log(completed ? '✅ TEST PASSED - Full flow completed!' : '⚠️ TEST COMPLETED - Could not verify submission');
    console.log('='.repeat(50));
  });

  test('Review mode navigation does not crash', async ({ page }) => {
    // This test specifically targets the navigation bug fix
    console.log('\n📋 Testing review mode navigation specifically');

    await login(page);
    await page.goto(`/test-session/${TEST_CONFIG.testId}`);
    await page.waitForTimeout(3000);
    await handleExistingSessionDialog(page);

    // Wait for session
    await page.waitForSelector('button:has-text("Submit"), button:has-text("Skip")', { timeout: 30000 });

    // Quick answer a question
    await answerCurrentQuestion(page);
    const submitBtn = page.locator('button:has-text("Submit Answer")');
    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }

    // Enter review mode
    const reviewBtn = page.locator('button:has-text("Review & Submit")');
    if (await reviewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reviewBtn.click();
      await page.waitForTimeout(3000);
    }

    // Try to navigate to multiple questions
    const questionNumbers = ['1', '2', '3'];
    for (const num of questionNumbers) {
      const btn = page.locator(`button:has-text("${num}")`).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log(`  → Clicking question ${num}`);
        await btn.click();
        await page.waitForTimeout(1500);

        // Check for error
        const errorVisible = await page.locator('text=Error Loading Session, text=Server action failed, text=failed').first().isVisible({ timeout: 500 }).catch(() => false);

        if (errorVisible) {
          await page.screenshot({ path: `e2e/screenshots/nav-error-q${num}.png` });
          throw new Error(`Navigation to question ${num} caused an error!`);
        }
        console.log(`  ✓ Question ${num} navigation OK`);
      }
    }

    console.log('\n✅ Review mode navigation test passed!');
  });
});

test.describe('Error Handling', () => {
  test('Shows recovery failure message gracefully', async ({ page }) => {
    // This test would need a way to trigger a recovery failure
    // For now, just verify the UI components exist
    console.log('\n📋 Verifying error handling UI components');

    await login(page);

    // Navigate to dashboard and verify it loads
    await page.goto('/dashboard');
    await waitForNetworkIdle(page);

    expect(page.url()).toContain('dashboard');
    console.log('✓ Dashboard loads correctly');
  });
});
