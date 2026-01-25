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
    const client = await getSheetsClient()
    const config = useRuntimeConfig()
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

    const headers = headerResponse.data.values?.[0]
    if (!headers || headers.length === 0) {
      throw new Error('Master sheet has no headers. Cannot append trade.')
    }

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