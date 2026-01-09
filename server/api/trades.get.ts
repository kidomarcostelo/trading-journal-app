import { defineEventHandler } from 'h3'
import { getGoogleSheetsClient } from '../utils/googleSheets'
import type { Trade } from '../../types/index'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<Trade[]> => {
  const config = useRuntimeConfig()
  const sheets = await getGoogleSheetsClient()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: config.googleSpreadsheetId,
    range: 'Master!A:Z',
  })

  const rows = response.data.values || []
  if (rows.length < 2) return [] // Header + Data

  const headers = rows[0].map((h) => h.trim().toLowerCase())
  const trades: Trade[] = []

  // Helper to get value by header
  const getValue = (row: any[], header: string): string => {
    const index = headers.indexOf(header.toLowerCase())
    if (index === -1) return ''
    return row[index] || ''
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row.length === 0) continue

    const date = getValue(row, 'Date')
    const pair = getValue(row, 'Pair')

    // Basic validation: need date and pair to be a valid trade entry?
    if (!date || !pair) continue

    const entryPrice = parseFloat(getValue(row, 'Entry').replace(/,/g, '')) || 0
    const exitPrice = parseFloat(getValue(row, 'Exit').replace(/,/g, ''))
    const pnl = parseFloat(getValue(row, 'PnL').replace(/,/g, ''))

    const beforeRaw = getValue(row, 'Before')
    const afterRaw = getValue(row, 'After')
    const imagesBefore = beforeRaw ? beforeRaw.split(',').map(s => s.trim()) : []
    const imagesAfter = afterRaw ? afterRaw.split(',').map(s => s.trim()) : []

    const tagsRaw = getValue(row, 'Tags')
    let tags = {}
    try {
      if (tagsRaw) {
        tags = JSON.parse(tagsRaw)
      }
    } catch (e) {
      // console.warn('Failed to parse tags for row', i)
    }

    const notes = getValue(row, 'Notes')

    trades.push({
      id: crypto.randomUUID(), // In real app, maybe use row index or a dedicated ID column
      rowIndex: i + 1, // 1-based index matching Sheet row numbers
      date,
      pair,
      entryPrice,
      exitPrice: isNaN(exitPrice) ? undefined : exitPrice,
      pnl: isNaN(pnl) ? undefined : pnl,
      imagesBefore,
      imagesAfter,
      tags,
      notes
    })
  }

  return trades
})
