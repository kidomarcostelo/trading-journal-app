import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSheetsClient } from '../../../server/utils/googleSheets'
import { google } from 'googleapis'

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
  })

  it('initializes GoogleAuth with correct credentials and scopes', async () => {
    await getSheetsClient()
    
    expect(google.auth.GoogleAuth).toHaveBeenCalledWith({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
  })

  it('returns a sheets client', async () => {
    const client = await getSheetsClient()
    expect(client).toBeDefined()
    expect(google.sheets).toHaveBeenCalledWith({ version: 'v4', auth: 'mock-auth-client' })
  })
})

