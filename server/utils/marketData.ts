import yahooFinance from 'yahoo-finance2'

export interface HighLowResult {
  high: number
  low: number
}

/**
 * Fetches historical high and low prices for a given symbol within a date range.
 * @param symbol The ticker symbol (e.g., 'AAPL', 'BTC-USD')
 * @param startDate Entry date (string or Date)
 * @param endDate Exit date (string or Date)
 */
export async function getHistoricalHighLow(
  symbol: string,
  startDate: string | Date,
  endDate: string | Date
): Promise<HighLowResult> {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Yahoo Finance historical data
    // period1: start date, period2: end date
    // interval: '1d' for daily data
    const result = await yahooFinance.historical(symbol, {
      period1: start,
      period2: end,
      interval: '1d'
    })

    if (!result || result.length === 0) {
      throw new Error(`No historical data found for symbol: ${symbol}`)
    }

    let maxHigh = -Infinity
    let minLow = Infinity

    for (const day of result) {
      if (day.high > maxHigh) maxHigh = day.high
      if (day.low < minLow) minLow = day.low
    }

    return {
      high: maxHigh,
      low: minLow
    }
  } catch (error: any) {
    console.error(`[MarketData] Error fetching data for ${symbol}:`, error.message)
    throw error
  }
}
