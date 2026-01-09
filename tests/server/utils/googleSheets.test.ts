import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getGoogleSheetsClient } from '../../../server/utils/googleSheets'

// Use vi.hoisted to create mock objects that can be referenced inside vi.mock
const { mockJWT, mockSheets } = vi.hoisted(() => {
  return {
    mockJWT: vi.fn().mockImplementation(() => ({
      authorize: vi.fn().mockResolvedValue(true)
    })),
    mockSheets: vi.fn().mockReturnValue('mocked-sheets-client')
  }
})

vi.mock('googleapis', () => ({
  google: {
    auth: {
      JWT: mockJWT
    },
    sheets: mockSheets
  }
}))

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    googleServiceAccountEmail: 'test@example.com',
    googlePrivateKey: 'test-key',
    googleSpreadsheetId: 'test-sheet-id'
  })
}))

describe('Google Sheets Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize JWT with correct credentials', async () => {
    const client = await getGoogleSheetsClient()

    expect(mockJWT).toHaveBeenCalledWith(
      'test@example.com',
      null,
      'test-key',
      ['https://www.googleapis.com/auth/spreadsheets']
    )
    expect(client).toBe('mocked-sheets-client')
  })

  it('should create sheets client with auth', async () => {
     await getGoogleSheetsClient()
     // Check if sheets was called with version and auth
     expect(mockSheets).toHaveBeenCalledWith({
       version: 'v4',
       auth: expect.any(Object)
     })
  })
})
