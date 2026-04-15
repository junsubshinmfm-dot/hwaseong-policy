'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ZoomAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
}

export default function ZoomAnimation({ isActive, onComplete }: ZoomAnimationProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isActive && (
        <motion.div
          key="zoom-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 bg-[#0a0a1a] z-50 pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}
