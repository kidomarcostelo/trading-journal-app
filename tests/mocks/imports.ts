import { vi } from 'vitest'

export const useRuntimeConfig = vi.fn(() => ({
  googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
  googleSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
  public: {}
}))
