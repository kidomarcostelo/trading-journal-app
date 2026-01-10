import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../../../../server/api/trades/index.get'
import * as googleSheets from '../../../../server/utils/googleSheets'

// Mock the googleSheets utility
vi.mock('../../../../server/utils/googleSheets', () => ({
  getSheetsClient: vi.fn()
}))

describe('GET /api/trades', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_SPREADSHEET_ID = 'test-sheet-id'
  })

  it('fetches and parses trades from Google Sheets', async () => {
    const mockValues = [
      ['id', 'createdAt', 'date', 'pair', 'type', 'entry', 'exit', 'size', 'pnl', 'pnl%', 'imgBefore', 'imgAfter', 'notes', 'tags'], // Header
      ['t1', '2023-01-01T10:00:00Z', '2023-01-01', 'BTC/USD', 'Long', '50000', '51000', '1', '1000', '2', 'url1', 'url2', 'Good trade', 's1,p1']
    ]

    const mockGet = vi.fn().mockResolvedValue({
      data: { values: mockValues }
    })

    const mockClient = {
      spreadsheets: {
        values: {
          get: mockGet
        }
      }
    }

    vi.mocked(googleSheets.getSheetsClient).mockResolvedValue(mockClient as any)

    const response = await handler({} as any)

    expect(googleSheets.getSheetsClient).toHaveBeenCalled()
    expect(mockGet).toHaveBeenCalledWith({
      spreadsheetId: 'test-sheet-id',
      range: 'Master!A:N', // Assuming 14 columns
    })

    expect(response).toEqual([
      {
        id: 't1',
        createdAt: '2023-01-01T10:00:00Z',
        date: '2023-01-01',
        pair: 'BTC/USD',
        type: 'Long',
        entryPrice: 50000,
        exitPrice: 51000,
        size: 1,
        pnl: 1000,
        pnlPercentage: 2,
        imageBefore: 'url1',
        imageAfter: 'url2',
        notes: 'Good trade',
        tags: ['s1', 'p1']
      }
    ])
  })

  it('handles empty sheet', async () => {
    const mockGet = vi.fn().mockResolvedValue({
      data: { values: [] }
    })
    
    const mockClient = {
      spreadsheets: { values: { get: mockGet } }
    }
    vi.mocked(googleSheets.getSheetsClient).mockResolvedValue(mockClient as any)

    const response = await handler({} as any)
    expect(response).toEqual([])
  })
})
