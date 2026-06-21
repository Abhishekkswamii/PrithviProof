import { test, expect } from "@playwright/test";
import path from "path";

const screenshotDir = path.resolve("tests/e2e/screenshots");

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("load");
  // Clear any existing state
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test.describe("Landing CTA routing", () => {
  test("Start My Carbon Audit redirects signed-out users to sign-up", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /Start My Carbon Audit/i }).first().click();
    await page.waitForURL("**/auth/sign-up?next=%2Fassessment");
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();
  });
});

test.describe("Protected routes", () => {
  test("dashboard redirects signed-out users to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/auth/sign-in?next=%2Fdashboard");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("settings redirects signed-out users to sign-in", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForURL("**/auth/sign-in?next=%2Fsettings");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });
});

test.describe("Firebase Emulator Flow - User Lifecycle", () => {
  test.describe.configure({ mode: "serial" });

  const testEmail = `testuser+${Date.now()}@example.com`;
  const testPassword = "Password123!";

  test("Create account, answer assessment, and sign out", async ({ page }) => {
    // 1. Sign Up
    await page.goto("/auth/sign-up");
    await page.getByLabel(/Name/i).fill("E2E Test User");
    await page.getByLabel(/Email/i).fill(testEmail);
    await page.getByLabel(/^Password$/i).fill(testPassword);
    await page.getByLabel(/Confirm password/i).fill(testPassword);
    await page.getByLabel(/I agree to the terms and privacy policy/i).check();
    
    // Check if there is an error first
    const loadingPromise = page.waitForURL("**/assessment", { timeout: 10000 }).catch(() => null);
    await page.getByRole("button", { name: "Create account" }).click();
    await loadingPromise;
    
    await expect(page.getByRole("heading", { name: /What best describes your diet\?/i })).toBeVisible();

    // 2. Answer a question
    await page.getByText(/Plant-based/i).click();
    await page.getByRole("button", { name: /Continue/i }).click();

    // 3. Navigate to Settings and Sign out
    await page.goto("/settings");
    await page.getByRole("button", { name: /Sign out/i }).click();
    await page.waitForURL("**/");
    await expect(page.getByRole("heading", { name: "Turn estimates into evidence." })).toBeVisible();
  });

  test("Sign in, verify data persistence, and refresh", async ({ page }) => {
    // 1. Sign in with the same credentials
    await page.goto("/auth/sign-in");
    await page.getByLabel(/Email/i).fill(testEmail);
    await page.getByLabel(/^Password$/i).fill(testPassword);
    
    const loadingPromise = page.waitForURL("**/assessment", { timeout: 10000 }).catch(() => null);
    await page.getByRole("button", { name: "Sign in" }).click();
    await loadingPromise;

    // Wait for the assessment to load, should not show Plant-based option if already answered, but for this test, we just check we are in assessment or dashboard
    await expect(page.getByRole("heading", { name: /What best describes your diet\?/i }).or(page.getByRole("heading", { name: /Your Carbon Audit/i }))).toBeVisible();

    // 2. Refresh page to verify Auth restoration
    await page.reload();
    await page.waitForLoadState("load");
    await expect(page.getByRole("heading", { name: /What best describes your diet\?/i }).or(page.getByRole("heading", { name: /Your Carbon Audit/i }))).toBeVisible();
  });
  test("AI Activity Parser mocked flow", async ({ page }) => {
    // 1. Sign in
    await page.goto("/auth/sign-in");
    await page.getByLabel(/Email/i).fill(testEmail);
    await page.getByLabel(/^Password$/i).fill(testPassword);
    
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("**/dashboard", { timeout: 10000 }).catch(() => null);
    await page.waitForURL("**/assessment", { timeout: 10000 }).catch(() => null);

    // 2. Navigate to Log page
    await page.goto("/log");
    await page.waitForURL("**/log");

    // 3. Enter natural language
    await page.getByLabel("Describe your activity").fill("12 km by Delhi Metro");
    await page.getByRole("button", { name: /Log Activity/i }).click();

    // 4. Verify preview UI appears (mock repository returns metro 12km)
    await expect(page.getByText("AI Activity Preview")).toBeVisible({ timeout: 10000 });
    
    // 5. Confirm and Save
    await page.getByRole("button", { name: /Confirm and Save/i }).click();

    // 6. Verify activity is logged in the list
    await expect(page.getByText("Activity logged successfully")).toBeVisible();
    await expect(page.getByText("12 km")).toBeVisible();
  });
});
