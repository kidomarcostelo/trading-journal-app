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
    calculateMaxConsecutiveLosses,
    filterTradesByTimeframe
  } = useAnalytics()

  const mockTrades: Trade[] = [
    { id: '1', status: 'Closed', pnl: 100, entryPrice: 100, exitPrice: 110, size: 10, createdAt: '2024-01-01T00:00:00.000Z', 'Exit Date': '2024-01-02T00:00:00.000Z', duration: '1d', Risk: 50 }, // 1d = 86400000ms
    { id: '2', status: 'Closed', pnl: -50, entryPrice: 100, exitPrice: 95, size: 10, createdAt: '2024-01-01T00:00:00.000Z', 'Exit Date': '2024-01-02T00:00:00.000Z', duration: '1d', Risk: 50 }, // 1d = 86400000ms
    { id: '3', status: 'Closed', pnl: 200, entryPrice: 100, exitPrice: 120, size: 10, createdAt: '2024-01-01T00:00:00.000Z', 'Exit Date': '2024-01-03T00:00:00.000Z', duration: '2d', Risk: 50 }, // 2d = 172800000ms
    { id: '4', status: 'Open', pnl: 0, createdAt: '2024-01-01T00:00:00.000Z', 'Exit Date': '', duration: '', Risk: 50 }, // Open
    { id: '5', status: 'Closed', pnl: -100, entryPrice: 100, exitPrice: 90, size: 10, createdAt: '2024-01-01T00:00:00.000Z', 'Exit Date': '2024-01-04T00:00:00.000Z', duration: '3d', Risk: 50 }, // 3d = 259200000ms
  ]

  it('calculates Profit Factor correctly', () => {
    expect(calculateProfitFactor(mockTrades)).toBe(2.0)
  })

  it('calculates Win Rate correctly', () => {
    expect(calculateWinRate(mockTrades)).toBe(50)
  })

  it('calculates Expectancy correctly', () => {
    expect(calculateExpectancy(mockTrades)).toBe(37.5)
  })

  it('calculates Average R-Multiple correctly', () => {
    expect(calculateAverageRMultiple(mockTrades)).toBe(0.75)
  })

  it('calculates Average Holding Time correctly', () => {
    // Wins: Trade 1 (1d), Trade 3 (2d) -> Avg 1.5d = 129600000ms
    // Losses: Trade 2 (1d), Trade 5 (3d) -> Avg 2d = 172800000ms
    const result = calculateAverageHoldingTime(mockTrades)
    expect(result.wins).toBe(129600000)
    expect(result.losses).toBe(172800000)
  })

  it('calculates Max Consecutive Losses correctly', () => {
    expect(calculateMaxConsecutiveLosses(mockTrades)).toBe(1)

    const streakTrades: Trade[] = [
      { id: '1', status: 'Closed', pnl: -100, createdAt: '2024-01-01', 'Exit Date': '2024-01-02' },
      { id: '2', status: 'Closed', pnl: -50, createdAt: '2024-01-02', 'Exit Date': '2024-01-03' },
      { id: '3', status: 'Closed', pnl: 100, createdAt: '2024-01-03', 'Exit Date': '2024-01-04' },
      { id: '4', status: 'Closed', pnl: -20, createdAt: '2024-01-04', 'Exit Date': '2024-01-05' },
      { id: '5', status: 'Closed', pnl: -10, createdAt: '2024-01-05', 'Exit Date': '2024-01-06' },
      { id: '6', status: 'Closed', pnl: -30, createdAt: '2024-01-06', 'Exit Date': '2024-01-07' },
    ]
    expect(calculateMaxConsecutiveLosses(streakTrades)).toBe(3)
  })

  it('calculates Max Drawdown correctly', () => {
    const equityCurve = [
      { date: 'Initial', equity: 1000 },
      { date: '1', equity: 1100 },
      { date: '2', equity: 1050 },
      { date: '3', equity: 1250 },
      { date: '4', equity: 1150 },
    ]
    expect(calculateMaxDrawdown(equityCurve)).toBe(8)
  })
  it('filters trades by timeframe', () => {
    const timeTrades: Trade[] = [
      { id: '1', status: 'Closed', pnl: 100, createdAt: '2024-01-01', date: '2024-01-01' },
      { id: '2', status: 'Closed', pnl: 100, createdAt: '2024-02-01', date: '2024-02-01' },
      { id: '3', status: 'Closed', pnl: 100, createdAt: '2024-03-01', date: '2024-03-01' },
    ]

    // All Time
    expect(filterTradesByTimeframe(timeTrades, 'All Time').length).toBe(3)

    // Specific Range (Feb only)
    const range = { start: new Date('2024-02-01'), end: new Date('2024-02-28') }
    const filtered = filterTradesByTimeframe(timeTrades, range)
    expect(filtered.length).toBe(1)
    expect(filtered[0].id).toBe('2')
    
    // Start only
    const startOnly = { start: new Date('2024-02-15'), end: null }
    expect(filterTradesByTimeframe(timeTrades, startOnly).length).toBe(1)
  })
})
