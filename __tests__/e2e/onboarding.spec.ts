import { test, expect } from "@playwright/test";

test.describe("Onboarding - Welcome Screen", () => {
  test.describe("Route Protection", () => {
    test("should redirect unauthenticated user from /welcome to /login", async ({ page }) => {
      await page.goto("/welcome");
      await expect(page).toHaveURL("/login");
    });

    test("should redirect unauthenticated user from /setup to /login", async ({ page }) => {
      await page.goto("/setup");
      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Welcome Screen Content (Authenticated)", () => {
    // Skip these tests by default - they require authentication setup
    // To run: set up auth state or use a test account
    test.skip(({ browserName }) => true, "Requires authentication setup");

    test.beforeEach(async ({ page }) => {
      // TODO: Set up authentication state here
      // Option 1: Login via UI
      // Option 2: Set storageState with valid session
      // Option 3: Mock Supabase auth
      await page.goto("/welcome");
    });

    test("should display welcome screen with title and description", async ({ page }) => {
      await expect(page.getByText(/Bem-vindo/)).toBeVisible();
      await expect(
        page.getByText("Vamos configurar seu escritório")
      ).toBeVisible();
    });

    test("should display configuration list items", async ({ page }) => {
      await expect(page.getByText("Tamanho e nome do escritório")).toBeVisible();
      await expect(page.getByText("Equipe e cargos")).toBeVisible();
      await expect(page.getByText("Custos fixos mensais")).toBeVisible();
      await expect(page.getByText("Serviços oferecidos")).toBeVisible();
      await expect(page.getByText("Margem de lucro desejada")).toBeVisible();
    });

    test("should display both action buttons", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: "Começar Configuração" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Pular por agora" })
      ).toBeVisible();
    });

    test("should navigate to /setup when clicking 'Começar Configuração'", async ({ page }) => {
      await page.getByRole("button", { name: "Começar Configuração" }).click();
      await expect(page).toHaveURL("/setup");
    });

    test("should navigate to /projetos when clicking 'Pular por agora'", async ({ page }) => {
      await page.getByRole("button", { name: "Pular por agora" }).click();
      await expect(page).toHaveURL("/projetos");
    });
  });
});

test.describe("Onboarding - Setup Wizard", () => {
  // Skip all wizard tests by default - they require authentication
  test.skip(({ browserName }) => true, "Requires authentication setup");

  test.beforeEach(async ({ page }) => {
    // TODO: Set up authentication state here
    await page.goto("/setup");
  });

  test.describe("Step 1: Office Size", () => {
    test("should display office size selection step", async ({ page }) => {
      await expect(
        page.getByText("Qual o tamanho do seu escritório?")
      ).toBeVisible();
      await expect(
        page.getByText("Isso nos ajuda a personalizar sua experiência")
      ).toBeVisible();
    });

    test("should display all 4 size options", async ({ page }) => {
      await expect(page.getByText("Solo")).toBeVisible();
      await expect(page.getByText("1 pessoa")).toBeVisible();
      await expect(page.getByText("Pequeno")).toBeVisible();
      await expect(page.getByText("2-5 pessoas")).toBeVisible();
      await expect(page.getByText("Médio")).toBeVisible();
      await expect(page.getByText("6-15 pessoas")).toBeVisible();
      await expect(page.getByText("Grande")).toBeVisible();
      await expect(page.getByText("16+ pessoas")).toBeVisible();
    });

    test("should have 'Voltar' button disabled on first step", async ({ page }) => {
      await expect(page.getByRole("button", { name: "Voltar" })).toBeDisabled();
    });

    test("should have 'Continuar' button disabled when no size selected", async ({ page }) => {
      // Note: This depends on implementation - canGoNext might require size selection
      const continueButton = page.getByRole("button", { name: "Continuar" });
      await expect(continueButton).toBeDisabled();
    });

    test("should enable 'Continuar' button after selecting a size", async ({ page }) => {
      // Click on "Solo" option
      await page.getByText("Solo").click();
      await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled();
    });

    test("should advance to step 2 after selecting size and clicking continue", async ({ page }) => {
      await page.getByText("Pequeno").click();
      await page.getByRole("button", { name: "Continuar" }).click();
      // Step 2 should show office name question
      await expect(
        page.getByText("Qual o nome do seu escritório?")
      ).toBeVisible();
    });
  });

  test.describe("Step 2: Office Name", () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to step 2
      await page.getByText("Solo").click();
      await page.getByRole("button", { name: "Continuar" }).click();
    });

    test("should display office name input step", async ({ page }) => {
      await expect(
        page.getByText("Qual o nome do seu escritório?")
      ).toBeVisible();
      await expect(
        page.getByText("Este nome será exibido em documentos e propostas")
      ).toBeVisible();
    });

    test("should display name input field", async ({ page }) => {
      await expect(page.getByLabel("Nome do Escritório")).toBeVisible();
      await expect(page.getByText("Mínimo de 2 caracteres")).toBeVisible();
    });

    test("should enable 'Voltar' button on step 2", async ({ page }) => {
      await expect(page.getByRole("button", { name: "Voltar" })).toBeEnabled();
    });

    test("should have 'Continuar' disabled with empty name", async ({ page }) => {
      await expect(page.getByRole("button", { name: "Continuar" })).toBeDisabled();
    });

    test("should have 'Continuar' disabled with single character name", async ({ page }) => {
      await page.getByLabel("Nome do Escritório").fill("A");
      await expect(page.getByRole("button", { name: "Continuar" })).toBeDisabled();
    });

    test("should enable 'Continuar' with valid name (2+ chars)", async ({ page }) => {
      await page.getByLabel("Nome do Escritório").fill("Studio Arquitetura");
      await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled();
    });

    test("should go back to step 1 when clicking 'Voltar'", async ({ page }) => {
      await page.getByRole("button", { name: "Voltar" }).click();
      await expect(
        page.getByText("Qual o tamanho do seu escritório?")
      ).toBeVisible();
    });

    test("should advance to step 3 with valid name", async ({ page }) => {
      await page.getByLabel("Nome do Escritório").fill("Studio Arquitetura");
      await page.getByRole("button", { name: "Continuar" }).click();
      await expect(page.getByText("Quem faz parte da equipe?")).toBeVisible();
    });
  });

  test.describe("Step 3: Team", () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to step 3
      await page.getByText("Solo").click();
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByLabel("Nome do Escritório").fill("Studio Arquitetura");
      await page.getByRole("button", { name: "Continuar" }).click();
    });

    test("should display team configuration step", async ({ page }) => {
      await expect(page.getByText("Quem faz parte da equipe?")).toBeVisible();
      await expect(
        page.getByText("Adicione os membros do seu escritório")
      ).toBeVisible();
    });

    test("should display add member form when no members exist", async ({ page }) => {
      await expect(page.getByLabel("Nome")).toBeVisible();
      await expect(page.getByLabel("Cargo")).toBeVisible();
      await expect(page.getByLabel("Salário (R$)")).toBeVisible();
      await expect(page.getByLabel("Horas/mês")).toBeVisible();
    });

    test("should have 'Adicionar' button disabled with empty name", async ({ page }) => {
      await expect(page.getByRole("button", { name: "Adicionar" })).toBeDisabled();
    });

    test("should enable 'Adicionar' button with valid name", async ({ page }) => {
      await page.getByLabel("Nome").fill("João Silva");
      await expect(page.getByRole("button", { name: "Adicionar" })).toBeEnabled();
    });

    test("should add team member to list", async ({ page }) => {
      await page.getByLabel("Nome").fill("João Silva");
      await page.getByRole("button", { name: "Adicionar" }).click();
      // Member should appear in list
      await expect(page.getByText("João Silva")).toBeVisible();
      await expect(page.getByText("Total: 1 pessoa(s)")).toBeVisible();
    });

    test("should show 'Adicionar Membro' button after adding first member", async ({ page }) => {
      await page.getByLabel("Nome").fill("João Silva");
      await page.getByRole("button", { name: "Adicionar" }).click();
      await expect(
        page.getByRole("button", { name: "Adicionar Membro" })
      ).toBeVisible();
    });

    test("should remove team member when clicking delete button", async ({ page }) => {
      // Add a member first
      await page.getByLabel("Nome").fill("João Silva");
      await page.getByRole("button", { name: "Adicionar" }).click();
      await expect(page.getByText("João Silva")).toBeVisible();

      // Remove the member (click trash icon)
      await page.getByRole("button", { name: "" }).first().click(); // Trash button has no accessible name
      // Form should reappear since no members
      await expect(page.getByLabel("Nome")).toBeVisible();
    });

    test("should have 'Continuar' disabled with no team members", async ({ page }) => {
      // Clear any pre-filled data and check - this depends on implementation
      await expect(page.getByRole("button", { name: "Continuar" })).toBeDisabled();
    });

    test("should enable 'Continuar' after adding team member", async ({ page }) => {
      await page.getByLabel("Nome").fill("João Silva");
      await page.getByRole("button", { name: "Adicionar" }).click();
      await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled();
    });

    test("should advance to step 4 with team member added", async ({ page }) => {
      await page.getByLabel("Nome").fill("João Silva");
      await page.getByRole("button", { name: "Adicionar" }).click();
      await page.getByRole("button", { name: "Continuar" }).click();
      await expect(
        page.getByText("Quais são seus custos fixos mensais?")
      ).toBeVisible();
    });
  });

  test.describe("Step 4: Costs", () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to step 4
      await page.getByText("Solo").click();
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByLabel("Nome do Escritório").fill("Studio");
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByLabel("Nome").fill("João");
      await page.getByRole("button", { name: "Adicionar" }).click();
      await page.getByRole("button", { name: "Continuar" }).click();
    });

    test("should display costs configuration step", async ({ page }) => {
      await expect(
        page.getByText("Quais são seus custos fixos mensais?")
      ).toBeVisible();
      await expect(
        page.getByText("Esses valores ajudam a calcular o custo/hora")
      ).toBeVisible();
    });

    test("should display all cost input fields", async ({ page }) => {
      await expect(page.getByLabel("Aluguel")).toBeVisible();
      await expect(page.getByLabel("Contas (água, luz, etc)")).toBeVisible();
      await expect(page.getByLabel("Software")).toBeVisible();
      await expect(page.getByLabel("Marketing")).toBeVisible();
      await expect(page.getByLabel("Contador")).toBeVisible();
      await expect(page.getByLabel("Internet")).toBeVisible();
      await expect(page.getByLabel("Outros")).toBeVisible();
    });

    test("should display total costs summary card", async ({ page }) => {
      await expect(page.getByText("Total de Custos Fixos")).toBeVisible();
      await expect(page.getByText("por mês")).toBeVisible();
    });

    test("should update total when entering cost values", async ({ page }) => {
      // Initial state shows R$ 0,00
      await expect(page.getByText("R$ 0,00")).toBeVisible();

      // Fill in rent value
      await page.getByLabel("Aluguel").fill("3000");
      // Total should update
      await expect(page.getByText("R$ 3.000,00")).toBeVisible();
    });

    test("should accept zero values and allow advancing", async ({ page }) => {
      // Costs can be zero, so continue should be enabled
      await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled();
    });

    test("should advance to step 5", async ({ page }) => {
      await page.getByRole("button", { name: "Continuar" }).click();
      await expect(
        page.getByText("Quais serviços você oferece?")
      ).toBeVisible();
    });
  });

  test.describe("Step 5: Services", () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to step 5
      await page.getByText("Solo").click();
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByLabel("Nome do Escritório").fill("Studio");
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByLabel("Nome").fill("João");
      await page.getByRole("button", { name: "Adicionar" }).click();
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByRole("button", { name: "Continuar" }).click();
    });

    test("should display services selection step", async ({ page }) => {
      await expect(page.getByText("Quais serviços você oferece?")).toBeVisible();
      await expect(
        page.getByText("Selecione todos que se aplicam ao seu escritório")
      ).toBeVisible();
    });

    test("should display all 4 service options", async ({ page }) => {
      await expect(page.getByText("DecorExpress")).toBeVisible();
      await expect(
        page.getByText("Consultoria de decoração expressa")
      ).toBeVisible();
      await expect(page.getByText("ProjetExpress")).toBeVisible();
      await expect(page.getByText("Projeto arquitetônico completo")).toBeVisible();
      await expect(page.getByText("Produção")).toBeVisible();
      await expect(page.getByText("Acompanhamento de obra")).toBeVisible();
      await expect(page.getByText("Consultoria")).toBeVisible();
      await expect(page.getByText("Consultoria pontual")).toBeVisible();
    });

    test("should have 'Continuar' disabled with no services selected", async ({ page }) => {
      await expect(page.getByRole("button", { name: "Continuar" })).toBeDisabled();
    });

    test("should allow selecting multiple services", async ({ page }) => {
      await page.getByText("DecorExpress").click();
      await page.getByText("Produção").click();
      await expect(page.getByText("2 serviço(s) selecionado(s)")).toBeVisible();
    });

    test("should toggle service selection", async ({ page }) => {
      // Select
      await page.getByText("DecorExpress").click();
      await expect(page.getByText("1 serviço(s) selecionado(s)")).toBeVisible();
      // Deselect
      await page.getByText("DecorExpress").click();
      // Count text should disappear when 0 selected
      await expect(
        page.getByText(/serviço\(s\) selecionado\(s\)/)
      ).not.toBeVisible();
    });

    test("should enable 'Continuar' after selecting at least one service", async ({ page }) => {
      await page.getByText("DecorExpress").click();
      await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled();
    });

    test("should advance to step 6", async ({ page }) => {
      await page.getByText("DecorExpress").click();
      await page.getByRole("button", { name: "Continuar" }).click();
      await expect(
        page.getByText("Qual sua margem de lucro desejada?")
      ).toBeVisible();
    });
  });

  test.describe("Step 6: Margin", () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to step 6
      await page.getByText("Solo").click();
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByLabel("Nome do Escritório").fill("Studio");
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByLabel("Nome").fill("João");
      await page.getByRole("button", { name: "Adicionar" }).click();
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByText("DecorExpress").click();
      await page.getByRole("button", { name: "Continuar" }).click();
    });

    test("should display margin configuration step", async ({ page }) => {
      await expect(
        page.getByText("Qual sua margem de lucro desejada?")
      ).toBeVisible();
      await expect(
        page.getByText("Essa margem será aplicada sobre o custo")
      ).toBeVisible();
    });

    test("should display slider with range 10%-100%", async ({ page }) => {
      await expect(page.getByText("10%")).toBeVisible();
      await expect(page.getByText("100%")).toBeVisible();
    });

    test("should display quick selection buttons", async ({ page }) => {
      await expect(page.getByRole("button", { name: "20%" })).toBeVisible();
      await expect(page.getByRole("button", { name: "30%" })).toBeVisible();
      await expect(page.getByRole("button", { name: "40%" })).toBeVisible();
      await expect(page.getByRole("button", { name: "50%" })).toBeVisible();
    });

    test("should update margin when clicking quick select button", async ({ page }) => {
      await page.getByRole("button", { name: "50%" }).click();
      // Check that margin value is displayed
      await expect(page.locator("text=50%").first()).toBeVisible();
    });

    test("should display cost/hour preview", async ({ page }) => {
      await expect(page.getByText("Preview do seu custo/hora")).toBeVisible();
      await expect(page.getByText("Custo/hora")).toBeVisible();
    });

    test("should display recommendation text", async ({ page }) => {
      await expect(
        page.getByText("Valor recomendado: 30% para manter competitividade")
      ).toBeVisible();
    });

    test("should show 'Concluir' button instead of 'Continuar' on last step", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: "Concluir" })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Continuar" })
      ).not.toBeVisible();
    });

    test("should complete setup and redirect to /projetos when clicking 'Concluir'", async ({ page }) => {
      await page.getByRole("button", { name: "Concluir" }).click();
      // Should redirect to projetos after completing
      await expect(page).toHaveURL(/\/projetos/);
    });
  });
});

test.describe("Onboarding - Complete Flow", () => {
  // Skip - requires authentication
  test.skip(({ browserName }) => true, "Requires authentication setup");

  test("should complete entire wizard flow", async ({ page }) => {
    await page.goto("/welcome");

    // Welcome screen
    await page.getByRole("button", { name: "Começar Configuração" }).click();

    // Step 1: Size
    await page.getByText("Pequeno").click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 2: Name
    await page.getByLabel("Nome do Escritório").fill("Studio Arquitetura ABC");
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 3: Team
    await page.getByLabel("Nome").fill("Ana Arquiteta");
    await page.getByLabel("Salário (R$)").clear();
    await page.getByLabel("Salário (R$)").fill("8000");
    await page.getByRole("button", { name: "Adicionar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 4: Costs
    await page.getByLabel("Aluguel").fill("3500");
    await page.getByLabel("Internet").fill("200");
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 5: Services
    await page.getByText("DecorExpress").click();
    await page.getByText("ProjetExpress").click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 6: Margin
    await page.getByRole("button", { name: "40%" }).click();
    await page.getByRole("button", { name: "Concluir" }).click();

    // Should redirect to projetos
    await expect(page).toHaveURL(/\/projetos/);
  });

  test("should persist data when navigating back and forth", async ({ page }) => {
    await page.goto("/setup");

    // Step 1: Select size
    await page.getByText("Médio").click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 2: Enter name
    await page.getByLabel("Nome do Escritório").fill("Arquitetos Associados");
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 3: Add member
    await page.getByLabel("Nome").fill("Carlos Designer");
    await page.getByRole("button", { name: "Adicionar" }).click();

    // Go back to step 2
    await page.getByRole("button", { name: "Voltar" }).click();
    // Name should still be filled
    await expect(page.getByLabel("Nome do Escritório")).toHaveValue(
      "Arquitetos Associados"
    );

    // Go back to step 1
    await page.getByRole("button", { name: "Voltar" }).click();
    // Size selection should be preserved (check by presence of selected state)
    // This is harder to test without specific class checks

    // Go forward again
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    // Team member should still be there
    await expect(page.getByText("Carlos Designer")).toBeVisible();
  });
});

test.describe("Onboarding - Already Completed Redirect", () => {
  // Skip - requires authentication with completed setup
  test.skip(({ browserName }) => true, "Requires authentication setup with completed onboarding");

  test("should redirect user with completed setup from /welcome to /projetos", async ({ page }) => {
    // TODO: Set up authentication with user who has completed setup
    await page.goto("/welcome");
    await expect(page).toHaveURL(/\/projetos/);
  });

  test("should redirect user with completed setup from /setup to /projetos", async ({ page }) => {
    // TODO: Set up authentication with user who has completed setup
    await page.goto("/setup");
    await expect(page).toHaveURL(/\/projetos/);
  });
});

test.describe("Onboarding - Loading States", () => {
  // Skip - requires authentication
  test.skip(({ browserName }) => true, "Requires authentication setup");

  test("should show skeleton while loading wizard state", async ({ page }) => {
    // Slow down network to see skeleton
    await page.route("**/api/onboarding/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto("/setup");

    // Should show skeleton elements
    await expect(page.locator(".animate-pulse").first()).toBeVisible();
  });

  test("should show loading state when completing setup", async ({ page }) => {
    // Navigate to last step
    await page.goto("/setup");
    await page.getByText("Solo").click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByLabel("Nome do Escritório").fill("Studio");
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByLabel("Nome").fill("João");
    await page.getByRole("button", { name: "Adicionar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByText("DecorExpress").click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Click complete and check for loading state
    await page.getByRole("button", { name: "Concluir" }).click();
    // Button should show loading state
    await expect(page.getByText("Salvando...")).toBeVisible();
  });
});

test.describe("Onboarding - Progress Indicator", () => {
  // Skip - requires authentication
  test.skip(({ browserName }) => true, "Requires authentication setup");

  test("should display progress indicator on setup page", async ({ page }) => {
    await page.goto("/setup");
    // Progress indicator shows current step - look for step indicator text/elements
    await expect(page.getByText("Etapa 1 de 6")).toBeVisible();
  });

  test("should update progress indicator as steps advance", async ({ page }) => {
    await page.goto("/setup");

    // Step 1
    await expect(page.getByText("Etapa 1 de 6")).toBeVisible();
    await page.getByText("Solo").click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 2
    await expect(page.getByText("Etapa 2 de 6")).toBeVisible();
    await page.getByLabel("Nome do Escritório").fill("Studio");
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 3
    await expect(page.getByText("Etapa 3 de 6")).toBeVisible();
  });
});
