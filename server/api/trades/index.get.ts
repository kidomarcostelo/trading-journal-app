import { defineEventHandler } from 'h3'
import { getSheetsClient } from '../../utils/googleSheets'
import type { Trade } from '../../../types'

export default defineEventHandler(async (event) => {
  const client = await getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID

  const response = await client.spreadsheets.values.get({
    spreadsheetId,
    range: 'Master!A:Z',
  })

  const rows = response.data.values
  if (!rows || rows.length === 0) {
    return []
  }

  const headers = rows[0]
  const dataRows = rows.slice(1)

  return dataRows.map((row: string[]) => {
    const trade: any = {}
    headers.forEach((header: string, index: number) => {
      // Map header to value. 
      // We do NOT normalize to camelCase as per user request: "all the colum header as the attribute name"
      if (header) {
          trade[header] = row[index]
      }
    })
    return trade
  }) as Trade[]
})