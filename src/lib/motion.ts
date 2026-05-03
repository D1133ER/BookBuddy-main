import type { Variants } from 'framer-motion';

export const motionEase = [0.22, 1, 0.36, 1] as const;
export const motionExitEase = [0.4, 0, 1, 1] as const;

export const createPageVariants = (reducedMotion: boolean): Variants => ({
  initial: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 },
  animate: reducedMotion
    ? {
        opacity: 1,
        transition: { duration: 0.22, ease: motionEase },
      }
    : {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: motionEase },
      },
  exit: reducedMotion
    ? {
        opacity: 0,
        transition: { duration: 0.18, ease: motionExitEase },
      }
    : {
        opacity: 0,
        y: -12,
        transition: { duration: 0.32, ease: motionExitEase },
      },
});

export const createStaggerContainer = (
  reducedMotion: boolean,
  staggerChildren = 0.08,
  delayChildren = 0,
): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: reducedMotion
      ? { duration: 0.18, ease: motionEase }
      : {
          duration: 0.35,
          ease: motionEase,
          staggerChildren,
          delayChildren,
        },
  },
});

export const createFadeUpItem = (reducedMotion: boolean, distance = 22): Variants => ({
  hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: distance },
  show: reducedMotion
    ? {
        opacity: 1,
        transition: { duration: 0.2, ease: motionEase },
      }
    : {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: motionEase },
      },
});

export const createScaleInItem = (reducedMotion: boolean): Variants => ({
  hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 },
  show: reducedMotion
    ? {
        opacity: 1,
        transition: { duration: 0.2, ease: motionEase },
      }
    : {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.35, ease: motionEase },
      },
});

export const createHoverLift = (reducedMotion: boolean, y = -8) =>
  reducedMotion
    ? undefined
    : {
        y,
        transition: { duration: 0.24, ease: motionEase },
      };

export const pressScale = { scale: 0.98 };
