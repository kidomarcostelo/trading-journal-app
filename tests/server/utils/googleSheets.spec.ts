import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSheetsClient, getColumnLetter, findRowIndexById, deleteRow } from '../../../server/utils/googleSheets'
import { google } from 'googleapis'

// Mock useRuntimeConfig
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
  googleSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID
})))

const { mockSheets } = vi.hoisted(() => ({
  mockSheets: {
    spreadsheets: {
      get: vi.fn(),
      batchUpdate: vi.fn(),
      values: {
        get: vi.fn(),
        append: vi.fn()
      }
    }
  }
}))

vi.mock('googleapis', () => {
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

  describe('getColumnLetter', () => {
    it('returns correct column letters', () => {
      expect(getColumnLetter(0)).toBe('A')
      expect(getColumnLetter(25)).toBe('Z')
      expect(getColumnLetter(26)).toBe('AA')
    })
  })

  describe('findRowIndexById', () => {
    it('finds row index for a standard ID', async () => {
      const mockClient = mockSheets
      mockClient.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [['ID', 'Other']] }
      })
      mockClient.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [['ID'], ['id-1'], ['id-2']] }
      })

      const index = await findRowIndexById(mockClient, 'sid', 'id-2')
      expect(index).toBe(3) // Header is 1, id-1 is 2, id-2 is 3
    })

    it('finds row index for a row-X ID', async () => {
      const mockClient = mockSheets
      mockClient.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [['ID', 'Other']] }
      })
      mockClient.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [['ID'], ['id-1'], ['id-2']] }
      })

      const index = await findRowIndexById(mockClient, 'sid', 'row-0')
      expect(index).toBe(2) // row-0 corresponds to the first data row (Row 2)
    })

    it('returns -1 if ID not found', async () => {
      const mockClient = mockSheets
      mockClient.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [['ID']] }
      })
      mockClient.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [['ID'], ['id-1']] }
      })

      const index = await findRowIndexById(mockClient, 'sid', 'nonexistent')
      expect(index).toBe(-1)
    })
  })

  describe('deleteRow', () => {
    it('calls batchUpdate with correct parameters', async () => {
      const mockClient = mockSheets
      mockClient.spreadsheets.get.mockResolvedValueOnce({
        data: {
          sheets: [{ properties: { title: 'Master', sheetId: 123 } }]
        }
      })

      await deleteRow(mockClient, 'sid', 5)

      expect(mockClient.spreadsheets.batchUpdate).toHaveBeenCalledWith({
        spreadsheetId: 'sid',
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 123,
                  dimension: 'ROWS',
                  startIndex: 4,
                  endIndex: 5
                }
              }
            }
          ]
        }
      })
    })
  })

  describe('getSheetsClient', () => {
    it('initializes GoogleAuth with correct credentials and scopes', async () => {
      // Test with standard formatted key
      const rawKey = '-----BEGIN PRIVATE KEY-----\nLINE1\n-----END PRIVATE KEY-----'
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

  it('Nuclear Option: fixes keys with mixed newlines, spaces, and literal \n', async () => {
    // This simulates the messy inputs we've seen
    const rawKey = ` -----BEGIN PRIVATE KEY----- LINE1 \n LINE2 
    LINE3 -----END PRIVATE KEY----- `
    const expectedKey = '-----BEGIN PRIVATE KEY-----\nLINE1LINE2LINE3\n-----END PRIVATE KEY-----'
    
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

  it('handles Base64 encoded keys (safe for CI/CD)', async () => {
    const rawKey = '-----BEGIN PRIVATE KEY-----\nLINE1\n-----END PRIVATE KEY-----'
    const base64Key = Buffer.from(rawKey).toString('base64')
    
    vi.mocked(useRuntimeConfig).mockReturnValue({
      googleServiceAccountEmail: 'test@example.com',
      googlePrivateKey: base64Key,
      googleSpreadsheetId: 'sheet-id-123'
    })

    await getSheetsClient()
    
    expect(google.auth.GoogleAuth).toHaveBeenCalledWith({
      credentials: {
        client_email: 'test@example.com',
        private_key: rawKey, // Should be decoded back to original
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
  })
})