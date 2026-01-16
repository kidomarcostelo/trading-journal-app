import { defineEventHandler } from 'h3'
import { getSheetsClient } from '../utils/googleSheets'
import type { ChipCategory } from '../../types'

export default defineEventHandler(async (event) => {
  const client = await getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID

  const response = await client.spreadsheets.values.get({
    spreadsheetId,
    range: 'Chips!A:ZZ', // Fetch all columns
    majorDimension: 'COLUMNS' // Fetch by column to make parsing easier
  })

  const columns = response.data.values
  if (!columns || columns.length === 0) {
    return []
  }

  const chips: ChipCategory[] = columns.map((col: string[]) => {
    const id = col[0] // First row is the header/ID
    const values = col.slice(1).filter(v => v !== '' && v !== undefined) // Rest are values
    return {
      id,
      values
    }
  })

  return chips
})