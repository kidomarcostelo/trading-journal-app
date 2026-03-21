import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getHistoricalHighLow } from '../../../server/utils/marketData'
import yahooFinance from 'yahoo-finance2'

// Mock yahoo-finance2
vi.mock('yahoo-finance2', () => ({
  default: {
    historical: vi.fn()
  }
}))

describe('marketData utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch historical high and low for a symbol within a date range', async () => {
    const mockData = [
      { date: new Date('2023-01-01'), high: 110, low: 90 },
      { date: new Date('2023-01-02'), high: 120, low: 100 },
      { date: new Date('2023-01-03'), high: 115, low: 95 }
    ]
    
    vi.mocked(yahooFinance.historical).mockResolvedValue(mockData as any)

    const symbol = 'BTC-USD'
    const start = '2023-01-01'
    const end = '2023-01-03'
    
    const result = await getHistoricalHighLow(symbol, start, end)
    
    expect(result).toEqual({
      high: 120,
      low: 90
    })
    expect(yahooFinance.historical).toHaveBeenCalledWith(symbol, expect.objectContaining({
      interval: '1d'
    }))
  })

  it('should throw an error if no data is returned', async () => {
    vi.mocked(yahooFinance.historical).mockResolvedValue([] as any)

    await expect(getHistoricalHighLow('XYZ', '2023-01-01', '2023-01-03'))
      .rejects.toThrow('No historical data found for symbol: XYZ')
  })

  it('should handle API errors gracefully', async () => {
    vi.mocked(yahooFinance.historical).mockRejectedValue(new Error('Network Error'))

    await expect(getHistoricalHighLow('BTC-USD', '2023-01-01', '2023-01-03'))
      .rejects.toThrow('Network Error')
  })
})
