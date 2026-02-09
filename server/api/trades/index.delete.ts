import { defineEventHandler, getQuery, createError } from 'h3'
import { getSheetsClient, findRowIndexById, deleteRow } from '../../utils/googleSheets'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const tradeId = query.id as string

    if (!tradeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Trade ID is required for deletion.'
      })
    }

    const client = await getSheetsClient()
    const config = useRuntimeConfig()
    const spreadsheetId = config.googleSpreadsheetId

    if (!spreadsheetId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Google Spreadsheet ID is not configured.'
      })
    }

    const sheetRowIndex = await findRowIndexById(client, spreadsheetId, tradeId)

    if (sheetRowIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: `Trade with ID ${tradeId} not found.`
      })
    }

    await deleteRow(client, spreadsheetId, sheetRowIndex)

    return { success: true }
  } catch (error: any) {
    console.error('[Trades DELETE API Error]:', error.message, error.stack)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to delete trade: ${error.message}`
    })
  }
})
