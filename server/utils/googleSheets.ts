import { google } from 'googleapis'

export const getSheetsClient = async () => {
  const config = useRuntimeConfig()
  const serviceAccountEmail = config.googleServiceAccountEmail
  let privateKey = config.googlePrivateKey

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Google Service Account credentials are missing')
  }

  // Handle various newline scenarios:
  // 1. Literal "\n" characters (common in .env or some secret managers)
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n')
  }
  
  // 2. Ensure it's not wrapped in extra quotes if passed via environment
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }

  // 3. Fix standard key formatting if newlines are missing (spaces instead)
  // This is safe because standard PEM keys don't have spaces inside the base64 block
  // but do have spaces in the header/footer.
  // We want to preserve headers but break the body. 
  // A safer bet for now is ensuring the headers are on their own lines.
  if (!privateKey.includes('\n')) {
      const header = '-----BEGIN PRIVATE KEY-----'
      const footer = '-----END PRIVATE KEY-----'
      if (privateKey.includes(header) && privateKey.includes(footer)) {
          const body = privateKey.replace(header, '').replace(footer, '').trim().replace(/ /g, '\n')
          privateKey = `${header}\n${body}\n${footer}`
      }
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
