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
  // 1. Trim whitespace and remove surrounding quotes if present
  privateKey = privateKey.trim()
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }

  // 2. Replace literal "\n" strings with actual newline characters
  // This is common when copying from JSON files or environment variable lists
  privateKey = privateKey.replace(/\\n/g, '\n')

  // 3. Fix potential "missing backslash" issue where \n became just n
  // This happens in some CI/CD pipelines or copy-paste errors
  const header = '-----BEGIN PRIVATE KEY-----'
  const footer = '-----END PRIVATE KEY-----'
  
  if (privateKey.includes(header) && privateKey.includes(footer)) {
    // If header is followed immediately by 'n' or ' ', fix it
    // Use a regex that looks for the header followed by 'n' or space, but ensure we don't break valid keys
    // We'll just force the header/footer to have newlines around them.
    
    // First, strip the header and footer to get the body
    let body = privateKey.replace(header, '').replace(footer, '').trim()
    
    // If the body starts with 'n', remove it (it was likely the \n separator)
    if (body.startsWith('n')) {
        body = body.substring(1)
    }
    // If the body ends with 'n', remove it
    if (body.endsWith('n')) {
        body = body.substring(0, body.length - 1)
    }

    // Reconstruct the key with proper newlines
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