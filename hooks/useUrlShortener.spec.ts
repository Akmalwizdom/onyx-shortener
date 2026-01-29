import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import useUrlShortener from './useUrlShortener'

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: () => ({ address: '0x123' }),
}))

// Mock storage util
vi.mock('@/utils/storage', () => ({
  saveLinkToHistory: vi.fn(),
}))

describe('useUrlShortener', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('should initialize with IDLE state and null quota', () => {
    const { result } = renderHook(() => useUrlShortener())
    expect(result.current.state).toBe('IDLE')
    expect(result.current.shortUrl).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.quota).toBeNull()
  })

  it('should handle successful submission and update quota', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: '1',
        shortCode: 'abc1234',
        shortUrl: 'http://localhost:3000/r/abc1234',
        originalUrl: 'https://example.com',
        createdAt: new Date().toISOString(),
        quota: { remaining: 4, limit: 5 }
      },
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const { result } = renderHook(() => useUrlShortener())

    await act(async () => {
      await result.current.submit('https://example.com')
    })

    expect(result.current.state).toBe('SUCCESS')
    expect(result.current.shortUrl?.shortCode).toBe('abc1234')
    expect(result.current.quota).toEqual({ remaining: 4, limit: 5 })
    expect(result.current.error).toBeNull()
  })

  it('should handle rate limit error and update quota', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        error: 'Rate limit exceeded',
        remaining: 0,
        limit: 5,
        reset: Date.now() + 60000
      }),
    } as Response)

    const { result } = renderHook(() => useUrlShortener())

    await act(async () => {
      await result.current.submit('https://example.com').catch(() => { })
    })

    expect(result.current.state).toBe('ERROR')
    expect(result.current.errorCode).toBe(429)
    expect(result.current.quota).toEqual({ remaining: 0, limit: 5 })
    expect(result.current.resetTime).toBeDefined()
  })

  it('should retry last submission', async () => {
    const { result } = renderHook(() => useUrlShortener())

    // First attempt fails
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Fail' }),
    } as Response)

    await act(async () => {
      await result.current.submit('https://example.com').catch(() => { })
    })

    expect(result.current.state).toBe('ERROR')

    // Second attempt succeeds
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          shortCode: 'retry123',
          createdAt: new Date().toISOString(),
          quota: { remaining: 4, limit: 5 }
        },
      }),
    } as Response)

    await act(async () => {
      await result.current.retry()
    })

    expect(result.current.state).toBe('SUCCESS')
    expect(result.current.shortUrl?.shortCode).toBe('retry123')
    expect(result.current.quota).toEqual({ remaining: 4, limit: 5 })
  })
})
