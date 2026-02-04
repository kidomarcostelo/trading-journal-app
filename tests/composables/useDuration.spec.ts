import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDuration } from '../../composables/useDuration';

describe('useDuration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock "now" as 2026-02-05 12:00:00 UTC
    vi.setSystemTime(new Date('2026-02-05T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates duration for closed trade (ISO string)', () => {
    const { getDuration } = useDuration();
    const start = '2026-02-01T10:00:00Z';
    const end = '2026-02-03T14:30:00Z'; // 2 days, 4.5 hours
    
    // 2d 4h (rounded)
    expect(getDuration(start, end)).toBe('2d 4h');
  });

  it('calculates duration for open trade (using current time)', () => {
    const { getDuration } = useDuration();
    const start = '2026-02-04T12:00:00Z'; // 1 day ago
    
    expect(getDuration(start, undefined, 'Open')).toBe('1d 0h');
  });

  it('calculates duration for Excel serial dates', () => {
    const { getDuration } = useDuration();
    // 45985 = 2025-11-22 (approx)
    const start = 45985;
    const end = 45987; // 2 days later
    
    expect(getDuration(start, end)).toBe('2d 0h');
  });

  it('returns -- for invalid dates', () => {
    const { getDuration } = useDuration();
    expect(getDuration(undefined, undefined)).toBe('--');
    expect(getDuration('invalid', 'invalid')).toBe('--');
  });

  it('handles rounding correctly', () => {
    const { getDuration } = useDuration();
    const start = '2026-02-01T10:00:00Z';
    const end = '2026-02-01T10:59:00Z'; // 59 mins -> 0d 0h or 0d 1h? let's stick to simple floor/round logic
    
    // If logic is diff in hours:
    // 59mins is 0 hours. 
    expect(getDuration(start, end)).toBe('0d 0h');
  });
});