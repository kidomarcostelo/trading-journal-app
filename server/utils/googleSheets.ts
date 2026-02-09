import { google } from 'googleapis'

export const getSheetsClient = async () => {
  const config = useRuntimeConfig()
  const serviceAccountEmail = config.googleServiceAccountEmail
  let privateKey = config.googlePrivateKey

  if (!serviceAccountEmail || !privateKey) {
    const errorMsg = 'Google Service Account credentials are missing. Check GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.'
    console.error(`[GoogleSheets] ${errorMsg}`)
    throw new Error(errorMsg)
  }

  // Robust Private Key Parsing:
  privateKey = privateKey.trim()
  
  // Clean up quotes if wrapped
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }

  // Check if the key is Base64 encoded (doesn't start with hyphen)
  // If so, decode it first
  if (!privateKey.startsWith('-----')) {
    try {
      const decoded = Buffer.from(privateKey, 'base64').toString('utf-8')
      if (decoded.includes('-----BEGIN PRIVATE KEY-----')) {
        privateKey = decoded
      }
    } catch (e) {
      // Ignore error, assume it's just a malformed plain key if decode fails
    }
  }

  const header = '-----BEGIN PRIVATE KEY-----'
  const footer = '-----END PRIVATE KEY-----'
  
  if (privateKey.includes(header) && privateKey.includes(footer)) {
    // 1. Extract the content between header and footer
    const startIdx = privateKey.indexOf(header) + header.length
    const endIdx = privateKey.indexOf(footer)
    let body = privateKey.substring(startIdx, endIdx)
    
    // 2. Nuclear Clean: Remove all literal "\n" strings, actual newlines, and all whitespace
    // This makes the parser immune to how the secret is pasted (single line, multi-line, escaped, etc.)
    body = body.replace(/\\n/g, '') // Remove backslash-n
    body = body.replace(/\s/g, '')   // Remove all whitespace/newlines
    
    // 3. Reconstruct perfectly with real newlines
    privateKey = `${header}\n${body}\n${footer}`
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const authClient = await auth.getClient()

  return google.sheets({ version: 'v4', auth: authClient as any })
}

export function getColumnLetter(index: number): string {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

export async function findRowIndexById(client: any, spreadsheetId: string, tradeId: string | number): Promise<number> {
  // 1. Fetch Headers
  const headerResponse = await client.spreadsheets.values.get({
    spreadsheetId,
    range: 'Master!1:1',
  })

  const headers = headerResponse.data.values?.[0]
  if (!headers || headers.length === 0) {
    throw new Error('Master sheet has no headers.')
  }

  // 2. Find ID Column
  const idIndex = headers.findIndex((h: string) => h.toLowerCase() === 'id')
  if (idIndex === -1) {
    throw new Error('ID column not found in sheet.')
  }

  const colLetter = getColumnLetter(idIndex)
  const idResponse = await client.spreadsheets.values.get({
    spreadsheetId,
    range: `Master!${colLetter}:${colLetter}`,
  })

  const idValues = idResponse.data.values?.flat() || []
  
  let sheetRowIndex = -1

  // Check if ID is a generated "row-X" ID
  if (String(tradeId).startsWith('row-')) {
    const dataIndex = parseInt(String(tradeId).replace('row-', ''), 10)
    if (!isNaN(dataIndex)) {
      // dataIndex 0 is the first row AFTER header.
      // Header is Row 1. Data Row 0 is Row 2.
      sheetRowIndex = dataIndex + 2
    }
  }

  // If not found yet, try standard lookup
  if (sheetRowIndex === -1) {
    // idValues[0] is Header 'ID'. idValues[1] is row 2.
    const rowIndexInData = idValues.findIndex((val: string) => String(val) === String(tradeId))
    if (rowIndexInData !== -1) {
      sheetRowIndex = rowIndexInData + 1 // 1-based row index
    }
  }
  
  return sheetRowIndex
}

export async function deleteRow(client: any, spreadsheetId: string, rowIndex: number) {
  // To use deleteDimension, we need the sheetId (the internal numeric ID, not the spreadsheetId)
  // We can fetch it by name 'Master'
  const sheetInfo = await client.spreadsheets.get({
    spreadsheetId,
  })

  const sheet = sheetInfo.data.sheets?.find((s: any) => s.properties.title === 'Master')
  if (!sheet) {
    throw new Error("Sheet 'Master' not found.")
  }

  const sheetId = sheet.properties.sheetId

  await client.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1, // 0-based for API
              endIndex: rowIndex
            }
          }
        }
      ]
    }
  })
}