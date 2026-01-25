import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../../../server/api/config'
import * as googleSheets from '../../../server/utils/googleSheets'

// Mock useRuntimeConfig
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  googleSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || 'sheet-id-123'
})))

// Mock the googleSheets utility
vi.mock('../../../server/utils/googleSheets', () => ({
  getSheetsClient: vi.fn()
}))

describe('GET /api/config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_SPREADSHEET_ID = 'test-sheet-id'
  })

  it('fetches and parses chips from Google Sheets in column format', async () => {
    // Mocking response with majorDimension: 'COLUMNS'
    const mockColumns = [
      ['Strategy', 'Trend', 'Breakout'], // Column 1
      ['Psychology', 'FOMO', 'Revenge']  // Column 2
    ]

    const mockGet = vi.fn().mockResolvedValue({
      data: { values: mockColumns }
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
      range: 'Chips!A:ZZ',
      majorDimension: 'COLUMNS'
    })

    expect(response).toEqual([
      { id: 'Strategy', values: ['Trend', 'Breakout'] },
      { id: 'Psychology', values: ['FOMO', 'Revenge'] }
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