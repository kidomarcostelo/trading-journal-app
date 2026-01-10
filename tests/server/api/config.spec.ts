import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../../../server/api/config'
import * as googleSheets from '../../../server/utils/googleSheets'

// Mock the googleSheets utility
vi.mock('../../../server/utils/googleSheets', () => ({
  getSheetsClient: vi.fn()
}))

describe('GET /api/config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_SPREADSHEET_ID = 'test-sheet-id'
  })

  it('fetches and parses chips from Google Sheets', async () => {
    const mockValues = [
      ['id', 'label', 'color', 'category'], // Header
      ['1', 'Trend Following', 'blue', 'Strategy'],
      ['2', 'FOMO', 'red', 'Psychology']
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

    // Simulate h3 event (can be minimal for this handler)
    const event = {} as any
    const response = await handler(event)

    expect(googleSheets.getSheetsClient).toHaveBeenCalled()
    expect(mockGet).toHaveBeenCalledWith({
      spreadsheetId: 'test-sheet-id',
      range: 'Chips!A:D', // Assuming 4 columns
    })

    expect(response).toEqual([
      { id: '1', label: 'Trend Following', color: 'blue', category: 'Strategy' },
      { id: '2', label: 'FOMO', color: 'red', category: 'Psychology' }
    ])
  })

  it('handles empty sheet', async () => {
    const mockGet = vi.fn().mockResolvedValue({
      data: { values: [] }
    })
    
    const mockClient = {
      spreadsheets: {
        values: { get: mockGet }
      }
    }
    vi.mocked(googleSheets.getSheetsClient).mockResolvedValue(mockClient as any)

    const response = await handler({} as any)
    expect(response).toEqual([])
  })
})
