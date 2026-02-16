import { defineEventHandler, readBody, createError } from 'h3'
import { getSheetsClient } from '../../utils/googleSheets'
import type { ChipCategory } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<ChipCategory[]>(event)
    const client = await getSheetsClient()
    const config = useRuntimeConfig()
    const spreadsheetId = config.googleSpreadsheetId

    if (!spreadsheetId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Google Spreadsheet ID is not configured.'
      })
    }

    if (!Array.isArray(body)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Body must be an array of ChipCategory'
      })
    }

    // 1. Prepare data in COLUMNS format
    // Each column: [CategoryName, Value1, Value2, ...]
    const columns = body.map(cat => [cat.id, ...cat.values])

    // 2. Clear current chips first to ensure clean state
    await client.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Chips!A:ZZ'
    })

    // 3. Write new data
    await client.spreadsheets.values.update({
      spreadsheetId,
      range: 'Chips!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        majorDimension: 'COLUMNS',
        values: columns
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error('[Config PUT API Error]:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update chip library: ${error.message}`
    })
  }
})
