import { describe, it, expect, vi, beforeEach } from 'vitest'
import getConfig from '../../../server/api/config.get'

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

describe('GET /api/config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and parse chips correctly', async () => {
    // Mock Sheets API response
    // Columns: Strategy, Psychology
    // Rows: [Breakout, FOMO], [Reversal, '']
    mockSheetsClient.spreadsheets.values.get.mockResolvedValue({
      data: {
        values: [
          ['Strategy', 'Psychology'], // Headers
          ['Breakout', 'FOMO'],       // Row 1
          ['Reversal', '']            // Row 2
        ]
      }
    })

    const response = await getConfig({} as any)

    expect(mockSheetsClient.spreadsheets.values.get).toHaveBeenCalledWith({
      spreadsheetId: 'test-sheet-id',
      range: 'Chips'
    })

    expect(response).toEqual({
      Strategy: ['Breakout', 'Reversal'],
      Psychology: ['FOMO']
    })
  })

  it('should handle empty sheets gracefully', async () => {
    mockSheetsClient.spreadsheets.values.get.mockResolvedValue({
      data: { values: [] }
    })

    const response = await getConfig({} as any)
    expect(response).toEqual({})
  })

  it('should trim whitespace from values', async () => {
      mockSheetsClient.spreadsheets.values.get.mockResolvedValue({
      data: {
        values: [
          ['Category'],
          ['  Value  ']
        ]
      }
    })

    const response = await getConfig({} as any)
    expect(response).toEqual({
        Category: ['Value']
    })
  })
})
