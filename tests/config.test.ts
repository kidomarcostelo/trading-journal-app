import { describe, it, expect } from 'vitest'

describe('Environment Config', () => {
  it('should have environment variables defined', () => {
    expect(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL).toBeDefined()
    expect(process.env.GOOGLE_PRIVATE_KEY).toBeDefined()
    expect(process.env.GOOGLE_SPREADSHEET_ID).toBeDefined()
  })
})
