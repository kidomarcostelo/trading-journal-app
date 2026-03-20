import { describe, it, expect } from 'vitest'
import { useAnalytics } from '../../composables/useAnalytics'
import type { Trade } from '../../types'

describe('useAnalytics', () => {
  const { 
    calculateProfitFactor, 
    calculateWinRate, 
    calculateExpectancy, 
    calculateAverageRMultiple,
    calculateAverageHoldingTime,
    calculateMaxDrawdown,
    calculateMaxConsecutiveLosses
  } = useAnalytics()

  const mockTrades: Trade[] = [
    { id: '1', status: 'Closed', pnl: 100, entryPrice: 100, exitPrice: 110, size: 10, createdAt: '1704067200000', 'Exit Date': '1704153600000', duration: '1d', Risk: 50 }, // 2R
    { id: '2', status: 'Closed', pnl: -50, entryPrice: 100, exitPrice: 95, size: 10, createdAt: '1704067200000', 'Exit Date': '1704153600000', duration: '1d', Risk: 50 }, // -1R
    { id: '3', status: 'Closed', pnl: 200, entryPrice: 100, exitPrice: 120, size: 10, createdAt: '1704067200000', 'Exit Date': '1704240000000', duration: '2d', Risk: 50 }, // 4R
    { id: '4', status: 'Open', pnl: 0, createdAt: '1704067200000', 'Exit Date': '', duration: '', Risk: 50 }, // Open
    { id: '5', status: 'Closed', pnl: -100, entryPrice: 100, exitPrice: 90, size: 10, createdAt: '1704067200000', 'Exit Date': '1704326400000', duration: '3d', Risk: 50 }, // -2R
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
    // Trade 1: 100 / 50 = 2R
    // Trade 2: -50 / 50 = -1R
    // Trade 3: 200 / 50 = 4R
    // Trade 5: -100 / 50 = -2R
    // Total R: 2 - 1 + 4 - 2 = 3R
    // Avg R: 3 / 4 = 0.75
    expect(calculateAverageRMultiple(mockTrades)).toBe(0.75)
  })

  it('calculates Average Holding Time correctly', () => {
    // Wins: 1d (86400000ms), 2d (172800000ms) -> Avg 1.5d = 129600000ms
    // Losses: 1d (86400000ms), 3d (259200000ms) -> Avg 2d = 172800000ms
    const result = calculateAverageHoldingTime(mockTrades)
    expect(result.wins).toBe(129600000)
    expect(result.losses).toBe(172800000)
  })

  it('calculates Max Consecutive Losses correctly', () => {
    // Trades: W, L, W, Open, L
    // Max consecutive losses is 1
    expect(calculateMaxConsecutiveLosses(mockTrades)).toBe(1)

    const streakTrades: Trade[] = [
      { id: '1', status: 'Closed', pnl: -100, createdAt: '1', 'Exit Date': '2' },
      { id: '2', status: 'Closed', pnl: -50, createdAt: '2', 'Exit Date': '3' },
      { id: '3', status: 'Closed', pnl: 100, createdAt: '3', 'Exit Date': '4' },
      { id: '4', status: 'Closed', pnl: -20, createdAt: '4', 'Exit Date': '5' },
      { id: '5', status: 'Closed', pnl: -10, createdAt: '5', 'Exit Date': '6' },
      { id: '6', status: 'Closed', pnl: -30, createdAt: '6', 'Exit Date': '7' },
    ]
    expect(calculateMaxConsecutiveLosses(streakTrades)).toBe(3)
  })

  it('calculates Max Drawdown correctly', () => {
    // Equity: 1000, 1100, 1050, 1250, 1150
    // Peaks: 1000, 1100, 1100, 1250, 1250
    // DD: 0, 0, 50, 0, 100
    // MDD = 100 (at equity 1150 from peak 1250)
    const equityCurve = [
      { date: 'Initial', equity: 1000 },
      { date: '1', equity: 1100 },
      { date: '2', equity: 1050 },
      { date: '3', equity: 1250 },
      { date: '4', equity: 1150 },
    ]
    // 100 / 1250 = 0.08 = 8%
    expect(calculateMaxDrawdown(equityCurve)).toBe(8)
  })
})
