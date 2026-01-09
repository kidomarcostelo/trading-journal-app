import { defineEventHandler } from 'h3' // Or import from #imports if possible, but h3 is safe for backend
import { getGoogleSheetsClient } from '../utils/googleSheets'
import type { ChipConfig } from '../../types/index'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<ChipConfig> => {
  const config = useRuntimeConfig()
  const sheets = await getGoogleSheetsClient()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: config.googleSpreadsheetId,
    range: 'Chips',
  })

  const rows = response.data.values || []
  if (rows.length === 0) return {}

  const headers = rows[0]
  const result: ChipConfig = {}

  // Initialize categories
  headers.forEach((header) => {
    if (header) {
      result[header.trim()] = []
    }
  })

  // Iterate over data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    headers.forEach((header, index) => {
      if (header) {
        const value = row[index]
        if (value && value.trim() !== '') {
          result[header.trim()].push(value.trim())
        }
      }
    })
  }

  return result
})
