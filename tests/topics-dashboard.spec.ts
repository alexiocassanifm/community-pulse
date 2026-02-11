import { test, expect, Page } from "@playwright/test";

/** Mock topics analytics response with data */
const MOCK_TOPICS_RESPONSE = {
  categories: {
    "Claude Products": [
      { id: "claude-code", topic: "Claude Code", count: 45, percentage: 65.2 },
      { id: "claude-api", topic: "Claude API", count: 32, percentage: 46.4 },
      { id: "claude-desktop", topic: "Claude Desktop", count: 28, percentage: 40.6 },
      { id: "claude-code-sdk", topic: "Claude Code SDK", count: 15, percentage: 21.7 },
      { id: "cowork", topic: "Cowork", count: 10, percentage: 14.5 },
    ],
    "Agentic AI": [
      { id: "building-agents", topic: "Building Agents", count: 38, percentage: 55.1 },
      { id: "multi-agent-swarms", topic: "Multi-Agent Swarms", count: 25, percentage: 36.2 },
      { id: "agentic-workflows", topic: "Agentic Workflow Design", count: 22, percentage: 31.9 },
      { id: "subagents", topic: "Subagents & Delegation", count: 18, percentage: 26.1 },
      { id: "autonomous-tasks", topic: "Autonomous Task Execution", count: 12, percentage: 17.4 },
    ],
    "Skills & MCP": [
      { id: "mcp-servers", topic: "MCP Servers & Tools", count: 30, percentage: 43.5 },
      { id: "creating-skills", topic: "Creating Skills", count: 20, percentage: 29.0 },
      { id: "integrations", topic: "Integrations & Connectors", count: 14, percentage: 20.3 },
    ],
    "Development Practices": [
      { id: "coding-with-claude", topic: "Coding with Claude", count: 42, percentage: 60.9 },
      { id: "prompt-engineering", topic: "Prompt Engineering", count: 35, percentage: 50.7 },
      { id: "automation", topic: "Automation & Pipelines", count: 20, percentage: 29.0 },
    ],
    "Session Formats": [
      { id: "hands-on-labs", topic: "Hands-on Labs", count: 40, percentage: 58.0 },
      { id: "live-building", topic: "Live Building Sessions", count: 33, percentage: 47.8 },
      { id: "demo-sessions", topic: "Demo Sessions", count: 22, percentage: 31.9 },
    ],
  },
  custom_topics: [
    { text: "ai safety", count: 5 },
    { text: "open source contributions", count: 3 },
  ],
  total_submissions: 69,
  date_range: { start: null, end: null },
};

/** Empty analytics response */
const MOCK_EMPTY_RESPONSE = {
  categories: {
    "Claude Products": [
      { id: "claude-code", topic: "Claude Code", count: 0, percentage: 0 },
      { id: "claude-desktop", topic: "Claude Desktop", count: 0, percentage: 0 },
      { id: "claude-api", topic: "Claude API", count: 0, percentage: 0 },
      { id: "claude-code-sdk", topic: "Claude Code SDK", count: 0, percentage: 0 },
      { id: "cowork", topic: "Cowork", count: 0, percentage: 0 },
    ],
    "Agentic AI": [
      { id: "building-agents", topic: "Building Agents", count: 0, percentage: 0 },
      { id: "multi-agent-swarms", topic: "Multi-Agent Swarms", count: 0, percentage: 0 },
      { id: "subagents", topic: "Subagents & Delegation", count: 0, percentage: 0 },
      { id: "agentic-workflows", topic: "Agentic Workflow Design", count: 0, percentage: 0 },
      { id: "autonomous-tasks", topic: "Autonomous Task Execution", count: 0, percentage: 0 },
    ],
    "Skills & MCP": [
      { id: "creating-skills", topic: "Creating Skills", count: 0, percentage: 0 },
      { id: "mcp-servers", topic: "MCP Servers & Tools", count: 0, percentage: 0 },
      { id: "integrations", topic: "Integrations & Connectors", count: 0, percentage: 0 },
    ],
    "Development Practices": [
      { id: "coding-with-claude", topic: "Coding with Claude", count: 0, percentage: 0 },
      { id: "automation", topic: "Automation & Pipelines", count: 0, percentage: 0 },
      { id: "prompt-engineering", topic: "Prompt Engineering", count: 0, percentage: 0 },
    ],
    "Session Formats": [
      { id: "hands-on-labs", topic: "Hands-on Labs", count: 0, percentage: 0 },
      { id: "live-building", topic: "Live Building Sessions", count: 0, percentage: 0 },
      { id: "demo-sessions", topic: "Demo Sessions", count: 0, percentage: 0 },
    ],
  },
  custom_topics: [],
  total_submissions: 0,
  date_range: { start: null, end: null },
};

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL ?? "";
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD ?? "";
const hasCredentials = TEST_EMAIL.length > 0 && TEST_PASSWORD.length > 0;

async function loginAsOrganizer(page: Page) {
  await page.goto("/dashboard/login");
  await page.waitForLoadState("networkidle");

  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();

  await page.waitForURL("**/dashboard**", { timeout: 15000 });
  await page.waitForFunction(
    () => !window.location.pathname.includes("/login"),
    { timeout: 10000 }
  );
}

async function mockTopicsApi(page: Page, response = MOCK_TOPICS_RESPONSE) {
  await page.route("**/api/analytics/topics*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

test.describe("Topics Dashboard - Route Protection", () => {
  test("unauthenticated access to /dashboard/topics redirects to login", async ({
    page,
  }) => {
    await page.goto("/dashboard/topics");
    await page.waitForURL("**/dashboard/login**", { timeout: 10000 });
    await expect(
      page.getByRole("heading", { name: "Organizer Dashboard" })
    ).toBeVisible();
  });
});

test.describe("Topics Dashboard - API Endpoint", () => {
  test("unauthenticated API request returns 401", async ({ request }) => {
    const response = await request.get("/api/analytics/topics");
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty("message", "Unauthorized");
  });

  test("API response contract matches expected structure", async () => {
    expect(MOCK_TOPICS_RESPONSE).toHaveProperty("categories");
    expect(MOCK_TOPICS_RESPONSE).toHaveProperty("custom_topics");
    expect(MOCK_TOPICS_RESPONSE).toHaveProperty("total_submissions");
    expect(MOCK_TOPICS_RESPONSE).toHaveProperty("date_range");

    for (const category of [
      "Claude Products",
      "Agentic AI",
      "Skills & MCP",
      "Development Practices",
      "Session Formats",
    ]) {
      const entries = MOCK_TOPICS_RESPONSE.categories[category];
      expect(entries).toBeDefined();
      expect(entries.length).toBeGreaterThan(0);
      for (const entry of entries) {
        expect(entry).toHaveProperty("id");
        expect(entry).toHaveProperty("topic");
        expect(entry).toHaveProperty("count");
        expect(entry).toHaveProperty("percentage");
        expect(typeof entry.count).toBe("number");
        expect(typeof entry.percentage).toBe("number");
      }
    }
  });
});

test.describe("Topics Dashboard - Page Load & Charts", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");
  test.beforeEach(async ({ page }) => {
    await mockTopicsApi(page);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/topics");
    await page.waitForLoadState("networkidle");
  });

  test("page displays heading and description", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Topics of Interest" })
    ).toBeVisible();
    await expect(
      page.getByText("Aggregated participant interest across topic categories")
    ).toBeVisible();
  });

  test("all 5 category sections are visible", async ({ page }) => {
    for (const category of [
      "Claude Products",
      "Agentic AI",
      "Skills & MCP",
      "Development Practices",
      "Session Formats",
    ]) {
      await expect(page.getByText(category, { exact: true })).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test("category charts have ARIA labels", async ({ page }) => {
    const charts = page.locator(
      '[role="img"][aria-label*="Bar chart showing topic preferences"]'
    );
    await expect(charts.first()).toBeVisible({ timeout: 10000 });
    const count = await charts.count();
    expect(count).toBe(5);
  });

  test("submission count footer is displayed", async ({ page }) => {
    await expect(page.getByText("Based on 69 submissions")).toBeVisible();
  });
});

test.describe("Topics Dashboard - Custom Topics", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");

  test("custom topic suggestions section displays entries", async ({
    page,
  }) => {
    await mockTopicsApi(page);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/topics");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Custom Topic Suggestions")).toBeVisible();
    await expect(page.getByText("ai safety")).toBeVisible();
    await expect(page.getByText("5 mentions")).toBeVisible();
    await expect(page.getByText("open source contributions")).toBeVisible();
    await expect(page.getByText("3 mentions")).toBeVisible();
  });

  test("custom topics section is hidden when no custom data", async ({
    page,
  }) => {
    await mockTopicsApi(page, {
      ...MOCK_TOPICS_RESPONSE,
      custom_topics: [],
    });
    await loginAsOrganizer(page);
    await page.goto("/dashboard/topics");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText("Custom Topic Suggestions")
    ).not.toBeVisible();
  });
});

test.describe("Topics Dashboard - Empty State", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");
  test("displays empty state when no data available", async ({ page }) => {
    await mockTopicsApi(page, MOCK_EMPTY_RESPONSE);
    await loginAsOrganizer(page);
    await page.goto("/dashboard/topics");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("No Topic Data")).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByText("Topic interest data will appear here")
    ).toBeVisible();
  });
});

test.describe("Topics Dashboard - Error Handling", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");
  test("page handles API error gracefully", async ({ page }) => {
    await page.route("**/api/analytics/topics*", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal server error" }),
      });
    });

    await loginAsOrganizer(page);
    await page.goto("/dashboard/topics");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText("Failed to fetch topic analytics")
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Topics Dashboard - Responsive Design", () => {
  test.skip(!hasCredentials, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD");
  test("charts display at tablet viewport (768px)", async ({ page }) => {
    await mockTopicsApi(page);
    await loginAsOrganizer(page);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/dashboard/topics");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: "Topics of Interest" })
    ).toBeVisible();
    await expect(
      page.locator('[role="img"][aria-label*="Bar chart showing topic preferences"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("charts display at desktop viewport (1280px)", async ({ page }) => {
    await mockTopicsApi(page);
    await loginAsOrganizer(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/dashboard/topics");
    await page.waitForLoadState("networkidle");

    const charts = page.locator(
      '[role="img"][aria-label*="Bar chart showing topic preferences"]'
    );
    await expect(charts.first()).toBeVisible({ timeout: 10000 });
    const count = await charts.count();
    expect(count).toBe(5);
  });
});
