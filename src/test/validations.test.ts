import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, bookSchema, messageSchema } from "@/lib/validations";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "secret1" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret1" });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain("email");
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "abc" });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain("password");
  });
});

describe("registerSchema", () => {
  const valid = {
    username: "bookworm_99",
    email: "bookworm@example.com",
    password: "Secure1pass",
    confirmPassword: "Secure1pass",
  };

  it("accepts valid registration data", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "Different1" });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain("confirmPassword");
  });

  it("rejects username with special chars", () => {
    const result = registerSchema.safeParse({ ...valid, username: "bad user!" });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain("username");
  });

  it("rejects password without uppercase", () => {
    const result = registerSchema.safeParse({ ...valid, password: "lowercase1", confirmPassword: "lowercase1" });
    expect(result.success).toBe(false);
  });
});

describe("bookSchema", () => {
  const valid = { title: "Dune", author: "Frank Herbert", condition: 4 };

  it("accepts valid book data", () => {
    expect(bookSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = bookSchema.safeParse({ ...valid, title: "" });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain("title");
  });

  it("rejects condition out of range", () => {
    expect(bookSchema.safeParse({ ...valid, condition: 6 }).success).toBe(false);
    expect(bookSchema.safeParse({ ...valid, condition: 0 }).success).toBe(false);
  });

  it("rejects invalid cover image URL", () => {
    const result = bookSchema.safeParse({ ...valid, coverImage: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("accepts empty string for optional coverImage", () => {
    expect(bookSchema.safeParse({ ...valid, coverImage: "" }).success).toBe(true);
  });
});

describe("messageSchema", () => {
  const valid = {
    recipientId: "550e8400-e29b-41d4-a716-446655440000",
    content: "Hello, is this book still available?",
  };

  it("accepts valid message", () => {
    expect(messageSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = messageSchema.safeParse({ ...valid, content: "" });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].path).toContain("content");
  });

  it("rejects invalid recipientId", () => {
    const result = messageSchema.safeParse({ ...valid, recipientId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });
});
