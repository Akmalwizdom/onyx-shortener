import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock generic Next.js features that often break in Jest/Vitest
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}))

// Mock matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Mock heavy libraries globally to save memory
vi.mock('googleapis', () => ({
  google: {
    safebrowsing: () => ({
      threatMatches: {
        find: vi.fn().mockResolvedValue({}),
      },
    }),
  },
}))