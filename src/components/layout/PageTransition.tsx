import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { createPageVariants } from '@/lib/motion';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const variants = createPageVariants(shouldReduceMotion);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={`w-full h-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
