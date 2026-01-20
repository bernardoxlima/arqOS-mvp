import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuthContext } from "../context";

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock("@/shared/lib/supabase/client", () => ({
  createClient: () => mockSupabaseClient,
}));

// Test component to access context
function TestComponent({ onMount }: { onMount?: (ctx: ReturnType<typeof useAuthContext>) => void }) {
  const ctx = useAuthContext();

  if (onMount) {
    onMount(ctx);
  }

  return (
    <div>
      <span data-testid="loading">{ctx.isLoading.toString()}</span>
      <span data-testid="authenticated">{ctx.isAuthenticated.toString()}</span>
      <span data-testid="user">{ctx.user?.email || "no-user"}</span>
      <span data-testid="profile">{ctx.profile?.full_name || "no-profile"}</span>
      <button onClick={() => ctx.signIn("test@example.com", "password")}>Sign In</button>
      <button onClick={() => ctx.signUp("test@example.com", "password", "Test User")}>Sign Up</button>
      <button onClick={() => ctx.signOut()}>Sign Out</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });
  });

  it("should render children", async () => {
    render(
      <AuthProvider>
        <div data-testid="child">Child Component</div>
      </AuthProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("should start with loading state", async () => {
    // Keep getUser pending to test loading state
    mockSupabaseClient.auth.getUser.mockImplementation(() => new Promise(() => {}));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("true");
  });

  it("should set isAuthenticated to false when no user", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");
  });

  it("should set isAuthenticated to true when user exists", async () => {
    const mockUser = { id: "123", email: "test@example.com" };
    const mockProfile = { id: "456", user_id: "123", full_name: "Test User", email: "test@example.com" };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }),
      }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
    expect(screen.getByTestId("profile")).toHaveTextContent("Test User");
  });

  it("should call signInWithPassword on signIn", async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: "123", email: "test@example.com" } },
      error: null,
    });

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await user.click(screen.getByText("Sign In"));

    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
    });
  });

  it("should return error message on signIn failure", async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid credentials" },
    });

    let contextRef: ReturnType<typeof useAuthContext> | null = null;

    render(
      <AuthProvider>
        <TestComponent onMount={(ctx) => { contextRef = ctx; }} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    const result = await contextRef!.signIn("wrong@example.com", "wrongpassword");

    expect(result.error).toBe("Invalid credentials");
  });

  it("should call signUp with correct parameters", async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: "123", email: "test@example.com" } },
      error: null,
    });

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await user.click(screen.getByText("Sign Up"));

    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
      options: {
        data: {
          full_name: "Test User",
        },
      },
    });
  });

  it("should return error message on signUp failure", async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: "Email already registered" },
    });

    let contextRef: ReturnType<typeof useAuthContext> | null = null;

    render(
      <AuthProvider>
        <TestComponent onMount={(ctx) => { contextRef = ctx; }} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    const result = await contextRef!.signUp("existing@example.com", "password", "Test");

    expect(result.error).toBe("Email already registered");
  });

  it("should call signOut and clear state", async () => {
    const mockUser = { id: "123", email: "test@example.com" };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    await user.click(screen.getByText("Sign Out"));

    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    });
  });

  it("should throw error when useAuthContext is used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useAuthContext must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });
});
