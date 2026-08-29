import { defineEventHandler, createError } from 'h3'
import { getSheetsClient } from '../../utils/googleSheets'
import { DEFAULT_MOCK_CHIPS } from '../../utils/mockData'
import type { ChipCategory } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    const config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : ({} as any)
    const session = typeof getUserSession === 'function' ? await getUserSession(event) : null
    const isGuest = session?.user?.isGuest || session?.user?.email === 'guest@portfolio.demo'
    const isDemo = config?.demoMode || isGuest
    const spreadsheetId = isDemo ? (config?.demoSpreadsheetId || config?.googleSpreadsheetId) : (config?.googleSpreadsheetId || config?.demoSpreadsheetId)

    if (!spreadsheetId) {
      return DEFAULT_MOCK_CHIPS
    }

    try {
      const client = await getSheetsClient()
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
    } catch (sheetError: any) {
      console.warn('Failed to fetch chips from Google Sheets, falling back to default chips:', sheetError.message)
      if (isDemo) {
        return DEFAULT_MOCK_CHIPS
      }
      throw sheetError
    }
  } catch (error: any) {
    console.error('[Config API Error]:', error.message, error.stack)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to fetch config: ${error.message}`
    })
  }
})
