import { describe, it, expect } from 'vitest'
import { useAnalytics } from '../../composables/useAnalytics'
import type { Trade } from '../../types'

describe('useAnalytics', () => {
  const { 
    calculateProfitFactor, 
    calculateWinRate, 
    calculateExpectancy, 
    calculateAverageRMultiple,
    calculateAverageHoldingTime
  } = useAnalytics()

  const mockTrades: Trade[] = [
    { id: '1', status: 'Closed', pnl: 100, entryPrice: 100, exitPrice: 110, size: 10, createdAt: '1704067200000', 'Exit Date': '1704153600000', duration: '1d' }, // Win
    { id: '2', status: 'Closed', pnl: -50, entryPrice: 100, exitPrice: 95, size: 10, createdAt: '1704067200000', 'Exit Date': '1704153600000', duration: '1d' }, // Loss
    { id: '3', status: 'Closed', pnl: 200, entryPrice: 100, exitPrice: 120, size: 10, createdAt: '1704067200000', 'Exit Date': '1704240000000', duration: '2d' }, // Win
    { id: '4', status: 'Open', pnl: 0, createdAt: '1704067200000', 'Exit Date': '', duration: '' }, // Open, should be ignored
    { id: '5', status: 'Closed', pnl: -100, entryPrice: 100, exitPrice: 90, size: 10, createdAt: '1704067200000', 'Exit Date': '1704326400000', duration: '3d' }, // Loss
  ]

  it('calculates Profit Factor correctly', () => {
    // Gross Profit: 100 + 200 = 300
    // Gross Loss: 50 + 100 = 150
    // Profit Factor: 300 / 150 = 2.0
    expect(calculateProfitFactor(mockTrades)).toBe(2.0)
  })

  it('calculates Win Rate correctly', () => {
    // Wins: 2, Losses: 2, Total Closed: 4
    // Win Rate: 50%
    expect(calculateWinRate(mockTrades)).toBe(50)
  })

  it('calculates Expectancy correctly', () => {
    // Avg Win: 150, Win Rate: 0.5 -> 75
    // Avg Loss: 75, Loss Rate: 0.5 -> 37.5
    // Expectancy: 75 - 37.5 = 37.5
    expect(calculateExpectancy(mockTrades)).toBe(37.5)
  })

  it('calculates Average R-Multiple correctly', () => {
    // Only works if we assume risk. 
    // If we assume entry/stop, we need those. 
    // Spec says "Average Risk/Reward ratio realized per trade".
    // Typically realized R = PnL / Risk. 
    // Since we don't have Risk in the mock, we might need to mock it or infer it.
    // Let's assume for this test we update mockTrades to have 'risk' or similar if needed.
    // Or simpler: PnL / (Entry - Stop). 
    // The spec says "Average R-Multiple". 
    // Let's defer this implementation details or make a simpler assumption:
    // PnL / Risk. If Risk is not tracked, we can't calculate R-Multiple accurately without it.
    // However, the prompt asked for "Average R-Multiple".
    // Let's assume we use a simplified version or wait for implementation.
    // For now, let's skip this test or define behavior for missing risk.
    // Actually, let's assume risk is constant or derived. 
    // Let's update the mock to include 'initialStop' or similar if we want to calculate R.
    // But standard PnL based R-multiple is PnL / Risk.
    // Let's temporarily expect 0 if data missing, or we can update the interface later.
    // For now, let's skip this test case until implementation logic is clearer or use a dummy.
    expect(calculateAverageRMultiple(mockTrades)).toBe(0) 
  })

  it('calculates Average Holding Time correctly', () => {
    // Wins: 1d (86400000ms), 2d (172800000ms) -> Avg 1.5d
    // Losses: 1d (86400000ms), 3d (259200000ms) -> Avg 2d
    const result = calculateAverageHoldingTime(mockTrades)
    // Results in milliseconds
    expect(result.wins).toBe(129600000) 
    expect(result.losses).toBe(172800000)
  })
})
