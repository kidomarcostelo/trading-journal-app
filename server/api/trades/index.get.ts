import { defineEventHandler, createError } from 'h3'
import { getSheetsClient } from '../../utils/googleSheets'
import { getMockTrades } from '../../utils/mockData'
import { seedSpreadsheet } from '../../utils/seeder'
import type { Trade } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    const config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : ({} as any)
    const session = typeof getUserSession === 'function' ? await getUserSession(event) : null
    const isGuest = session?.user?.isGuest || session?.user?.email === 'guest@portfolio.demo'

    if (config?.demoMode || isGuest) {
      if (config?.demoSpreadsheetId) {
        try {
          const client = await getSheetsClient()
          const response = await client.spreadsheets.values.get({
            spreadsheetId: config.demoSpreadsheetId,
            range: 'Master!A:ZZ',
            valueRenderOption: 'FORMULA',
          })
          const rows = response.data.values
          if (rows && rows.length > 1) {
            const headers = rows[0]
            const dataRows = rows.slice(1)
            return dataRows.map((row: string[], rowIndex: number) => {
              const trade: any = {}
              headers.forEach((header: string, index: number) => {
                if (header) {
                  trade[header] = parseCell(header, row[index])
                }
              })
              const idKey = Object.keys(trade).find(k => ['id', 'trade id', 'tradeid'].includes(k.toLowerCase()))
              const existingId = idKey ? trade[idKey] : undefined
              if (!existingId) {
                trade.ID = `row-${rowIndex}`
              } else if (!trade.ID && !trade.id) {
                trade.ID = existingId
              }
              return trade
            }) as Trade[]
          } else {
            console.log('[Trades API] Demo spreadsheet is empty. Auto-seeding...')
            seedSpreadsheet(client, config.demoSpreadsheetId).catch((err: any) => console.error('Auto-seed error:', err.message))
            return getMockTrades()
          }
        } catch (e: any) {
          console.warn('Failed to fetch from demo spreadsheet, fallback to mock data:', e.message)
        }
      }
      return getMockTrades()
    }

    const client = await getSheetsClient()
    const spreadsheetId = config?.googleSpreadsheetId

    if (!spreadsheetId) {
      return getMockTrades()
    }

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
