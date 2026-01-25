import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSheetsClient } from '../../../server/utils/googleSheets'
import { google } from 'googleapis'

// Mock useRuntimeConfig
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
  googleSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID
})))

vi.mock('googleapis', () => {
  const mockSheets = {
    spreadsheets: {
      values: {
        get: vi.fn(),
        append: vi.fn()
      }
    }
  }
  
  return {
    google: {
      auth: {
        GoogleAuth: vi.fn().mockImplementation(() => ({
          getClient: vi.fn().mockResolvedValue('mock-auth-client')
        }))
      },
      sheets: vi.fn().mockReturnValue(mockSheets)
    }
  }
})

describe('googleSheets utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@example.com'
    process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDZ\n-----END PRIVATE KEY-----'
    process.env.GOOGLE_SPREADSHEET_ID = 'sheet-id-123'
    
    // Reset useRuntimeConfig mock return value for each test
    vi.mocked(useRuntimeConfig).mockReturnValue({
      googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
      googleSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID
    })
  })

  it('initializes GoogleAuth with correct credentials and scopes', async () => {
    // Test with literal \n and quotes to simulate robust parsing
    const rawKey = '"-----BEGIN PRIVATE KEY-----\\nLINE1\\n-----END PRIVATE KEY-----"'
    const expectedKey = '-----BEGIN PRIVATE KEY-----\nLINE1\n-----END PRIVATE KEY-----'
    
    vi.mocked(useRuntimeConfig).mockReturnValue({
      googleServiceAccountEmail: 'test@example.com',
      googlePrivateKey: rawKey,
      googleSpreadsheetId: 'sheet-id-123'
    })

    await getSheetsClient()
    
    expect(google.auth.GoogleAuth).toHaveBeenCalledWith({
      credentials: {
        client_email: 'test@example.com',
        private_key: expectedKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
  })

  it('returns a sheets client', async () => {
    const client = await getSheetsClient()
    expect(client).toBeDefined()
    expect(google.sheets).toHaveBeenCalledWith({ version: 'v4', auth: 'mock-auth-client' })
  })

  it('throws and logs an error if credentials are missing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    vi.mocked(useRuntimeConfig).mockReturnValue({
      googleServiceAccountEmail: '',
      googlePrivateKey: '',
      googleSpreadsheetId: 'sheet-id-123'
    })

    await expect(getSheetsClient()).rejects.toThrow('Google Service Account credentials are missing')
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Google Service Account credentials are missing'))
    
    consoleSpy.mockRestore()
  })
})