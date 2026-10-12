import { describe, expect, it } from "vitest";
import {
  notFoundContainerVariants,
  notFoundEntranceTransition,
  notFoundInstantTransition,
} from "./notFoundMotion";

describe("404 Not Found animation definitions", () => {
  it("defines restrained container entrance variants", () => {
    expect(notFoundContainerVariants).toEqual({
      hidden: { opacity: 0, y: 16 },
      visible: { opacity: 1, y: 0 },
    });
  });

  it("configures smooth easing and duration for entrance transition", () => {
    expect(notFoundEntranceTransition).toEqual({
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    });
  });

  it("provides zero-duration instant transition for prefers-reduced-motion", () => {
    expect(notFoundInstantTransition).toEqual({
      duration: 0,
    });
  });
});
