import { google } from 'googleapis'
import { useRuntimeConfig } from '#imports'

export const getSheetsClient = async () => {
  const config = useRuntimeConfig()
  
  // Fallback to process.env for local dev if runtimeConfig isn't fully populated yet (though it should be)
  const serviceAccountEmail = config.googleServiceAccountEmail || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  let privateKey = config.googlePrivateKey || process.env.GOOGLE_PRIVATE_KEY

  if (!serviceAccountEmail || !privateKey) {
    console.error('Missing Credentials:', { 
      hasEmail: !!serviceAccountEmail, 
      hasKey: !!privateKey 
    })
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

  console.log('Initializing Google Sheets Client...')
  console.log('Email:', serviceAccountEmail)
  // Log key length for debugging
  console.log('Private Key Length:', privateKey.length)

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
