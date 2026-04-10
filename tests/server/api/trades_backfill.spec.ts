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

  it('should calculate MAE/MFE correctly for LONG trades', async () => {
    const mockTrades = [
      { 
        ID: '1', Status: 'Closed', Action: 'Long', Pair: 'AAPL', 
        Date: '2023-01-01', 'Exit Date': '2023-01-03',
        'Entry Price': 100, MAE: '', MFE: '' 
      }
    ]
    ;(global.$fetch as any).mockResolvedValue(mockTrades)
    
    const { getHistoricalHighLow } = await import('~/server/utils/marketData')
    ;(getHistoricalHighLow as any).mockResolvedValue({ high: 110, low: 95 })

    const event = { context: {} } as H3Event
    await handler(event)

    expect(global.$fetch).toHaveBeenCalledWith('/api/trades/batch', expect.objectContaining({
      method: 'PUT',
      body: [expect.objectContaining({
        ID: '1',
        MAE: '5.00', // 100 - 95
        MFE: '10.00' // 110 - 100
      })]
    }))
  })

  it('should calculate MAE/MFE correctly for SHORT trades', async () => {
    const mockTrades = [
      { 
        ID: '2', Status: 'Closed', Action: 'Short', Pair: 'TSLA', 
        Date: '2023-01-01', 'Exit Date': '2023-01-03',
        'Entry Price': 200, MAE: '', MFE: '' 
      }
    ]
    ;(global.$fetch as any).mockResolvedValue(mockTrades)
    
    const { getHistoricalHighLow } = await import('~/server/utils/marketData')
    ;(getHistoricalHighLow as any).mockResolvedValue({ high: 210, low: 180 })

    const event = { context: {} } as H3Event
    await handler(event)

    expect(global.$fetch).toHaveBeenCalledWith('/api/trades/batch', expect.objectContaining({
      method: 'PUT',
      body: [expect.objectContaining({
        ID: '2',
        MAE: '10.00', // 210 - 200
        MFE: '20.00'  // 200 - 180
      })]
    }))
  })

  it('should continue processing even if one trade fails', async () => {
    const mockTrades = [
      { ID: '1', Status: 'Closed', Action: 'Long', Pair: 'FAIL', Date: '1', 'Exit Date': '2', 'Entry Price': 100 },
      { ID: '2', Status: 'Closed', Action: 'Long', Pair: 'PASS', Date: '1', 'Exit Date': '2', 'Entry Price': 100 }
    ]
    ;(global.$fetch as any).mockResolvedValue(mockTrades)
    
    const { getHistoricalHighLow } = await import('~/server/utils/marketData')
    ;(getHistoricalHighLow as any)
      .mockRejectedValueOnce(new Error('Market Data Error'))
      .mockResolvedValueOnce({ high: 110, low: 90 })

    const event = { context: {} } as H3Event
    const result = await handler(event)

    expect(result.processed).toBe(1)
    expect(global.$fetch).toHaveBeenCalledWith('/api/trades/batch', expect.objectContaining({
      body: [expect.objectContaining({ ID: '2' })]
    }))
  })
})
