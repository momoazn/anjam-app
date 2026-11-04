import { describe, expect, it } from "vitest";

import { loginPathFor, safeReturnTo } from "./return-to";

describe("safeReturnTo", () => {
  it("accepts relative paths", () => {
    expect(safeReturnTo("/invite/abc?x=1")).toBe("/invite/abc?x=1");
  });
  it("rejects external, protocol-relative and empty values", () => {
    expect(safeReturnTo("https://evil.com")).toBeNull();
    expect(safeReturnTo("//evil.com")).toBeNull();
    expect(safeReturnTo("/\\evil.com")).toBeNull();
    expect(safeReturnTo("")).toBeNull();
    expect(safeReturnTo(null)).toBeNull();
    expect(safeReturnTo("/login")).toBeNull();
  });
});

describe("loginPathFor", () => {
  it("encodes the return path", () => {
    expect(loginPathFor("/invite/a b")).toBe(
      "/login?returnTo=%2Finvite%2Fa%20b",
    );
  });
  it("falls back to plain /login", () => {
    expect(loginPathFor("//x")).toBe("/login");
  });
});
