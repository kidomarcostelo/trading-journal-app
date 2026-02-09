import { describe, it, expect, vi, beforeEach } from 'vitest'
import { H3Event } from 'h3'
import handler from '../../../../server/api/trades/index.put'

// Mock useRuntimeConfig
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  googleSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || 'sheet-id-123'
})))

// Mock h3
const { mockReadBody } = vi.hoisted(() => ({
  mockReadBody: vi.fn()
}))

vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual as any,
    defineEventHandler: (handler: any) => handler,
    readBody: mockReadBody
  }
})

// Mock googleSheets utils
const { mockValuesGet, mockValuesUpdate } = vi.hoisted(() => ({
  mockValuesGet: vi.fn(),
  mockValuesUpdate: vi.fn()
}))

vi.mock('../../../../server/utils/googleSheets', () => ({
  getSheetsClient: vi.fn(() => ({
    spreadsheets: {
      values: {
        get: mockValuesGet,
        update: mockValuesUpdate
      }
    }
  })),
  findRowIndexById: vi.fn(async (client, spreadsheetId, id) => {
      if (id === '2') return 3
      return -1
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

describe('PUT /api/trades', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_SPREADSHEET_ID = 'test-sheet-id'
  })

  it('updates an existing trade by ID', async () => {
    // Mock getting headers
    mockValuesGet.mockResolvedValueOnce({
      data: { values: [['ID', 'Pair', 'Entry Price']] }
    })
    
    // Mock getting ID column (to find row index)
    mockValuesGet.mockResolvedValueOnce({
      data: { values: [['ID'], ['1'], ['2']] } 
    })

    // Mock getting existing row data
    mockValuesGet.mockResolvedValueOnce({
      data: { values: [['2', 'ETH/USD', '50000']] }
    })

    const event = {
      node: {
        req: {
          method: 'PUT',
          headers: { 'content-type': 'application/json' }
        }
      },
      _readBody: true // fake internal
    } as unknown as H3Event

    // Mock readBody
    mockReadBody.mockResolvedValue({
      ID: '2',
      'Entry Price': 55000
    })

    const result = await handler(event)

    expect(result).toMatchObject({ success: true })
    
    // Verify update call
    // Expect update to row 3 (header + index 1 + 1 for 1-based = 3)
    // Wait, get values returns data. The first call gets headers. 
    // The second call searches IDs. '1' is row 2, '2' is row 3.
    expect(mockValuesUpdate).toHaveBeenCalledWith(expect.objectContaining({
      spreadsheetId: 'test-sheet-id',
      range: expect.stringContaining('Master!'), // Specific range logic to be determined
      valueInputOption: 'USER_ENTERED'
    }))
  })

  it('throws error if ID not provided', async () => {
    mockReadBody.mockResolvedValue({
      Pair: 'BTC/USD'
    })

    await expect(handler({} as any)).rejects.toThrow('Trade ID is required')
  })
})
