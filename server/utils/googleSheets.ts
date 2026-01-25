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