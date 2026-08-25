import { google } from 'googleapis'
import dotenv from 'dotenv'
import { getMockTrades, DEFAULT_MOCK_CHIPS, DEFAULT_MOCK_SETTINGS } from '../server/utils/mockData'

dotenv.config()

async function seed() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || process.env.NUXT_GOOGLE_PRIVATE_KEY
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || process.env.NUXT_GOOGLE_SPREADSHEET_ID

  if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
    console.error('Missing required environment variables. Please check your .env file.')
    console.error('Required: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SPREADSHEET_ID')
    process.exit(1)
  }

  privateKey = privateKey.trim()
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }
  if (!privateKey.startsWith('-----')) {
    try {
      const decoded = Buffer.from(privateKey, 'base64').toString('utf-8')
      if (decoded.includes('-----BEGIN PRIVATE KEY-----')) {
        privateKey = decoded
      }
    } catch (e) {
      // Ignore
    }
  }
  const header = '-----BEGIN PRIVATE KEY-----'
  const footer = '-----END PRIVATE KEY-----'
  if (privateKey.includes(header) && privateKey.includes(footer)) {
    const startIdx = privateKey.indexOf(header) + header.length
    const endIdx = privateKey.indexOf(footer)
    let body = privateKey.substring(startIdx, endIdx)
    body = body.replace(/\\n/g, '')
    body = body.replace(/\s/g, '')
    privateKey = `${header}\n${body}\n${footer}`
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const client = google.sheets({ version: 'v4', auth: await auth.getClient() as any })

  console.log('Seeding trading journal spreadsheet...')

  try {
    // 1. Ensure sheets exist
    const spreadsheet = await client.spreadsheets.get({ spreadsheetId })
    const existingSheets = spreadsheet.data.sheets?.map(s => s.properties?.title) || []

    const requiredSheets = ['Master', 'Chips', 'Settings']
    const addSheetRequests = requiredSheets
      .filter(s => !existingSheets.includes(s))
      .map(title => ({ addSheet: { properties: { title } } }))

    if (addSheetRequests.length > 0) {
      console.log(`Creating missing sheets: ${addSheetRequests.map(r => r.addSheet.properties.title).join(', ')}`)
      await client.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: addSheetRequests }
      })
    }

    // 2. Seed Master Sheet with rich dummy trades
    console.log('Seeding Master sheet with realistic trade history...')
    await client.spreadsheets.values.clear({ spreadsheetId, range: 'Master' })

    const headers = [
      'ID', 'Date', 'Pair', 'Market', 'Direction', 'Status', 'Entry Price', 'Exit Price',
      'Size', 'PnL', 'MAE', 'MFE', 'Checklist Score', 'Tier', 'Rules Followed',
      'Mental Category', 'Emotions', 'Session', 'Strategies', 'Setups', 'Notes'
    ]

    const mockTrades = getMockTrades()
    const rows = mockTrades.map((trade, idx) => [
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
    console.log('Seeding Chips sheet with default tags...')
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
    console.log('Seeding Settings sheet with default configurations...')
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

    console.log('✅ Successfully seeded the entire spreadsheet with full dummy data, chips, and settings!')
  } catch (err: any) {
    console.error('Error seeding spreadsheet:', err.message)
    process.exit(1)
  }
}

seed()
