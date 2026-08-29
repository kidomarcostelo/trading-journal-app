import { getMockTrades, DEFAULT_MOCK_CHIPS, DEFAULT_MOCK_SETTINGS } from './mockData'

export async function seedSpreadsheet(client: any, spreadsheetId: string): Promise<boolean> {
  try {
    // 1. Ensure sheets exist
    const spreadsheet = await client.spreadsheets.get({ spreadsheetId })
    const existingSheets = spreadsheet.data.sheets?.map((s: any) => s.properties?.title) || []

    const requiredSheets = ['Master', 'Chips', 'Settings']
    const addSheetRequests = requiredSheets
      .filter(s => !existingSheets.includes(s))
      .map(title => ({ addSheet: { properties: { title } } }))

    if (addSheetRequests.length > 0) {
      await client.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: addSheetRequests }
      })
    }

    // 2. Seed Master Sheet with rich dummy trades
    await client.spreadsheets.values.clear({ spreadsheetId, range: 'Master' })

    const headers = [
      'ID', 'Date', 'Pair', 'Market', 'Direction', 'Status', 'Entry Price', 'Exit Price',
      'Size', 'PnL', 'MAE', 'MFE', 'Checklist Score', 'Tier', 'Rules Followed',
      'Mental Category', 'Emotions', 'Session', 'Strategies', 'Setups', 'Notes'
    ]

    const mockTrades = getMockTrades()
    const rows = mockTrades.map((trade: any, idx: number) => [
      String(idx + 1),
      trade.date || '',
      trade.pair || '',
      trade.market || '',
      trade.direction || '',
      trade.status || '',
      trade.entryPrice !== undefined ? String(trade.entryPrice) : '',
      trade.exitPrice !== undefined ? String(trade.exitPrice) : '',
      trade.size !== undefined ? String(trade.size) : '',
      trade.pnl !== undefined ? String(trade.pnl) : '',
      trade.mae !== undefined ? String(trade.mae) : '',
      trade.mfe !== undefined ? String(trade.mfe) : '',
      trade.checklistScore !== undefined ? String(trade.checklistScore) : '',
      trade.tier || '',
      trade.rulesFollowed ? 'TRUE' : 'FALSE',
      trade.mentalCategory || '',
      Array.isArray(trade.emotions) ? trade.emotions.join(',') : '',
      trade.session || '',
      trade.Strategies || '',
      trade.Setups || '',
      trade.Notes || ''
    ])

    await client.spreadsheets.values.update({
      spreadsheetId,
      range: 'Master!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [headers, ...rows] }
    })

    // 3. Seed Chips Sheet
    await client.spreadsheets.values.clear({ spreadsheetId, range: 'Chips' })

    const maxRows = Math.max(...DEFAULT_MOCK_CHIPS.map(c => c.values.length)) + 1
    const chipGrid: string[][] = []

    for (let r = 0; r < maxRows; r++) {
      chipGrid.push(new Array(DEFAULT_MOCK_CHIPS.length).fill(''))
    }

    DEFAULT_MOCK_CHIPS.forEach((col, colIdx) => {
      chipGrid[0][colIdx] = col.id
      col.values.forEach((val, valIdx) => {
        chipGrid[valIdx + 1][colIdx] = val
      })
    })

    await client.spreadsheets.values.update({
      spreadsheetId,
      range: 'Chips!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: chipGrid }
    })

    // 4. Seed Settings Sheet
    await client.spreadsheets.values.clear({ spreadsheetId, range: 'Settings' })

    const settingsRows = [
      ['Key', 'Value'],
      ['chip_layout', JSON.stringify(DEFAULT_MOCK_SETTINGS.chip_layout)],
      ['strategyChecklists', JSON.stringify(DEFAULT_MOCK_SETTINGS.strategyChecklists)]
    ]

    await client.spreadsheets.values.update({
      spreadsheetId,
      range: 'Settings!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: settingsRows }
    })

    console.log(`[Seeder] Successfully seeded spreadsheet: ${spreadsheetId}`)
    return true
  } catch (err: any) {
    console.error(`[Seeder] Error seeding spreadsheet ${spreadsheetId}:`, err.message)
    return false
  }
}
