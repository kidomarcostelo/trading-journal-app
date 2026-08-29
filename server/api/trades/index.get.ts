import { defineEventHandler, createError } from 'h3'
import { getSheetsClient } from '../../utils/googleSheets'
import { getMockTrades } from '../../utils/mockData'
import type { Trade } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    const config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : ({} as any)
    const session = typeof getUserSession === 'function' ? await getUserSession(event) : null
    const isGuest = session?.user?.isGuest || session?.user?.email === 'guest@portfolio.demo'
    const isDemo = config?.demoMode || isGuest
    const spreadsheetId = isDemo ? (config?.demoSpreadsheetId || config?.googleSpreadsheetId) : (config?.googleSpreadsheetId || config?.demoSpreadsheetId)

    if (!spreadsheetId) {
      return getMockTrades()
    }

    try {
      const client = await getSheetsClient()
      const response = await client.spreadsheets.values.get({
        spreadsheetId,
        range: 'Master!A:ZZ',
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
        // Check for common ID column names
        const idKey = Object.keys(trade).find(k => ['id', 'trade id', 'tradeid'].includes(k.toLowerCase()))
        const existingId = idKey ? trade[idKey] : undefined

        if (!existingId) {
          trade.ID = `row-${rowIndex}`
        } else {
          // Normalize to ID for frontend consistency if needed, or just rely on existing key
          if (!trade.ID && !trade.id) {
            trade.ID = existingId
          }
        }
        
        return trade
      }) as Trade[]
    } catch (sheetError: any) {
      console.warn('Failed to fetch trades from Google Sheets, falling back to mock data:', sheetError.message)
      if (isDemo) {
        return getMockTrades()
      }
      throw sheetError
    }
  } catch (error: any) {
    console.error('Error fetching trades:', error.message, error.response?.data)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch trades: ${error.message}`
    })
  }
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
