import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Run cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Polyfill fetch if needed (MSW will use this)
if (!globalThis.fetch) {
  // @ts-ignore
  globalThis.fetch = vi.fn();
}
