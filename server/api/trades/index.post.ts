import { defineEventHandler, readBody } from 'h3'
import { getSheetsClient } from '../../utils/googleSheets'
import type { TradeEntry } from '../../../types'

export default defineEventHandler(async (event) => {
  const body = await readBody<TradeEntry>(event)
  const client = await getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID

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
  const generatedId = crypto.randomUUID()
  const generatedCreatedAt = new Date().toISOString()
  
  const resultObj: any = { ...body }

  // 3. Construct Row based on Headers
  const row = headers.map((header: string) => {
    const lowerHeader = header.toLowerCase()
    
    // Handle System Columns if not provided in body
    if (lowerHeader === 'id' && !body[header]) {
      resultObj[header] = generatedId
      return generatedId
    }
    if ((lowerHeader === 'created at' || lowerHeader === 'date created') && !body[header]) {
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
})