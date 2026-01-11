import { defineEventHandler } from 'h3'
import { getSheetsClient } from '../../utils/googleSheets'
import type { Trade } from '../../../types'

export default defineEventHandler(async (event) => {
  const client = await getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID

  const response = await client.spreadsheets.values.get({
    spreadsheetId,
    range: 'Master!A:Z',
    valueRenderOption: 'FORMULA', // Request formulas to handle =IMAGE()
  })

  const rows = response.data.values
  if (!rows || rows.length === 0) {
    return []
  }

  const headers = rows[0]
  const dataRows = rows.slice(1)

  return dataRows.map((row: string[], rowIndex: number) => {
    const trade: any = {}
    headers.forEach((header: string, index: number) => {
      if (header) {
          trade[header] = parseCell(header, row[index])
      }
    })
    
    // Ensure unique ID
    if (!trade.ID && !trade.id) {
        trade.ID = `row-${rowIndex}`
    }
    
    return trade
  }) as Trade[]
})

function parseCell(header: string, value: string | undefined): any {
  if (value === undefined || value === '') return undefined

  // Check if this is likely an image column
  const isImageColumn = /picture|image|img/i.test(header)

  if (isImageColumn) {
    // Handle =IMAGE("url") formula
    const imageFormulaMatch = value.match(/^=IMAGE\("([^"]+)"/i)
    if (imageFormulaMatch) {
      return [imageFormulaMatch[1]]
    }

    // Handle comma-separated list of URLs or single URL
    return value.split(',').map(v => v.trim()).filter(v => v.length > 0)
  }

  return value
}
