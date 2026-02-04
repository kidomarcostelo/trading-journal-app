import { describe, it, expect, vi, beforeEach } from 'vitest'
import { H3Event } from 'h3'
import handler from '../../../../server/api/trades/batch.put'

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
    readBody: mockReadBody,
    createError: (err: any) => err // simple pass through
  }
})

// Mock googleSheets utils
const mockValuesGet = vi.fn()
const mockValuesBatchGet = vi.fn()
const mockValuesBatchUpdate = vi.fn()

vi.mock('../../../../server/utils/googleSheets', () => ({
  getSheetsClient: vi.fn(() => ({
    spreadsheets: {
      values: {
        get: mockValuesGet,
        batchGet: mockValuesBatchGet,
        batchUpdate: mockValuesBatchUpdate
      }
    }
  }))
}))

describe('PUT /api/trades/batch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_SPREADSHEET_ID = 'test-sheet-id'
  })

  it('updates multiple trades successfully using batch operations', async () => {
    // 1. Get Headers
    mockValuesGet.mockResolvedValueOnce({ data: { values: [['ID', 'Pair', 'Status']] } }) 
    
    // 2. Get IDs
    // Mocking finding IDs: row 2 is '1', row 3 is '2'
    mockValuesGet.mockResolvedValueOnce({ data: { values: [['ID'], ['1'], ['2']] } }) 

    // 3. Batch Get Row Data
    // Expect ranges to be Master!A2:C2 and Master!A3:C3 (since rows are 2 and 3)
    mockValuesBatchGet.mockResolvedValueOnce({
      data: {
        valueRanges: [
          { values: [['1', 'BTC/USD', 'Open']] },
          { values: [['2', 'ETH/USD', 'Open']] }
        ]
      }
    })

    mockReadBody.mockResolvedValue([
      { ID: '1', Status: 'Closed' },
      { ID: '2', Status: 'Closed' }
    ])

    const result = await handler({} as H3Event)

    expect(result).toMatchObject({ success: true, count: 2 })
    
    // Verify optimization:
    // Should call get headers (1)
    // Should call get IDs (1)
    // Should call batchGet (1)
    // Should call batchUpdate (1)
    expect(mockValuesGet).toHaveBeenCalledTimes(2)
    expect(mockValuesBatchGet).toHaveBeenCalledTimes(1)
    expect(mockValuesBatchUpdate).toHaveBeenCalledTimes(1)

    // Verify correct update data
    expect(mockValuesBatchUpdate).toHaveBeenCalledWith(expect.objectContaining({
      requestBody: expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            values: [['1', 'BTC/USD', 'Closed']]
          }),
          expect.objectContaining({
            values: [['2', 'ETH/USD', 'Closed']]
          })
        ])
      })
    }))
  })

  it('throws error if body is not an array', async () => {
    mockReadBody.mockResolvedValue({ ID: '1' })
    await expect(handler({} as H3Event)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: 'Request body must be an array of trades.'
    })
  })
})