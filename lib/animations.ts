/**
 * Framer Motion animation variants for ONYX-CYBER-INDUSTRIAL design system
 */

import { Variants } from 'framer-motion';

// Staggered entrance animations
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

export const fadeInUp: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.3 },
    },
};

// Scale/zoom animations
export const scaleIn: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

// Morph transition for URL input → result
export const morphTransition: Variants = {
    input: {
        scale: 1,
        opacity: 1,
    },
    loading: {
        scale: 0.98,
        opacity: 0.8,
        transition: { duration: 0.2 },
    },
    result: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

// Pulse glow animation
export const pulseGlow: Variants = {
    initial: {
        boxShadow: '0 0 8px rgba(167, 255, 210, 0.4)',
    },
    animate: {
        boxShadow: [
            '0 0 8px rgba(167, 255, 210, 0.4)',
            '0 0 16px rgba(167, 255, 210, 0.6)',
            '0 0 8px rgba(167, 255, 210, 0.4)',
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

// Error shake animation
export const errorShake: Variants = {
    initial: { x: 0 },
    shake: {
        x: [-8, 8, -6, 6, -4, 4, 0],
        transition: { duration: 0.5 },
    },
};

// Loading progress animation
export const progressBar: Variants = {
    initial: { scaleX: 0, originX: 0 },
    animate: (progress: number) => ({
        scaleX: progress,
        transition: { duration: 0.3, ease: 'easeOut' },
    }),
};

// Button shine effect
export const buttonShine: Variants = {
    initial: { x: '-100%' },
    hover: {
        x: '100%',
        transition: { duration: 0.7, ease: 'linear' },
    },
};

// Slide in from bottom (for FAB and bottom sheets)
export const slideInFromBottom: Variants = {
    hidden: {
        y: 100,
        opacity: 0,
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

// List item stagger
export const listItemVariant: Variants = {
    hidden: {
        opacity: 0,
        x: -20,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
};
