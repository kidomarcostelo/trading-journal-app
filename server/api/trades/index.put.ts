import { defineEventHandler, readBody } from 'h3'
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
  const body = await readBody<TradeEntry>(event)
  const client = await getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID

  const tradeId = body.ID || body.id
  if (!tradeId) {
    throw new Error('Trade ID is required for updates.')
  }

  // 1. Fetch Headers
  const headerResponse = await client.spreadsheets.values.get({
    spreadsheetId,
    range: 'Master!1:1',
  })

  const headers = headerResponse.data.values?.[0]
  if (!headers || headers.length === 0) {
    throw new Error('Master sheet has no headers.')
  }

  // 2. Find ID Column and Row Index
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
  
  let sheetRowIndex = -1

  // Check if ID is a generated "row-X" ID
  if (String(tradeId).startsWith('row-')) {
    const dataIndex = parseInt(String(tradeId).replace('row-', ''), 10)
    if (!isNaN(dataIndex)) {
      // dataIndex 0 is the first row AFTER header.
      // Header is Row 1. Data Row 0 is Row 2.
      sheetRowIndex = dataIndex + 2
    }
  }

  // If not found yet, try standard lookup
  if (sheetRowIndex === -1) {
    // idValues[0] is Header 'ID'. idValues[1] is row 2.
    const rowIndexInData = idValues.findIndex((val: string) => String(val) === String(tradeId))
    if (rowIndexInData !== -1) {
      sheetRowIndex = rowIndexInData + 1 // 1-based row index
    }
  }
  
  if (sheetRowIndex === -1) {
    throw new Error(`Trade with ID ${tradeId} not found.`)
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
    // If body has this header key, use it. Otherwise keep existing.
    // Body keys might match header exact or need mapping? 
    // Assuming body keys match headers (case-sensitive? or normalize?)
    // Let's try exact match first, then lower case.
    
    if (body[header] !== undefined) return body[header]
    
    // Fallback: check lowercase header match in body
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
})
