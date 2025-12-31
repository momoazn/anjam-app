import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./badge";

describe("Badge", () => {
  it("should render with default variant", () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText("Default Badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("data-slot", "badge");
  });

  it("should render with secondary variant", () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);
    const badge = screen.getByText("Secondary Badge");
    expect(badge).toBeInTheDocument();
  });

  it("should render with destructive variant", () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);
    const badge = screen.getByText("Destructive Badge");
    expect(badge).toBeInTheDocument();
  });

  it("should render with outline variant", () => {
    render(<Badge variant="outline">Outline Badge</Badge>);
    const badge = screen.getByText("Outline Badge");
    expect(badge).toBeInTheDocument();
  });

  it("should accept custom className", () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);
    const badge = screen.getByText("Custom Badge");
    expect(badge).toHaveClass("custom-class");
  });

  it("should render as span by default", () => {
    const { container } = render(<Badge>Span Badge</Badge>);
    const badge = container.querySelector('span[data-slot="badge"]');
    expect(badge).toBeInTheDocument();
  });

  it("should render children content", () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>,
    );
    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
  });

  it("should pass through additional props", () => {
    render(<Badge data-testid="test-badge">Test Badge</Badge>);
    expect(screen.getByTestId("test-badge")).toBeInTheDocument();
  });
});
