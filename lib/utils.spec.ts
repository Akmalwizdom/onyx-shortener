import { describe, it, expect } from 'vitest'
import { cn, isValidUrl, formatNumber } from './utils'

describe('lib/utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('a', 'b')).toBe('a b')
    })
    it('should ignore falsey values', () => {
      expect(cn('a', false, null, undefined, 'b')).toBe('a b')
    })
  })

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://google.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('formatNumber', () => {
    it('should format thousands', () => {
      expect(formatNumber(1500)).toBe('1.5K')
    })
    it('should format millions', () => {
      expect(formatNumber(1500000)).toBe('1.5M')
    })
    it('should leave small numbers alone', () => {
      expect(formatNumber(500)).toBe('500')
    })
  })
})
