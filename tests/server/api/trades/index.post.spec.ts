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
    // Mock crypto.randomUUID
    global.crypto.randomUUID = vi.fn().mockReturnValue('mock-uuid')
  })

  it('appends a new trade to Google Sheets', async () => {
    const mockBody = {
      date: '2023-01-01',
      pair: 'BTC/USD',
      type: 'Long',
      entryPrice: 50000,
      size: 1,
      tags: ['s1', 'p1']
    }
    
    vi.mocked(readBody).mockResolvedValue(mockBody)

    const mockAppend = vi.fn().mockResolvedValue({
      data: { updates: { updatedCells: 1 } }
    })

    const mockClient = {
      spreadsheets: {
        values: {
          append: mockAppend
        }
      }
    }

    vi.mocked(googleSheets.getSheetsClient).mockResolvedValue(mockClient as any)

    const response = await handler({} as any)

    expect(googleSheets.getSheetsClient).toHaveBeenCalled()
    expect(mockAppend).toHaveBeenCalledWith({
      spreadsheetId: 'test-sheet-id',
      range: 'Master!A:N',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          'mock-uuid', // ID
          expect.any(String), // CreatedAt
          '2023-01-01',
          'BTC/USD',
          'Long',
          50000,
          '', // Exit
          1, // Size
          '', // PnL
          '', // PnL%
          '', // ImgBefore
          '', // ImgAfter
          '', // Notes
          's1,p1' // Tags
        ]]
      }
    })
    
    expect(response).toMatchObject({
      id: 'mock-uuid',
      ...mockBody
    })
  })
})
