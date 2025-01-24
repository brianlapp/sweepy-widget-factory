// Main widget entry point
import { initializeWidget } from './core';

// Export for IIFE build
export default initializeWidget;

// Make it available globally
(window as any).initializeWidget = initializeWidget;