import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login form", async ({ page }) => {
    await expect(page.getByText("ArqOS")).toBeVisible();
    await expect(page.getByText("Entre com sua conta para continuar")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("should have link to register page", async ({ page }) => {
    const registerLink = page.getByRole("link", { name: "Cadastre-se" });
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL("/cadastro");
  });

  test("should show validation error for empty email", async ({ page }) => {
    await page.getByLabel("Senha").fill("123456");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Email é obrigatório")).toBeVisible();
  });

  test("should not submit form with invalid email (browser validation)", async ({ page }) => {
    // Test that browser's HTML5 email validation prevents submission
    await page.getByLabel("Email").fill("invalid");
    await page.getByLabel("Senha").fill("123456");

    const submitButton = page.getByRole("button", { name: "Entrar" });
    await submitButton.click();

    // Button should NOT be disabled because browser validation blocked submission
    // and the form was never submitted
    await expect(submitButton).not.toBeDisabled();
    // Should still be on login page
    await expect(page).toHaveURL("/login");
  });

  test("should show validation error for empty password", async ({ page }) => {
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Senha é obrigatória")).toBeVisible();
  });

  test("should show validation error for short password", async ({ page }) => {
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Senha").fill("12345");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Senha deve ter no mínimo 6 caracteres")).toBeVisible();
  });

  test("should show loading state on submit", async ({ page }) => {
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Senha").fill("123456");

    // Click and immediately check for loading state
    const submitButton = page.getByRole("button", { name: "Entrar" });
    await submitButton.click();

    // Button should be disabled during loading
    await expect(submitButton).toBeDisabled();
  });
});

test.describe("Register Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cadastro");
  });

  test("should display register form", async ({ page }) => {
    await expect(page.locator("[data-slot='card-title']")).toContainText("Criar conta");
    await expect(page.getByText("Preencha os dados abaixo")).toBeVisible();
    await expect(page.getByLabel("Nome completo")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Senha", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirmar senha")).toBeVisible();
    await expect(page.getByRole("button", { name: "Criar conta" })).toBeVisible();
  });

  test("should have link to login page", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: "Fazer login" });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL("/login");
  });

  test("should show validation error for empty name", async ({ page }) => {
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Senha", { exact: true }).fill("123456");
    await page.getByLabel("Confirmar senha").fill("123456");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Nome é obrigatório")).toBeVisible();
  });

  test("should show validation error for short name", async ({ page }) => {
    await page.getByLabel("Nome completo").fill("J");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Senha", { exact: true }).fill("123456");
    await page.getByLabel("Confirmar senha").fill("123456");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Nome deve ter no mínimo 2 caracteres")).toBeVisible();
  });

  test("should show validation error for empty email", async ({ page }) => {
    await page.getByLabel("Nome completo").fill("John Doe");
    await page.getByLabel("Senha", { exact: true }).fill("123456");
    await page.getByLabel("Confirmar senha").fill("123456");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Email é obrigatório")).toBeVisible();
  });

  test("should not submit form with invalid email (browser validation)", async ({ page }) => {
    // Test that browser's HTML5 email validation prevents submission
    await page.getByLabel("Nome completo").fill("John Doe");
    await page.getByLabel("Email").fill("invalid");
    await page.getByLabel("Senha", { exact: true }).fill("123456");
    await page.getByLabel("Confirmar senha").fill("123456");

    const submitButton = page.getByRole("button", { name: "Criar conta" });
    await submitButton.click();

    // Button should NOT be disabled because browser validation blocked submission
    await expect(submitButton).not.toBeDisabled();
    // Should still be on register page
    await expect(page).toHaveURL("/cadastro");
  });

  test("should show validation error for short password", async ({ page }) => {
    await page.getByLabel("Nome completo").fill("John Doe");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Senha", { exact: true }).fill("12345");
    await page.getByLabel("Confirmar senha").fill("12345");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Senha deve ter no mínimo 6 caracteres")).toBeVisible();
  });

  test("should show validation error for mismatched passwords", async ({ page }) => {
    await page.getByLabel("Nome completo").fill("John Doe");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Senha", { exact: true }).fill("123456");
    await page.getByLabel("Confirmar senha").fill("654321");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Senhas não conferem")).toBeVisible();
  });

  test("should show loading state on submit", async ({ page }) => {
    await page.getByLabel("Nome completo").fill("John Doe");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Senha", { exact: true }).fill("123456");
    await page.getByLabel("Confirmar senha").fill("123456");

    const submitButton = page.getByRole("button", { name: "Criar conta" });
    await submitButton.click();

    // Button should be disabled during loading
    await expect(submitButton).toBeDisabled();
  });
});

test.describe("Route Protection", () => {
  test("should redirect unauthenticated user from dashboard to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login");
  });

  test("should redirect unauthenticated user from protected routes to login", async ({ page }) => {
    await page.goto("/dashboard/projetos");
    await expect(page).toHaveURL("/login");
  });
});
