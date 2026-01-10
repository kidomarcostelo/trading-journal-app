import { defineEventHandler } from 'h3'
import { getSheetsClient } from '../../utils/googleSheets'
import type { Trade } from '../../../types'

export default defineEventHandler(async (event) => {
  const client = await getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID

  const response = await client.spreadsheets.values.get({
    spreadsheetId,
    range: 'Master!A:N',
  })

  const rows = response.data.values
  if (!rows || rows.length === 0) {
    return []
  }

  // Skip header
  const data = rows.slice(1)

  return data.map((row: string[]) => {
    return {
      id: row[0],
      createdAt: row[1],
      date: row[2],
      pair: row[3],
      type: row[4] as 'Long' | 'Short',
      entryPrice: parseFloat(row[5]),
      exitPrice: row[6] ? parseFloat(row[6]) : undefined,
      size: parseFloat(row[7]),
      pnl: row[8] ? parseFloat(row[8]) : undefined,
      pnlPercentage: row[9] ? parseFloat(row[9]) : undefined,
      imageBefore: row[10] || undefined,
      imageAfter: row[11] || undefined,
      notes: row[12] || undefined,
      tags: row[13] ? row[13].split(',').filter(Boolean) : []
    }
  }) as Trade[]
})
