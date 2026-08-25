import { defineEventHandler, readBody, createError } from 'h3'
import { getSheetsClient } from '../../utils/googleSheets'
import type { TradeEntry } from '../../../types'

function getColumnLetter(index: number): string {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<TradeEntry[]>(event)
    
    if (!Array.isArray(body)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request body must be an array of trades.'
      })
    }

    if (body.length === 0) {
      return { success: true, count: 0 }
    }

    const config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : ({} as any)
    const session = typeof getUserSession === 'function' ? await getUserSession(event) : null
    const isGuest = session?.user?.isGuest || session?.user?.email === 'guest@portfolio.demo'

    if (config?.demoMode || isGuest) {
      return { success: true, count: body.length }
    }

    const client = await getSheetsClient()
    const spreadsheetId = config.googleSpreadsheetId

    if (!spreadsheetId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Google Spreadsheet ID is not configured.'
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
    const missingHeaders: Set<string> = new Set()
    const existingHeadersLower = headers.map((h: string) => h.toLowerCase())

    // Check all trades in the batch for missing headers
    for (const trade of body) {
      Object.keys(trade).forEach(key => {
        if (key.toLowerCase() === 'id') return
        if (!existingHeadersLower.includes(key.toLowerCase())) {
          missingHeaders.add(key)
        }
      })
    }

    if (missingHeaders.size > 0) {
      const newHeaders = Array.from(missingHeaders)
      console.log(`[Trades Batch PUT] Adding missing headers: ${newHeaders.join(', ')}`)
      
      // Update local headers
      headers = [...headers, ...newHeaders]
      
      // Update remote headers
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

    // 2. Find ID Column and Row Indices for all trades
    const idIndex = headers.findIndex((h: string) => h.toLowerCase() === 'id')
    if (idIndex === -1) {
      throw new Error('ID column not found in sheet.')
    }

    const colLetter = getColumnLetter(idIndex)
    const idResponse = await client.spreadsheets.values.get({
      spreadsheetId,
      range: `Master!${colLetter}:${colLetter}`,
    })

    const idValues = idResponse.data.values?.flat() || []
    
    // Map trades to row indices
    const tradesToUpdate = []
    
    for (const trade of body) {
      const tradeId = trade.ID || trade.id
      if (!tradeId) continue;

      let sheetRowIndex = -1

      // Check if ID is a generated "row-X" ID
      if (String(tradeId).startsWith('row-')) {
        const dataIndex = parseInt(String(tradeId).replace('row-', ''), 10)
        if (!isNaN(dataIndex)) {
          sheetRowIndex = dataIndex + 2
        }
      }

      // Standard lookup
      if (sheetRowIndex === -1) {
        const rowIndexInData = idValues.findIndex((val: string) => String(val) === String(tradeId))
        if (rowIndexInData !== -1) {
          sheetRowIndex = rowIndexInData + 1
        }
      }

      if (sheetRowIndex !== -1) {
        tradesToUpdate.push({
          trade,
          rowIndex: sheetRowIndex,
          range: `Master!A${sheetRowIndex}:${getColumnLetter(headers.length - 1)}${sheetRowIndex}`
        })
      }
    }

    if (tradesToUpdate.length === 0) {
       return { success: true, count: 0, message: 'No matching trades found to update.' }
    }

    // 3. Batch Fetch Existing Data
    // googleapis batchGet takes 'ranges' as array
    const ranges = tradesToUpdate.map(t => t.range)
    const batchGetResponse = await client.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
      valueRenderOption: 'FORMULA'
    })

    const valueRanges = batchGetResponse.data.valueRanges
    
    // 4. Construct Updates
    const updateData = []

    for (let i = 0; i < tradesToUpdate.length; i++) {
      const item = tradesToUpdate[i]
      const existingValues = valueRanges && valueRanges[i] && valueRanges[i].values 
        ? valueRanges[i].values[0] 
        : []
      
      const newRow = headers.map((header: string, index: number) => {
        // Check exact key match
        if (item.trade[header] !== undefined) return item.trade[header]
        
        // Check case-insensitive match
        const key = Object.keys(item.trade).find(k => k.toLowerCase() === header.toLowerCase())
        if (key && item.trade[key] !== undefined) return item.trade[key]

        // Keep existing
        return existingValues[index] !== undefined ? existingValues[index] : ''
      })

      updateData.push({
        range: item.range,
        values: [newRow]
      })
    }

    // 5. Batch Update
    await client.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updateData
      }
    })

    return { success: true, count: updateData.length }

  } catch (error: any) {
    console.error('[Trades Batch PUT API Error]:', error.message, error.stack)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to batch update trades: ${error.message}`
    })
  }
})
