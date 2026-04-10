import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '~/server/api/analytics/risk.get'
import { H3Event } from 'h3'

// Mock h3
vi.mock('h3', async () => {
  const actual = await vi.importActual('h3')
  return {
    ...actual as any,
    getQuery: vi.fn(),
  }
})

// Mock global $fetch
global.$fetch = vi.fn()

describe('Analytics Risk API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should process trades and return risk metrics', async () => {
    const { getQuery } = await import('h3')
    ;(getQuery as any).mockReturnValue({ initialBalance: 1000, riskPerTrade: 0.02 })
    
    const mockTrades = [
      { id: '1', status: 'Closed', pnl: 100, date: '2023-01-01' },
      { id: '2', status: 'Closed', pnl: -50, date: '2023-01-02' },
    ]
    
    ;(global.$fetch as any).mockResolvedValue(mockTrades)

    const event = { context: {} } as H3Event
    const result = await handler(event)

    expect(global.$fetch).toHaveBeenCalledWith('/api/trades')
    expect(result).toHaveProperty('riskOfRuin')
    expect(result).toHaveProperty('equityCurve')
    expect(result.metrics.winRate).toBe(0.5)
    expect(result.equityCurve.length).toBe(3) // Initial + 2 trades
  })

  it('should use default values if query params are missing', async () => {
    const { getQuery } = await import('h3')
    ;(getQuery as any).mockReturnValue({})
    
    ;(global.$fetch as any).mockResolvedValue([])

    const event = { context: {} } as H3Event
    const result = await handler(event)

    expect(result.metrics.riskPerTrade).toBe(0.02)
  })
})
