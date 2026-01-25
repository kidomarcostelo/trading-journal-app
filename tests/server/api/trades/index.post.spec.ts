import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../../../../server/api/trades/index.post'
import * as googleSheets from '../../../../server/utils/googleSheets'
import { readBody } from 'h3'

// Mock useRuntimeConfig
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  googleSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || 'sheet-id-123'
})))

vi.mock('../../../../server/utils/googleSheets', () => ({
  getSheetsClient: vi.fn()
}))

vi.mock('h3', () => ({
  defineEventHandler: (fn: any) => fn,
  readBody: vi.fn(),
  createError: vi.fn((err) => err)
}))

describe('POST /api/trades', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_SPREADSHEET_ID = 'test-sheet-id'
    // Mock Date to a fixed value
    vi.setSystemTime(new Date('2023-01-05T12:00:00Z')) 
  })

  it('appends a new trade with auto-increment ID and formatted date', async () => {
    // 1. Setup headers in sheet
    const mockHeaders = ['ID', 'Created At', 'Pair']
    
    // 2. Setup Input Body
    const mockBody = {
      'Pair': 'BTC/USD',
    }
    
    vi.mocked(readBody).mockResolvedValue(mockBody)

    // 3. Mock Google Sheets Responses
    const mockGetHeaders = vi.fn().mockResolvedValueOnce({
      data: { values: [mockHeaders] }
    })
    
    // Mock ID Column Fetch (assuming ID is Col A)
    // Returns header + existing IDs
    const mockGetIds = vi.fn().mockResolvedValueOnce({
      data: { values: [['ID'], ['1'], ['5'], ['10']] }
    })

    // Combine mocks for consecutive calls to .get()
    const mockGet = vi.fn()
      .mockImplementationOnce(() => mockGetHeaders()) // 1st call: Headers
      .mockImplementationOnce(() => mockGetIds())     // 2nd call: ID Column

    const mockAppend = vi.fn().mockResolvedValue({
      data: { updates: { updatedCells: 1 } }
    })

    const mockClient = {
      spreadsheets: {
        values: {
          get: mockGet,
          append: mockAppend
        }
      }
    }

    vi.mocked(googleSheets.getSheetsClient).mockResolvedValue(mockClient as any)

    const response = await handler({} as any)

    // Verify Date Formatting (mm/dd/yyyy)
    // 2023-01-05 -> 01/05/2023
    
    expect(mockGet).toHaveBeenCalledTimes(2)
    
    // Check increment logic: Max ID is 10, so next should be 11.
    expect(mockAppend).toHaveBeenCalledWith(expect.objectContaining({
      requestBody: {
        values: [[
          '11', // ID
          '01/05/2023', // Formatted Date
          'BTC/USD'
        ]]
      }
    }))
    
    expect(response).toMatchObject({
      'ID': '11',
      'Created At': '01/05/2023',
    })
  })
})
