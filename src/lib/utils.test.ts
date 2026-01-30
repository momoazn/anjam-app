import { describe, expect, it } from "vitest";

import { cn, formatUserName, getUserInitials } from "./utils";

describe("cn", () => {
  it("should merge class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const condition = false;
    expect(cn("foo", condition && "bar", "baz")).toBe("foo baz");
  });

  it("should merge Tailwind classes without conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});

describe("getUserInitials", () => {
  it("should return initials from display name", () => {
    expect(getUserInitials("John Doe")).toBe("JD");
  });

  it("should return initials from display name in uppercase", () => {
    expect(getUserInitials("john doe")).toBe("JD");
  });

  it("should return first 2 chars of email when display name is not provided", () => {
    expect(getUserInitials(undefined, "johndoe@example.com")).toBe("JO");
  });

  it("should prioritize display name over email", () => {
    expect(getUserInitials("Jane Smith", "janedoe@example.com")).toBe("JS");
  });

  it('should return "?" when no data is provided', () => {
    expect(getUserInitials()).toBe("?");
  });

  it("should handle single character display name", () => {
    expect(getUserInitials("J")).toBe("J");
  });

  it("should handle email with single character local part", () => {
    expect(getUserInitials(undefined, "j@example.com")).toBe("J");
  });
});

describe("formatUserName", () => {
  it("should format display name", () => {
    expect(formatUserName("John Doe")).toBe("John Doe");
  });

  it("should fall back to email when display name is not provided", () => {
    expect(formatUserName(undefined, "johndoe@example.com")).toBe(
      "johndoe@example.com",
    );
  });

  it("should prioritize display name over email", () => {
    expect(formatUserName("John Doe", "johndoe@example.com")).toBe("John Doe");
  });

  it("should return empty string when nothing provided", () => {
    expect(formatUserName()).toBe("");
  });

  it("should trim whitespace from display name", () => {
    expect(formatUserName("  John Doe  ")).toBe("John Doe");
  });

  it("should handle empty string display name", () => {
    expect(formatUserName("", "johndoe@example.com")).toBe(
      "johndoe@example.com",
    );
  });

  it("should handle whitespace-only display name", () => {
    expect(formatUserName("   ", "johndoe@example.com")).toBe(
      "johndoe@example.com",
    );
  });
});
