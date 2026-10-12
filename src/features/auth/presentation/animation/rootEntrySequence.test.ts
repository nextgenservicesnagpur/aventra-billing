import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { brandEntranceTransition } from "./authIntro";
import {
  ROOT_ENTRY_ENTER_MS,
  ROOT_ENTRY_EXIT_MS,
  ROOT_ENTRY_PAUSE_MS,
  rootEntryExitTransition,
} from "./rootEntry";
import {
  runRootEntrySequence,
  type RootEntryPhase,
} from "./rootEntrySequence";
import { brandingExitTransition } from "./welcomeTransition";

const startSequence = (reducedMotion: boolean) => {
  const phases: RootEntryPhase[] = [];
  const onExit = vi.fn();
  const sequence = runRootEntrySequence({
    reducedMotion,
    onPhase: (phase) => {
      phases.push(phase);
    },
    onExit,
  });
  return { phases, onExit, sequence };
};

describe("root entry sequence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits for the entrance, holds the full pause, then exits and navigates once", () => {
    const { phases, onExit, sequence } = startSequence(false);

    vi.advanceTimersByTime(ROOT_ENTRY_ENTER_MS);
    expect(phases).toEqual(["hold"]);
    expect(onExit).not.toHaveBeenCalled();

    vi.advanceTimersByTime(ROOT_ENTRY_PAUSE_MS - 1);
    expect(phases).toEqual(["hold"]);

    vi.advanceTimersByTime(1);
    expect(phases).toEqual(["hold", "exit"]);
    expect(onExit).not.toHaveBeenCalled();

    vi.advanceTimersByTime(ROOT_ENTRY_EXIT_MS);
    expect(phases).toEqual(["hold", "exit", "done"]);
    expect(onExit).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(60_000);
    expect(onExit).toHaveBeenCalledTimes(1);

    sequence.cancel();
    vi.advanceTimersByTime(60_000);
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("cancels every pending timer without navigating", () => {
    const { phases, onExit, sequence } = startSequence(false);

    vi.advanceTimersByTime(ROOT_ENTRY_ENTER_MS);
    expect(phases).toEqual(["hold"]);

    sequence.cancel();
    vi.advanceTimersByTime(60_000);

    expect(phases).toEqual(["hold"]);
    expect(onExit).not.toHaveBeenCalled();
  });

  it("keeps the routing beat while skipping decorative waits under reduced motion", () => {
    const { phases, onExit } = startSequence(true);

    vi.advanceTimersByTime(0);
    expect(phases).toEqual(["hold"]);

    vi.advanceTimersByTime(ROOT_ENTRY_PAUSE_MS);
    expect(phases).toEqual(["hold", "done"]);
    expect(phases).not.toContain("exit");
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("stays locked to the shared animation tokens", () => {
    expect(ROOT_ENTRY_PAUSE_MS).toBe(2000);
    expect(ROOT_ENTRY_ENTER_MS / 1000).toBe(brandEntranceTransition.duration);
    expect(ROOT_ENTRY_EXIT_MS / 1000).toBe(brandingExitTransition.duration);
    expect(rootEntryExitTransition).toBe(brandingExitTransition);
  });
});
