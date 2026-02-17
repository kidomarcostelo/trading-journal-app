import { defineEventHandler, readBody, createError } from 'h3'
import { getSheetsClient, getColumnLetter, findRowIndexById } from '../../utils/googleSheets'
import type { TradeEntry } from '../../../types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<TradeEntry>(event)
    const client = await getSheetsClient()
    const config = useRuntimeConfig()
    const spreadsheetId = config.googleSpreadsheetId

    if (!spreadsheetId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Google Spreadsheet ID is not configured.'
      })
    }

    const tradeId = body.ID || body.id
    if (!tradeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Trade ID is required for updates.'
      })
    }

    // 1. Fetch Headers
    const headerResponse = await client.spreadsheets.values.get({
      spreadsheetId,
      range: 'Master!1:1',
    })

    let headers = headerResponse.data.values?.[0]
    if (!headers || headers.length === 0) {
      throw new Error('Master sheet has no headers.')
    }

    // --- Dynamic Header Expansion ---
    const missingHeaders: string[] = []
    const existingHeadersLower = headers.map((h: string) => h.toLowerCase())

    Object.keys(body).forEach(key => {
      // Skip ID as it's handled separately and should exist
      if (key.toLowerCase() === 'id') return
      
      if (!existingHeadersLower.includes(key.toLowerCase())) {
        missingHeaders.push(key)
      }
    })

    if (missingHeaders.length > 0) {
      console.log(`[Trades PUT] Adding missing headers: ${missingHeaders.join(', ')}`)
      
      // Update the local headers array
      headers = [...headers, ...missingHeaders]
      
      // Update the remote Sheet headers
      const range = `Master!A1:${getColumnLetter(headers.length - 1)}1`
      await client.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers]
        }
      })
    }
    // --------------------------------

    const sheetRowIndex = await findRowIndexById(client, spreadsheetId, tradeId)
    
    if (sheetRowIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: `Trade with ID ${tradeId} not found.`
      })
    }

    // 3. Fetch Existing Row Data to Merge
    const rowRange = `Master!A${sheetRowIndex}:${getColumnLetter(headers.length - 1)}${sheetRowIndex}`
    const rowResponse = await client.spreadsheets.values.get({
      spreadsheetId,
      range: rowRange,
      valueRenderOption: 'FORMULA' // Keep formulas if any
    })

    const existingRow = rowResponse.data.values?.[0] || []

    // 4. Construct New Row
    const newRow = headers.map((header: string, index: number) => {
      if (body[header] !== undefined) return body[header]
      
      const key = Object.keys(body).find(k => k.toLowerCase() === header.toLowerCase())
      if (key && body[key] !== undefined) return body[key]

      return existingRow[index] !== undefined ? existingRow[index] : ''
    })

    // 5. Update Row
    await client.spreadsheets.values.update({
      spreadsheetId,
      range: rowRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newRow]
      }
    })

    return { success: true, row: newRow }
  } catch (error: any) {
    console.error('[Trades PUT API Error]:', error.message, error.stack)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to update trade: ${error.message}`
    })
  }
})