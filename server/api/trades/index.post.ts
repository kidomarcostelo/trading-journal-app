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
    const body = await readBody<TradeEntry>(event)
    const config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : ({} as any)
    const session = typeof getUserSession === 'function' ? await getUserSession(event) : null
    const isGuest = session?.user?.isGuest || session?.user?.email === 'guest@portfolio.demo'

    if (config?.demoMode || isGuest) {
      const now = new Date()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const yyyy = now.getFullYear()
      const generatedCreatedAt = `${mm}/${dd}/${yyyy}`
      return {
        id: `demo-${Date.now()}`,
        date: generatedCreatedAt,
        ...body
      }
    }

    const client = await getSheetsClient()
    const spreadsheetId = config.googleSpreadsheetId

    if (!spreadsheetId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Google Spreadsheet ID is not configured.'
      })
    }

    // 1. Fetch Headers to determine column order
    const headerResponse = await client.spreadsheets.values.get({
      spreadsheetId,
      range: 'Master!1:1', // First row only
    })

    let headers = headerResponse.data.values?.[0]
    if (!headers || headers.length === 0) {
      throw new Error('Master sheet has no headers. Cannot append trade.')
    }

    // --- Auto-create New Pair in Chips sheet ---
    if (body.Pair) {
      try {
        const chipsResponse = await client.spreadsheets.values.get({
          spreadsheetId,
          range: 'Chips!A:ZZ',
          majorDimension: 'COLUMNS'
        })

        const columns = chipsResponse.data.values || []
        const pairsColIndex = columns.findIndex((col: string[]) => ['pairs', 'pair'].includes(col[0]?.toLowerCase()))

        if (pairsColIndex !== -1) {
          const pairsCol = columns[pairsColIndex]
          const existingPairs = pairsCol.slice(1).map((p: string) => p.toLowerCase())
          
          if (!existingPairs.includes(body.Pair.toLowerCase())) {
            console.log(`[Trades POST] New pair detected: ${body.Pair}. Adding to Chips sheet.`)
            
            // Find the next empty row in this specific column
            // We append to the column by updating the range Master!{Col}{LastRow+1}
            const colLetter = getColumnLetter(pairsColIndex)
            const nextRow = pairsCol.length + 1
            
            await client.spreadsheets.values.update({
              spreadsheetId,
              range: `Chips!${colLetter}${nextRow}`,
              valueInputOption: 'USER_ENTERED',
              requestBody: {
                values: [[body.Pair]]
              }
            })
          }
        }
      } catch (chipError: any) {
        console.warn('[Trades POST] Failed to update Chips sheet with new pair:', chipError.message)
        // Don't fail the whole trade creation if just the chip update fails
      }
    }
    // ------------------------------------------

    // --- Dynamic Header Expansion ---
    const missingHeaders: string[] = []
    const existingHeadersLower = headers.map((h: string) => h.toLowerCase())

    Object.keys(body).forEach(key => {
      // Skip ID as it's handled separately
      if (key.toLowerCase() === 'id') return
      
      if (!existingHeadersLower.includes(key.toLowerCase())) {
        missingHeaders.push(key)
      }
    })

    if (missingHeaders.length > 0) {
      console.log(`[Trades POST] Adding missing headers: ${missingHeaders.join(', ')}`)
      
      // Update the local headers array
      headers = [...headers, ...missingHeaders]
      
      // Update the remote Sheet headers
      // We need to calculate the new range for the header row
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

    // 2. Prepare System Values
    
    // Date Formatting: mm/dd/yyyy
    const now = new Date()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const yyyy = now.getFullYear()
    const generatedCreatedAt = `${mm}/${dd}/${yyyy}`
    
    // ID Generation: Auto-increment
    let generatedId = '1' // Default if no IDs found
    
    const idIndex = headers.findIndex((h: string) => h.toLowerCase() === 'id')
    
    if (idIndex !== -1) {
      const colLetter = getColumnLetter(idIndex)
      // Fetch the ID column to find the max ID
      const idResponse = await client.spreadsheets.values.get({
        spreadsheetId,
        range: `Master!${colLetter}:${colLetter}`,
      })
      
      const idValues = idResponse.data.values
      if (idValues && idValues.length > 0) {
        // Extract numbers, ignore header (if it's not a number), ignore empty
        const ids = idValues.flat().map(v => parseInt(v)).filter(v => !isNaN(v))
        if (ids.length > 0) {
          generatedId = (Math.max(...ids) + 1).toString()
        }
      }
    } else {
      // Fallback if no ID column found: use UUID
      generatedId = crypto.randomUUID()
    }
    
    const resultObj: any = { ...body }

    // 3. Construct Row based on Headers
    const row = headers.map((header: string) => {
      const lowerHeader = header.toLowerCase()
      
      // Handle System Columns if not provided in body
      if (lowerHeader === 'id' && !body[header]) {
        resultObj[header] = generatedId
        return generatedId
      }
      if ((lowerHeader === 'created at' || lowerHeader === 'date created' || lowerHeader === 'date') && !body[header]) {
         resultObj[header] = generatedCreatedAt
         return generatedCreatedAt
      }

      // Handle Body Values
      const value = body[header]

      if (Array.isArray(value)) {
        return value.join(',')
      }
      
      if (value === undefined || value === null) {
        return ''
      }

      return value
    })

    // 4. Append
    await client.spreadsheets.values.append({
      spreadsheetId,
      range: 'Master!A:A',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      }
    })

    return resultObj
  } catch (error: any) {
    console.error('[Trades POST API Error]:', error.message, error.stack)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to create trade: ${error.message}`
    })
  }
})