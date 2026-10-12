import {
  ROOT_ENTRY_ENTER_MS,
  ROOT_ENTRY_EXIT_MS,
  ROOT_ENTRY_PAUSE_MS,
} from "./rootEntry";

export type RootEntryPhase = "enter" | "hold" | "exit" | "done";

export type RootEntrySequenceOptions = {
  reducedMotion: boolean;
  onPhase: (phase: RootEntryPhase) => void;
  onExit: () => void;
};

export type RootEntrySequence = {
  cancel: () => void;
};

/**
 * Framework-free controller for the root entry splash: enter, hold for the
 * intentional pause, exit, then fire the exit callback exactly once.
 *
 * Reduced motion keeps the routing beat (enter → pause → exit callback) but
 * skips the decorative enter/exit waits, so no animated movement is ever
 * implied. Every timer is tracked, `cancel()` clears pending work, and a
 * one-shot guard keeps Strict Mode double-effects or repeated calls from
 * producing a second navigation.
 */
export const runRootEntrySequence = ({
  reducedMotion,
  onPhase,
  onExit,
}: RootEntrySequenceOptions): RootEntrySequence => {
  const enterMs = reducedMotion ? 0 : ROOT_ENTRY_ENTER_MS;
  const exitMs = reducedMotion ? 0 : ROOT_ENTRY_EXIT_MS;
  let cancelled = false;
  let exited = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clearTimer = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  const schedule = (delayMs: number, run: () => void) => {
    timer = setTimeout(() => {
      if (cancelled) {
        return;
      }
      run();
    }, delayMs);
  };

  const completeExit = () => {
    if (exited) {
      return;
    }
    exited = true;
    onPhase("done");
    onExit();
  };

  schedule(enterMs, () => {
    onPhase("hold");
    schedule(ROOT_ENTRY_PAUSE_MS, () => {
      if (reducedMotion) {
        completeExit();
        return;
      }
      onPhase("exit");
      schedule(exitMs, completeExit);
    });
  });

  return {
    cancel: () => {
      cancelled = true;
      clearTimer();
    },
  };
};
