import { getSheetsClient } from './googleSheets'

export const SETTINGS_SHEET_NAME = 'Settings'

async function ensureSettingsSheetExists(client: any, spreadsheetId: string) {
  try {
    const spreadsheet = await client.spreadsheets.get({
      spreadsheetId,
    })
    
    const sheetExists = spreadsheet.data.sheets?.some(
      (s: any) => s.properties.title === SETTINGS_SHEET_NAME
    )

    if (!sheetExists) {
      console.log(`[Settings] Creating missing sheet: ${SETTINGS_SHEET_NAME}`)
      await client.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: SETTINGS_SHEET_NAME,
                },
              },
            },
          ],
        },
      })
      
      // Initialize with headers
      await client.spreadsheets.values.update({
        spreadsheetId,
        range: `${SETTINGS_SHEET_NAME}!A1:B1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Key', 'Value']],
        },
      })
    }
  } catch (error: any) {
    console.error('[Settings] Error ensuring sheet exists:', error.message)
    // If it's just a permission error or similar, we might still fail later
  }
}

export async function getSettings(customSpreadsheetId?: string) {
  const client = await getSheetsClient()
  const config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : ({} as any)
  const spreadsheetId = customSpreadsheetId || config?.googleSpreadsheetId

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

  // 0. Ensure sheet exists
  await ensureSettingsSheetExists(client, spreadsheetId)

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
