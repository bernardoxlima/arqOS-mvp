import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "../schemas";

describe("loginSchema", () => {
  it("should validate correct login data", () => {
    const validData = {
      email: "test@example.com",
      password: "123456",
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty email", () => {
    const invalidData = {
      email: "",
      password: "123456",
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email é obrigatório");
    }
  });

  it("should reject invalid email format", () => {
    const invalidData = {
      email: "invalid-email",
      password: "123456",
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email inválido");
    }
  });

  it("should reject empty password", () => {
    const invalidData = {
      email: "test@example.com",
      password: "",
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Senha é obrigatória");
    }
  });

  it("should reject password shorter than 6 characters", () => {
    const invalidData = {
      email: "test@example.com",
      password: "12345",
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Senha deve ter no mínimo 6 caracteres");
    }
  });
});

describe("registerSchema", () => {
  it("should validate correct register data", () => {
    const validData = {
      fullName: "John Doe",
      email: "john@example.com",
      password: "123456",
      confirmPassword: "123456",
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty fullName", () => {
    const invalidData = {
      fullName: "",
      email: "john@example.com",
      password: "123456",
      confirmPassword: "123456",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Nome é obrigatório");
    }
  });

  it("should reject fullName shorter than 2 characters", () => {
    const invalidData = {
      fullName: "J",
      email: "john@example.com",
      password: "123456",
      confirmPassword: "123456",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Nome deve ter no mínimo 2 caracteres");
    }
  });

  it("should reject empty email", () => {
    const invalidData = {
      fullName: "John Doe",
      email: "",
      password: "123456",
      confirmPassword: "123456",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email é obrigatório");
    }
  });

  it("should reject invalid email format", () => {
    const invalidData = {
      fullName: "John Doe",
      email: "invalid-email",
      password: "123456",
      confirmPassword: "123456",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email inválido");
    }
  });

  it("should reject empty password", () => {
    const invalidData = {
      fullName: "John Doe",
      email: "john@example.com",
      password: "",
      confirmPassword: "",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Senha é obrigatória");
    }
  });

  it("should reject password shorter than 6 characters", () => {
    const invalidData = {
      fullName: "John Doe",
      email: "john@example.com",
      password: "12345",
      confirmPassword: "12345",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Senha deve ter no mínimo 6 caracteres");
    }
  });

  it("should reject empty confirmPassword", () => {
    const invalidData = {
      fullName: "John Doe",
      email: "john@example.com",
      password: "123456",
      confirmPassword: "",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Confirmação de senha é obrigatória");
    }
  });

  it("should reject mismatched passwords", () => {
    const invalidData = {
      fullName: "John Doe",
      email: "john@example.com",
      password: "123456",
      confirmPassword: "654321",
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Senhas não conferem");
    }
  });
});
