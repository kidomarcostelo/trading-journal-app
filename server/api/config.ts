import { defineEventHandler } from 'h3'
import { getSheetsClient } from '../utils/googleSheets'
import type { ChipConfig } from '../../types'

export default defineEventHandler(async (event) => {
  const client = await getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID

  const response = await client.spreadsheets.values.get({
    spreadsheetId,
    range: 'Chips!A:D',
  })

  const rows = response.data.values
  if (!rows || rows.length === 0) {
    return []
  }

  // Skip header row
  const data = rows.slice(1)

  return data.map((row: string[]) => ({
    id: row[0],
    label: row[1],
    color: row[2],
    category: row[3]
  })) as ChipConfig[]
})
