import { defineEventHandler, readBody } from 'h3'
import { getSheetsClient } from '../../utils/googleSheets'
import type { TradeEntry, Trade } from '../../../types'

export default defineEventHandler(async (event) => {
  const body = await readBody<TradeEntry>(event)
  const client = await getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID

  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  const newTrade: Trade = {
    id,
    createdAt,
    ...body
  }

  const row = [
    newTrade.id,
    newTrade.createdAt,
    newTrade.date,
    newTrade.pair,
    newTrade.type,
    newTrade.entryPrice,
    newTrade.exitPrice ?? '',
    newTrade.size,
    newTrade.pnl ?? '',
    newTrade.pnlPercentage ?? '',
    newTrade.imageBefore ?? '',
    newTrade.imageAfter ?? '',
    newTrade.notes ?? '',
    newTrade.tags.join(',')
  ]

  await client.spreadsheets.values.append({
    spreadsheetId,
    range: 'Master!A:N',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row]
    }
  })

  return newTrade
})
