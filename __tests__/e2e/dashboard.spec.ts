import { test, expect } from "@playwright/test";

test.describe("Dashboard Page", () => {
  test.describe("Route Protection", () => {
    test("should redirect unauthenticated user to login", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Dashboard Content (Authenticated)", () => {
    // Skip these tests by default - they require authentication setup
    // To run: set up auth state or use a test account
    test.skip(({ browserName }) => true, "Requires authentication setup");

    test.beforeEach(async ({ page }) => {
      // TODO: Set up authentication state here
      // Option 1: Login via UI
      // Option 2: Set storageState with valid session
      // Option 3: Mock Supabase auth
      await page.goto("/dashboard");
    });

    test("should display welcome header", async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Bem-vindo");
      await expect(page.getByText("Aqui esta um resumo do seu escritorio")).toBeVisible();
    });

    test("should display metric cards", async ({ page }) => {
      // Wait for dashboard to load (skeleton to disappear)
      await page.waitForSelector("[data-testid='dashboard-content']", { timeout: 10000 });

      // Check metric cards - using text that appears in the cards
      await expect(page.getByText("Orcamentos").first()).toBeVisible();
      await expect(page.getByText("Conversao")).toBeVisible();
      await expect(page.getByText("Projetos Ativos").first()).toBeVisible();
      await expect(page.getByText("Horas")).toBeVisible();
    });

    test("should display financial summary cards", async ({ page }) => {
      await page.waitForSelector("[data-testid='dashboard-content']", { timeout: 10000 });

      await expect(page.getByText("Recebido")).toBeVisible();
      await expect(page.getByText("Pendente")).toBeVisible();
      // Saldo or Vencido depending on overdue amount
      const saldoOrVencido = page.getByText(/Saldo|Vencido/);
      await expect(saldoOrVencido).toBeVisible();
    });

    test("should display recent budgets section", async ({ page }) => {
      await page.waitForSelector("[data-testid='dashboard-content']", { timeout: 10000 });

      await expect(page.getByText("Orcamentos Recentes")).toBeVisible();
    });

    test("should display active projects section", async ({ page }) => {
      await page.waitForSelector("[data-testid='dashboard-content']", { timeout: 10000 });

      // Check for the section title (appears twice - once in metrics, once in section)
      const projectsSection = page.locator(".arq-card").filter({ hasText: "Projetos Ativos" });
      await expect(projectsSection).toBeVisible();
    });

    test("should display quick action buttons", async ({ page }) => {
      await page.waitForSelector("[data-testid='dashboard-content']", { timeout: 10000 });

      // Check quick action buttons exist
      await expect(page.getByRole("link", { name: "Novo Projeto" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Novo Orcamento" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Calculadora" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Apresentacao" })).toBeVisible();
    });

    test("should navigate to projetos/novo from quick action", async ({ page }) => {
      await page.waitForSelector("[data-testid='dashboard-content']", { timeout: 10000 });

      await page.getByRole("link", { name: "Novo Projeto" }).click();
      await expect(page).toHaveURL(/projetos\/novo/);
    });

    test("should navigate to orcamentos/novo from quick action", async ({ page }) => {
      await page.waitForSelector("[data-testid='dashboard-content']", { timeout: 10000 });

      await page.getByRole("link", { name: "Novo Orcamento" }).click();
      await expect(page).toHaveURL(/orcamentos\/novo/);
    });

    test("should navigate to calculadora from quick action", async ({ page }) => {
      await page.waitForSelector("[data-testid='dashboard-content']", { timeout: 10000 });

      await page.getByRole("link", { name: "Calculadora" }).click();
      await expect(page).toHaveURL(/calculadora/);
    });

    test("should navigate to apresentacoes from quick action", async ({ page }) => {
      await page.waitForSelector("[data-testid='dashboard-content']", { timeout: 10000 });

      await page.getByRole("link", { name: "Apresentacao" }).click();
      await expect(page).toHaveURL(/apresentacoes/);
    });

    test("should navigate to all budgets via 'Ver todos' link", async ({ page }) => {
      await page.waitForSelector("[data-testid='dashboard-content']", { timeout: 10000 });

      // Find the "Ver todos" link in recent budgets section
      const budgetsSection = page.locator(".arq-card").filter({ hasText: "Orcamentos Recentes" });
      await budgetsSection.getByRole("link", { name: "Ver todos" }).click();
      await expect(page).toHaveURL(/orcamentos/);
    });

    test("should navigate to all projects via 'Ver todos' link", async ({ page }) => {
      await page.waitForSelector("[data-testid='dashboard-content']", { timeout: 10000 });

      // Find the "Ver todos" link in active projects section
      const projectsSection = page.locator(".arq-card").filter({ hasText: "Projetos Ativos" });
      await projectsSection.getByRole("link", { name: "Ver todos" }).click();
      await expect(page).toHaveURL(/projetos/);
    });
  });
});

test.describe("Dashboard Loading State", () => {
  test.skip(({ browserName }) => true, "Requires authentication setup");

  test("should show skeleton while loading", async ({ page }) => {
    // Slow down network to see skeleton
    await page.route("**/api/dashboard/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto("/dashboard");

    // Should show skeleton elements
    await expect(page.locator(".animate-pulse").first()).toBeVisible();
  });
});
