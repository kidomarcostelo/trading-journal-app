import { describe, it, expect, vi, beforeEach } from 'vitest'
import getTrades from '../../../server/api/trades.get'

// Mocking dependencies
const { mockSheetsClient } = vi.hoisted(() => ({
  mockSheetsClient: {
    spreadsheets: {
      values: {
        get: vi.fn()
      }
    }
  }
}))

vi.mock('../../../server/utils/googleSheets', () => ({
  getGoogleSheetsClient: vi.fn().mockResolvedValue(mockSheetsClient)
}))

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    googleSpreadsheetId: 'test-sheet-id'
  }),
  defineEventHandler: (handler: any) => handler
}))

describe('GET /api/trades', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and parse trades correctly', async () => {
    // Headers: Date, Pair, Entry, Exit, PnL, Before, After, Tags (JSON), Notes
    mockSheetsClient.spreadsheets.values.get.mockResolvedValue({
      data: {
        values: [
          ['Date', 'Pair', 'Entry', 'Exit', 'PnL', 'Before', 'After', 'Tags', 'Notes'],
          ['2023-01-01', 'BTCUSD', '50000', '51000', '1000', 'img1.png', 'img2.png', '{"Strategy": "Breakout"}', 'Good trade']
        ]
      }
    })

    const response = await getTrades({} as any)

    expect(mockSheetsClient.spreadsheets.values.get).toHaveBeenCalledWith({
      spreadsheetId: 'test-sheet-id',
      range: 'Master!A:Z'
    })

    expect(response).toHaveLength(1)
    expect(response[0]).toEqual({
      id: expect.any(String), // We generate ID (maybe uuid or index)
      rowIndex: 2, // 1-based index matching Sheet row numbers (Header is row 1)
      date: '2023-01-01',
      pair: 'BTCUSD',
      entryPrice: 50000,
      exitPrice: 51000,
      pnl: 1000,
      imagesBefore: ['img1.png'],
      imagesAfter: ['img2.png'],
      tags: { Strategy: 'Breakout' },
      notes: 'Good trade'
    })
  })

  it('should handle empty master sheet', async () => {
    mockSheetsClient.spreadsheets.values.get.mockResolvedValue({
      data: { values: [] }
    })

    const response = await getTrades({} as any)
    expect(response).toEqual([])
  })
})
