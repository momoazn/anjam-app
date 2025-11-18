import { describe, it, expect } from "vitest";
import { cn, getUserInitials, formatUserName } from "./utils";

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
  it("should return initials from first and last name", () => {
    expect(getUserInitials("John", "Doe")).toBe("JD");
  });

  it("should return initials from first and last name in uppercase", () => {
    expect(getUserInitials("john", "doe")).toBe("JD");
  });

  it("should return first 2 chars of username when names are not provided", () => {
    expect(getUserInitials(undefined, undefined, "johndoe")).toBe("JO");
  });

  it("should prioritize names over username", () => {
    expect(getUserInitials("Jane", "Smith", "janedoe")).toBe("JS");
  });

  it('should return "?" when no data is provided', () => {
    expect(getUserInitials()).toBe("?");
  });

  it("should handle single character names", () => {
    expect(getUserInitials("J", "D")).toBe("JD");
  });

  it("should handle username with single character", () => {
    expect(getUserInitials(undefined, undefined, "j")).toBe("J");
  });
});

describe("formatUserName", () => {
  it("should format full name with username", () => {
    expect(formatUserName("John", "Doe", "johndoe")).toBe("John Doe - johndoe");
  });

  it("should format full name without username", () => {
    expect(formatUserName("John", "Doe")).toBe("John Doe");
  });

  it("should format first name only with username", () => {
    expect(formatUserName("John", undefined, "johndoe")).toBe("John - johndoe");
  });

  it("should format last name only with username", () => {
    expect(formatUserName(undefined, "Doe", "johndoe")).toBe("Doe - johndoe");
  });

  it("should return username when no names provided", () => {
    expect(formatUserName(undefined, undefined, "johndoe")).toBe("johndoe");
  });

  it("should return empty string when nothing provided", () => {
    expect(formatUserName()).toBe("");
  });

  it("should trim whitespace from names", () => {
    expect(formatUserName("  John  ", "  Doe  ", "johndoe")).toBe(
      "John Doe - johndoe",
    );
  });

  it("should handle empty string names", () => {
    expect(formatUserName("", "", "johndoe")).toBe("johndoe");
  });

  it("should handle whitespace-only names", () => {
    expect(formatUserName("   ", "   ", "johndoe")).toBe("johndoe");
  });
});
