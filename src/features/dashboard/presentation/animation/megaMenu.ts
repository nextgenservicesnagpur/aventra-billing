import { gsap } from "gsap";

export type MegaMenuAnimationElements = {
  panel: HTMLElement;
  sections: HTMLElement[];
  items: HTMLElement[];
};

export const createMegaMenuTimeline = (
  elements: MegaMenuAnimationElements,
  reducedMotion: boolean,
  onCloseComplete?: () => void,
) => {
  const timeline = gsap.timeline({ onComplete: onCloseComplete });

  if (reducedMotion) {
    timeline.set(elements.panel, { autoAlpha: 1, y: 0 });
    timeline.set([...elements.sections, ...elements.items], { autoAlpha: 1, y: 0 });
    return timeline;
  }

  timeline
    .fromTo(
      elements.panel,
      { autoAlpha: 0, y: -10 },
      { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out" },
    )
    .fromTo(
      elements.sections,
      { autoAlpha: 0, y: -6 },
      { autoAlpha: 1, y: 0, duration: 0.16, stagger: 0.04, ease: "power2.out" },
      "-=0.1",
    )
    .fromTo(
      elements.items,
      { autoAlpha: 0, y: -4 },
      { autoAlpha: 1, y: 0, duration: 0.14, stagger: 0.015, ease: "power2.out" },
      "-=0.08",
    );

  return timeline;
};

export const createMegaMenuCloseTimeline = (
  elements: MegaMenuAnimationElements,
  reducedMotion: boolean,
  onComplete: () => void,
) => {
  const timeline = gsap.timeline({ onComplete });
  if (reducedMotion) {
    timeline.set(elements.panel, { autoAlpha: 0, y: 0 });
    return timeline;
  }

  return timeline
    .to(elements.items, {
      autoAlpha: 0,
      duration: 0.08,
      stagger: 0.01,
      ease: "power2.in",
    })
    .to(
      elements.sections,
      { autoAlpha: 0, duration: 0.1, stagger: 0.025, ease: "power2.in" },
      "-=0.05",
    )
    .to(
      elements.panel,
      { autoAlpha: 0, duration: 0.14, ease: "power2.in", y: -8 },
      "-=0.06",
    );
};
