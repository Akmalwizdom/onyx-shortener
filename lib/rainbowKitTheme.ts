'use client';

import { darkTheme, Theme } from '@rainbow-me/rainbowkit';

/**
 * Xyno Cyber-Industrial Theme for RainbowKit
 * Based on the project's globals.css tokens
 */
export const onyxRainbowTheme: Theme = darkTheme({
  accentColor: '#33E1FF', // --primary
  accentColorForeground: '#000000',
  borderRadius: 'none', // Sharp corners for industrial look
  fontStack: 'system', // We'll override with Space Mono via CSS
  overlayBlur: 'large',
});

// Deep customization of the theme object
onyxRainbowTheme.colors.modalBackground = '#000000';
onyxRainbowTheme.colors.modalBorder = 'rgba(51, 225, 255, 0.2)'; // --glass-border
onyxRainbowTheme.colors.profileForeground = '#000000';
onyxRainbowTheme.colors.closeButton = '#33E1FF';
onyxRainbowTheme.colors.closeButtonBackground = 'rgba(51, 225, 255, 0.1)';
onyxRainbowTheme.colors.menuItemBackground = 'rgba(51, 225, 255, 0.05)';
onyxRainbowTheme.colors.modalText = '#ffffff';
onyxRainbowTheme.colors.modalTextSecondary = 'rgba(255, 255, 255, 0.5)';
// Removed invalid keys: actionButtonBorder, actionButtonBackground

// Custom CSS to be added to globals.css will handle the specific clip-paths and fonts
