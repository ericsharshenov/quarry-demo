import { useCallback, useEffect, useRef, useState } from "react";
import { createStepAction, resetAction, useDemo } from "./demo";
import { nextStepType } from "./model";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function useCountUp(target: number | null, duration = 900): number | null {
  const [display, setDisplay] = useState<number | null>(target);
  const displayRef = useRef<number | null>(target);

  useEffect(() => {
    if (target == null) {
      displayRef.current = null;
      setDisplay(null);
      return;
    }
    const from = displayRef.current ?? 0;
    if (from === target) return;
    if (prefersReducedMotion()) {
      displayRef.current = target;
      setDisplay(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (target - from) * eased);
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}

export function usePulse(value: unknown, duration = 1400): boolean {
  const [active, setActive] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (value !== prev.current && value != null) {
      prev.current = value;
      setActive(true);
      const timer = window.setTimeout(() => setActive(false), duration);
      return () => window.clearTimeout(timer);
    }
    prev.current = value;
  }, [value, duration]);

  return active;
}

export function useAutoDemo(delay = 1800) {
  const { state, dispatch } = useDemo();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const type = nextStepType(state);
    if (!type) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(
      () => dispatch(createStepAction(type)),
      delay,
    );
    return () => window.clearTimeout(timer);
  }, [playing, state, dispatch, delay]);

  const toggle = useCallback(() => {
    setPlaying((current) => !current);
  }, []);

  const start = useCallback(() => {
    if (!nextStepType(state)) dispatch(resetAction());
    setPlaying(true);
  }, [dispatch, state]);

  const pause = useCallback(() => setPlaying(false), []);

  const reset = useCallback(() => {
    setPlaying(false);
    dispatch(resetAction());
  }, [dispatch]);

  return { playing, toggle, start, pause, reset };
}

export function useHotkeys() {
  const { state, dispatch } = useDemo();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (
        event.code === "ArrowRight" ||
        (event.code === "Space" && tag !== "BUTTON")
      ) {
        const type = nextStepType(state);
        if (type) {
          event.preventDefault();
          dispatch(createStepAction(type));
        }
        return;
      }

      if (event.key === "r" || event.key === "R" || event.key === "к" || event.key === "К") {
        event.preventDefault();
        dispatch(resetAction());
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state, dispatch]);
}
