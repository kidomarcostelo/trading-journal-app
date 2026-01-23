import { defineEventHandler, createError } from 'h3'
import { getSheetsClient } from '../utils/googleSheets'
import type { ChipCategory } from '../../types'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const client = await getSheetsClient()
  const config = useRuntimeConfig()
  const spreadsheetId = config.googleSpreadsheetId

  if (!spreadsheetId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Google Spreadsheet ID is not configured.'
    })
  }

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