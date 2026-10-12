import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Mock next/navigation and motion/react for node testing environment
const prefetchMock = vi.fn();
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    prefetch: prefetchMock,
  }),
}));

vi.mock("@/shared/animation/useReducedMotionPreference", () => ({
  useReducedMotionPreference: () => false,
}));

import NotFound from "@/app/not-found";
import { NotFoundGraphic } from "./NotFoundGraphic";
import { NotFoundView } from "./NotFoundView";

describe("404 Not Found presentation components", () => {
  it("renders NotFoundGraphic as an accessible SVG with correct viewBox and role", () => {
    const graphic = NotFoundGraphic({ className: "test-graphic" });

    expect(graphic.type).toBe("svg");
    expect(graphic.props.role).toBe("img");
    expect(graphic.props["aria-label"]).toBe(
      "404 numeral illustration in bronze metallic finish",
    );
    expect(graphic.props.viewBox).toBe("0 0 900 360");
    expect(graphic.props.className).toContain("test-graphic");
  });

  it("renders NotFoundView markup with semantic main, heading, and action", () => {
    const markup = renderToStaticMarkup(React.createElement(NotFoundView));

    expect(markup).toContain("<main");
    expect(markup).toContain("Page");
    expect(markup).toContain("not found");
    expect(markup).toContain("The page you’re looking for doesn’t exist or has been moved.");
    expect(markup).toContain("Go to dashboard");
  });

  it("delegates the root not-found route component to NotFoundView", () => {
    const page = NotFound();

    expect(page.type).toBe(NotFoundView);
  });
});

