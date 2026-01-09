import { google } from 'googleapis'
import { useRuntimeConfig } from '#imports'

export const getGoogleSheetsClient = async () => {
  const config = useRuntimeConfig()

  const auth = new google.auth.JWT(
    config.googleServiceAccountEmail,
    null,
    config.googlePrivateKey,
    ['https://www.googleapis.com/auth/spreadsheets']
  )

  await auth.authorize()

  return google.sheets({ version: 'v4', auth })
}
