import { defineEventHandler } from 'h3'
import { getSheetsClient } from '../../utils/googleSheets'
import { seedSpreadsheet } from '../../utils/seeder'

export default defineEventHandler(async (event) => {
  const config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : ({} as any)
  const targetSpreadsheetId = config?.demoSpreadsheetId || config?.googleSpreadsheetId
  if (!targetSpreadsheetId) {
    return { success: false, message: 'No spreadsheet ID configured' }
  }
  try {
    const client = await getSheetsClient()
    const success = await seedSpreadsheet(client, targetSpreadsheetId)
    return { success, spreadsheetId: targetSpreadsheetId }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})
