import { getSheetsClient } from './googleSheets'

export const SETTINGS_SHEET_NAME = 'Settings'

export async function getSettings() {
  const client = await getSheetsClient()
  const config = useRuntimeConfig()
  const spreadsheetId = config.googleSpreadsheetId

  if (!spreadsheetId) {
    throw createError({
        statusCode: 500,
        statusMessage: 'Google Spreadsheet ID is not configured.'
      })
  }

  try {
    const response = await client.spreadsheets.values.get({
      spreadsheetId,
      range: `${SETTINGS_SHEET_NAME}!A:B`,
    })

    const rows = response.data.values
    if (!rows || rows.length <= 1) { // Empty or just header
      return {}
    }

    // Skip header row
    const settings: Record<string, any> = {}
    for (let i = 1; i < rows.length; i++) {
      const [key, value] = rows[i]
      if (key) {
        try {
          settings[key] = JSON.parse(value)
        } catch (e) {
          settings[key] = value // Fallback to raw string if not JSON
        }
      }
    }
    return settings

  } catch (error: any) {
    // If sheet doesn't exist, return empty settings (or maybe create it?)
    if (error.message.includes('Unable to parse range') || error.code === 400) {
        console.warn(`[Settings] Sheet '${SETTINGS_SHEET_NAME}' not found. Returning empty settings.`)
        return {}
    }
    throw error
  }
}

export async function saveSettings(key: string, value: any) {
  const client = await getSheetsClient()
  const config = useRuntimeConfig()
  const spreadsheetId = config.googleSpreadsheetId

  if (!spreadsheetId) {
      throw createError({
          statusCode: 500,
          statusMessage: 'Google Spreadsheet ID is not configured.'
        })
  }

  // 1. Get current settings to find row index
  const response = await client.spreadsheets.values.get({
    spreadsheetId,
    range: `${SETTINGS_SHEET_NAME}!A:B`,
  })

  const rows = response.data.values || []
  let rowIndex = -1
  
  // Find key
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === key) {
      rowIndex = i + 1 // 1-based index
      break
    }
  }

  const valueString = JSON.stringify(value)

  if (rowIndex !== -1) {
    // Update existing row
    await client.spreadsheets.values.update({
      spreadsheetId,
      range: `${SETTINGS_SHEET_NAME}!B${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[valueString]]
      }
    })
  } else {
    // Append new row
    // First, ensure header exists if empty
    if (rows.length === 0) {
        await client.spreadsheets.values.append({
            spreadsheetId,
            range: `${SETTINGS_SHEET_NAME}!A:B`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [['Key', 'Value']]
            }
        })
    }
    
    await client.spreadsheets.values.append({
      spreadsheetId,
      range: `${SETTINGS_SHEET_NAME}!A:B`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[key, valueString]]
      }
    })
  }
}
