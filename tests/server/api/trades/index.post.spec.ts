import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../../../../server/api/trades/index.post'
import * as googleSheets from '../../../../server/utils/googleSheets'
import { readBody } from 'h3'

vi.mock('../../../../server/utils/googleSheets', () => ({
  getSheetsClient: vi.fn()
}))

vi.mock('h3', () => ({
  defineEventHandler: (fn: any) => fn,
  readBody: vi.fn()
}))

describe('POST /api/trades', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_SPREADSHEET_ID = 'test-sheet-id'
    global.crypto.randomUUID = vi.fn().mockReturnValue('mock-uuid')
    // Mock Date
    vi.setSystemTime(new Date('2023-01-01T12:00:00Z'))
  })

  it('appends a new trade dynamically matching sheet headers', async () => {
    // 1. Setup headers in sheet
    const mockHeaders = ['ID', 'Created At', 'Pair', 'Before Picture', 'Tags']
    
    // 2. Setup Input Body (matching headers)
    const mockBody = {
      'Pair': 'BTC/USD',
      'Before Picture': ['http://img1.com', 'http://img2.com'],
      'Tags': ['Trend', 'Long']
    }
    
    vi.mocked(readBody).mockResolvedValue(mockBody)

    // 3. Mock Google Sheets Responses
    const mockGet = vi.fn().mockResolvedValue({
      data: { values: [mockHeaders] }
    })

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

    expect(googleSheets.getSheetsClient).toHaveBeenCalled()
    
    // Expect GET to fetch headers
    expect(mockGet).toHaveBeenCalledWith({
      spreadsheetId: 'test-sheet-id',
      range: 'Master!1:1', // Fetch first row only
    })

    // Expect APPEND with correctly mapped values
    expect(mockAppend).toHaveBeenCalledWith({
      spreadsheetId: 'test-sheet-id',
      range: 'Master!A:A', // Append to sheet (A:A usually implies append to end)
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          'mock-uuid', // ID (Auto-generated)
          '2023-01-01T12:00:00.000Z', // Created At (Auto-generated)
          'BTC/USD', // Pair
          'http://img1.com,http://img2.com', // Before Picture (Joined Array)
          'Trend,Long' // Tags (Joined Array)
        ]]
      }
    })
    
    // Response should include generated fields
    expect(response).toMatchObject({
      'ID': 'mock-uuid',
      'Created At': '2023-01-01T12:00:00.000Z',
      ...mockBody
    })
  })
})