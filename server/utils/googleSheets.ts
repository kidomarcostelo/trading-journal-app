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

  console.log('[Debug] Key Length:', privateKey.length)
  console.log('[Debug] Key Start:', JSON.stringify(privateKey.substring(0, 40)))
  console.log('[Debug] Key End:', JSON.stringify(privateKey.substring(privateKey.length - 40)))

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