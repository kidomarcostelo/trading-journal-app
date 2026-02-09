import { describe, it, expect, vi, beforeEach } from 'vitest'
import { H3Event } from 'h3'
import handler from '../../../../server/api/trades/index.delete'

// Mock useRuntimeConfig
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  googleSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || 'sheet-id-123'
})))

// Mock h3
const { mockGetQuery } = vi.hoisted(() => ({
  mockGetQuery: vi.fn()
}))

vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual as any,
    defineEventHandler: (handler: any) => handler,
    getQuery: mockGetQuery
  }
})

// Mock googleSheets utils
const { mockValuesGet, mockBatchUpdate, mockSpreadsheetsGet } = vi.hoisted(() => ({
  mockValuesGet: vi.fn(),
  mockBatchUpdate: vi.fn(),
  mockSpreadsheetsGet: vi.fn()
}))

vi.mock('../../../../server/utils/googleSheets', () => ({
  getSheetsClient: vi.fn(() => ({
    spreadsheets: {
      get: mockSpreadsheetsGet,
      values: {
        get: mockValuesGet
      },
      batchUpdate: mockBatchUpdate
    }
  })),
  findRowIndexById: vi.fn(async (client, spreadsheetId, id) => {
      // Re-implement minimal logic for test or use actual
      if (id === '2') return 3 // matching the test case expectation
      if (id === '999') return -1
      return -1
  }),
  deleteRow: vi.fn(async (client, spreadsheetId, index) => {
      // Mock deleteRow by calling batchUpdate so we can verify it
      await client.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0,
                  dimension: 'ROWS',
                  startIndex: index - 1,
                  endIndex: index
                }
              }
            }
          ]
        }
      })
  }),
  getColumnLetter: (i: number) => {
      let letter = '';
      while (i >= 0) {
        letter = String.fromCharCode((i % 26) + 65) + letter;
        i = Math.floor(i / 26) - 1;
      }
      return letter;
  }
}))

describe('DELETE /api/trades', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_SPREADSHEET_ID = 'test-sheet-id'
    
    // Default mock for spreadsheets.get
    mockSpreadsheetsGet.mockResolvedValue({
      data: {
        sheets: [
          {
            properties: {
              title: 'Master',
              sheetId: 0
            }
          }
        ]
      }
    })
  })

  it('deletes an existing trade by ID', async () => {
    // Mock getting headers to find ID column
    mockValuesGet.mockResolvedValueOnce({
      data: { values: [['ID', 'Pair', 'Entry Price']] }
    })
    
    // Mock getting ID column (to find row index)
    // ID '2' is at index 2 (row 3)
    mockValuesGet.mockResolvedValueOnce({
      data: { values: [['ID'], ['1'], ['2'], ['3']] } 
    })

    const event = {
      node: {
        req: {
          method: 'DELETE'
        }
      }
    } as unknown as H3Event

    // Mock getQuery
    mockGetQuery.mockReturnValue({
      id: '2'
    })

    const result = await handler(event)

    expect(result).toMatchObject({ success: true })
    
    // Verify batchUpdate call for row deletion
    // Sheet index is 0-based for batchUpdate deleteDimension
    // Row 3 is index 2.
    expect(mockBatchUpdate).toHaveBeenCalledWith(expect.objectContaining({
      spreadsheetId: 'test-sheet-id',
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // Assuming first sheet for now or we need to fetch sheetId
                dimension: 'ROWS',
                startIndex: 2,
                endIndex: 3
              }
            }
          }
        ]
      }
    }))
  })

  it('throws error if ID not provided', async () => {
    mockGetQuery.mockReturnValue({})

    await expect(handler({} as any)).rejects.toThrow('Trade ID is required')
  })

  it('throws error if trade not found', async () => {
    mockValuesGet.mockResolvedValueOnce({
      data: { values: [['ID']] }
    })
    mockValuesGet.mockResolvedValueOnce({
      data: { values: [['ID'], ['1']] }
    })
    mockGetQuery.mockReturnValue({ id: '999' })

    await expect(handler({} as any)).rejects.toThrow('Trade with ID 999 not found')
  })
})
