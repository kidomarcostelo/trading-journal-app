import { defineEventHandler } from 'h3'
import { getHistoricalHighLow } from '~/server/utils/marketData'
import type { Trade } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 1. Fetch all trades
    const trades = await $fetch<Trade[]>('/api/trades')
    
    // 2. Identify trades to backfill
    // Criteria: Status === 'Closed', missing MAE or MFE, has entry/exit dates and prices
    const toBackfill = trades.filter(t => {
      const status = String(t.Status || t.status || '').toLowerCase()
      const hasDates = (t.Date || t.date) && (t['Exit Date'] || t.exitDate)
      const hasEntryPrice = (t['Entry Price'] || t.entryPrice)
      const isMissingMetrics = !t.MAE || !t.MFE || t.MAE === '' || t.MFE === ''
      
      return status === 'closed' && hasDates && hasEntryPrice && isMissingMetrics
    })

    if (toBackfill.length === 0) {
      return { success: true, processed: 0, message: 'No trades need backfilling.' }
    }

    const updatedTrades: Trade[] = []

    // 3. Process each trade
    for (const trade of toBackfill) {
      try {
        const symbol = trade.Pair || trade.pair || ''
        const start = trade.Date || trade.date || ''
        const end = trade['Exit Date'] || trade.exitDate || ''
        const entryPrice = parseFloat(String(trade['Entry Price'] || trade.entryPrice || 0))
        const direction = String(trade.Action || trade.action || '').toLowerCase()

        if (!symbol || !start || !end || isNaN(entryPrice)) continue

        const { high, low } = await getHistoricalHighLow(symbol, start, end)

        // Calculate MAE/MFE
        // MAE: Maximum Adverse Excursion (Max loss during trade)
        // MFE: Maximum Favorable Excursion (Max profit during trade)
        let mae = 0
        let mfe = 0

        if (direction === 'long' || direction === 'buy') {
          mae = Math.max(0, entryPrice - low)
          mfe = Math.max(0, high - entryPrice)
        } else if (direction === 'short' || direction === 'sell') {
          mae = Math.max(0, high - entryPrice)
          mfe = Math.max(0, entryPrice - low)
        }

        updatedTrades.push({
          ...trade,
          MAE: mae.toFixed(2),
          MFE: mfe.toFixed(2)
        })
      } catch (err: any) {
        console.error(`[Backfill] Error processing trade ${trade.ID}:`, err.message)
      }
    }

    if (updatedTrades.length > 0) {
      // 4. Batch update trades
      await $fetch('/api/trades/batch', {
        method: 'PUT',
        body: updatedTrades
      })
    }

    return {
      success: true,
      processed: updatedTrades.length,
      totalFound: toBackfill.length
    }
  } catch (error: any) {
    console.error('[Backfill API] Global Error:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: `Backfill failed: ${error.message}`
    })
  }
})
