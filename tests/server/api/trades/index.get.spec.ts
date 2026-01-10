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

  it('fetches and parses trades using headers as keys', async () => {
    const mockValues = [
      ['Date', 'Pair', 'Entry Price', 'Tags'], // Header
      ['2023-01-01', 'BTC/USD', '50000', 'Trend']
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
      range: 'Master!A:Z',
      valueRenderOption: 'FORMULA' // Ensure we ask for formulas
    })

    // Verify dynamic key mapping
    expect(response).toEqual([
      {
        'Date': '2023-01-01',
        'Pair': 'BTC/USD',
        'Entry Price': '50000',
        'Tags': 'Trend'
      }
    ])
  })

  it('parses image formulas and comma-separated links correctly', async () => {
    const mockValues = [
      ['Date', 'Before Picture', 'After Picture'],
      ['2023-01-01', '=IMAGE("https://img1.com")', 'https://img2.com, https://img3.com']
    ]

    const mockGet = vi.fn().mockResolvedValue({
      data: { values: mockValues }
    })

    const mockClient = {
      spreadsheets: {
        values: { get: mockGet }
      }
    }
    vi.mocked(googleSheets.getSheetsClient).mockResolvedValue(mockClient as any)

    const response = await handler({} as any)

    expect(response).toEqual([
      {
        'Date': '2023-01-01',
        'Before Picture': ['https://img1.com'],
        'After Picture': ['https://img2.com', 'https://img3.com']
      }
    ])
  })
})
