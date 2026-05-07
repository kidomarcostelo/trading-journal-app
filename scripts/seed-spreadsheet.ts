import { google } from 'googleapis'
import dotenv from 'dotenv'

dotenv.config()

async function seed() {
  const serviceAccountEmail = process.env.NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL
  let privateKey = process.env.NUXT_GOOGLE_PRIVATE_KEY
  const spreadsheetId = process.env.NUXT_GOOGLE_SPREADSHEET_ID

  if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
    console.error('Missing required environment variables. Please check your .env file.')
    console.error('Required: NUXT_GOOGLE_SERVICE_ACCOUNT_EMAIL, NUXT_GOOGLE_PRIVATE_KEY, NUXT_GOOGLE_SPREADSHEET_ID')
    process.exit(1)
  }

  // Same logic as getSheetsClient
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

  console.log('Clearing existing Master sheet data...')
  
  try {
    await client.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Master',
    })
    
    console.log('Seeding new data into Master sheet...')
    const headers = [
      'ID', 'Date', 'Symbol', 'Direction', 'Quantity', 'EntryPrice', 'ExitPrice', 'PnL', 'Status', 'Notes', 'Tags'
    ]
    
    // Create some sample data
    const seedData = [
      headers,
      ['1', '01/05/2026', 'AAPL', 'Long', '100', '150.00', '155.00', '500.00', 'Closed', 'Earnings run up', 'Tech,Swing'],
      ['2', '01/10/2026', 'TSLA', 'Short', '50', '200.00', '195.00', '250.00', 'Closed', 'Trend line break', 'EV,Day'],
      ['3', '01/15/2026', 'MSFT', 'Long', '200', '350.00', '', '', 'Open', 'Holding for new high', 'Tech,Core'],
      ['4', '01/20/2026', 'NVDA', 'Long', '20', '500.00', '480.00', '-400.00', 'Closed', 'Stopped out', 'AI,Day']
    ]

    await client.spreadsheets.values.update({
      spreadsheetId,
      range: 'Master!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: seedData
      }
    })

    console.log('Successfully seeded the spreadsheet!')
  } catch (err: any) {
    console.error('Error seeding spreadsheet:', err.message)
    process.exit(1)
  }
}

seed()
