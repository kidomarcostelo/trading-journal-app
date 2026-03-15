import { describe, it, expect } from 'vitest'
import type { Trade } from '~/types'

// Define the functions to be tested before implementation.
import { calculateRiskOfRuin, generateEquityCurve } from '~/server/api/analytics/risk.get'

describe('Analytics Risk Logic', () => {
  describe('calculateRiskOfRuin', () => {
    it('should calculate 0 risk when win rate is 100%', () => {
      expect(calculateRiskOfRuin(1.0, 0.02, 2.0)).toBeCloseTo(0)
    })

    it('should calculate risk of ruin correctly for 50% win rate and negative edge', () => {
      // W = 0.5, Risk = 0.02, Edge = -0.5 => ((1 - 0.5) / (1 + 0.5)) ^ (0.02 / -0.5)
      // (0.5 / 1.5) ^ -0.04 = (1/3) ^ -0.04 = 3 ^ 0.04 = 1.0449
      // Capped at 1 (100%)
      expect(calculateRiskOfRuin(0.5, 0.02, -0.5)).toBe(1)
    })

    it('should handle edge cases', () => {
       // if edge is 0, what happens? we should handle division by zero.
       expect(calculateRiskOfRuin(0.5, 0.02, 0)).toBe(1) // undefined mathematical risk of ruin or 100%
       expect(calculateRiskOfRuin(0, 0.02, -1)).toBe(1) // 100% risk if win rate 0
    })
  })

  describe('generateEquityCurve', () => {
    it('should return empty array if no trades and no initial balance', () => {
      expect(generateEquityCurve([], 1000)).toEqual([{ date: 'Initial', equity: 1000 }])
    })

    it('should accumulate equity based on trade pnl, sorting by date', () => {
      const trades: Trade[] = [
        { id: '2', createdAt: '2023-01-02', date: '2023-01-02', pnl: -100, status: 'Closed' },
        { id: '1', createdAt: '2023-01-01', date: '2023-01-01', pnl: 200, status: 'Closed' },
        { id: '3', createdAt: '2023-01-03', date: '2023-01-03', pnl: 50, status: 'Open' }, // Open trades shouldn't affect equity normally unless mark to market
      ]
      
      const curve = generateEquityCurve(trades, 1000)
      
      expect(curve).toEqual([
        { date: 'Initial', equity: 1000 },
        { date: '2023-01-01', equity: 1200 },
        { date: '2023-01-02', equity: 1100 }
      ])
    })
  })
})
