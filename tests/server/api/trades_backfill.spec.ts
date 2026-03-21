import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '~/server/api/trades/backfill.post'
import { H3Event } from 'h3'

// Mock dependencies
vi.mock('~/server/utils/googleSheets', () => ({
  getSheetsClient: vi.fn(),
}))

vi.mock('~/server/utils/marketData', () => ({
  getHistoricalHighLow: vi.fn(),
}))

// Mock global $fetch
global.$fetch = vi.fn()

describe('Trades Backfill API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should identify closed trades with missing mae/mfe and backfill them', async () => {
    const mockTrades = [
      { 
        ID: '1', 
        Status: 'Closed', 
        Pair: 'BTC-USD', 
        Date: '2023-01-01', 
        'Exit Date': '2023-01-03',
        'Entry Price': 100,
        MAE: '', 
        MFE: '' 
      }
    ]
    
    ;(global.$fetch as any).mockResolvedValue(mockTrades)
    
    const { getHistoricalHighLow } = await import('~/server/utils/marketData')
    ;(getHistoricalHighLow as any).mockResolvedValue({ high: 120, low: 90 })

    const event = { context: {} } as H3Event
    const result = await handler(event)

    expect(getHistoricalHighLow).toHaveBeenCalledWith('BTC-USD', '2023-01-01', '2023-01-03')
    expect(result).toMatchObject({
      success: true,
      processed: 1
    })
  })

  it('should skip open trades or trades with existing mae/mfe', async () => {
    const mockTrades = [
      { ID: '1', Status: 'Open', Pair: 'BTC-USD' },
      { ID: '2', Status: 'Closed', Pair: 'ETH-USD', MAE: 10, MFE: 20 }
    ]
    
    ;(global.$fetch as any).mockResolvedValue(mockTrades)

    const event = { context: {} } as H3Event
    const result = await handler(event)

    expect(result.processed).toBe(0)
  })
})
