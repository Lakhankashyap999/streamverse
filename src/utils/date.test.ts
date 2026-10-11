import { describe, expect, it } from 'vitest';
import { getDailyStreamTime, getNextDailyStreamTime, isFuture } from './date';

describe('date helpers', () => {
  it('getNextDailyStreamTime returns an ISO string in the future', () => {
    const nextTime = getNextDailyStreamTime();
    expect(typeof nextTime).toBe('string');
    expect(isFuture(nextTime)).toBe(true);
  });

  it('getDailyStreamTime(1) is scheduled after getDailyStreamTime(0)', () => {
    const todayStream = new Date(getDailyStreamTime(0)).getTime();
    const tomorrowStream = new Date(getDailyStreamTime(1)).getTime();
    expect(tomorrowStream).toBeGreaterThan(todayStream);
    // Approximately 24 hours apart
    const diffHours = (tomorrowStream - todayStream) / (1000 * 60 * 60);
    expect(Math.round(diffHours)).toBe(24);
  });
});
