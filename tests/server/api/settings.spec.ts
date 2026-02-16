import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSettings, saveSettings } from '../../../server/utils/settings'
import * as googleSheets from '../../../server/utils/googleSheets'

// Mock useRuntimeConfig
vi.stubGlobal('useRuntimeConfig', () => ({
  googleSpreadsheetId: 'test-sheet-id'
}))

// Mock the googleSheets utility
vi.mock('../../../server/utils/googleSheets', () => ({
  getSheetsClient: vi.fn()
}))

describe('Settings API Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSettings', () => {
    it('fetches and parses settings from Google Sheets', async () => {
      const mockValues = [
        ['Key', 'Value'], // Header
        ['chip_layout', '{"strategy":["A"],"psychology":["B"]}']
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

      // @ts-ignore
      googleSheets.getSheetsClient.mockResolvedValue(mockClient)

      const settings = await getSettings()

      expect(googleSheets.getSheetsClient).toHaveBeenCalled()
      expect(mockGet).toHaveBeenCalledWith({
        spreadsheetId: 'test-sheet-id',
        range: 'Settings!A:B',
      })

      expect(settings).toEqual({
        chip_layout: { strategy: ['A'], psychology: ['B'] }
      })
    })

    it('returns empty object if sheet is empty', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        data: { values: [] }
      })
      
      const mockClient = {
        spreadsheets: { values: { get: mockGet } }
      }
      // @ts-ignore
      googleSheets.getSheetsClient.mockResolvedValue(mockClient)

      const settings = await getSettings()
      expect(settings).toEqual({})
    })
  })

  describe('saveSettings', () => {
    it('saves settings to Google Sheets by updating the value', async () => {
      // 1. Mock existing settings check
      const mockGet = vi.fn().mockResolvedValue({
        data: { values: [['Key', 'Value'], ['chip_layout', '{}']] }
      })
      
      // 2. Mock update
      const mockUpdate = vi.fn().mockResolvedValue({})

      const mockClient = {
        spreadsheets: {
          get: vi.fn().mockResolvedValue({
            data: { sheets: [{ properties: { title: 'Settings' } }] }
          }),
          values: {
            get: mockGet,
            update: mockUpdate,
            append: vi.fn()
          }
        }
      }
      // @ts-ignore
      googleSheets.getSheetsClient.mockResolvedValue(mockClient)

      await saveSettings('chip_layout', { strategy: ['C'], psychology: ['D'] })

      expect(mockUpdate).toHaveBeenCalledWith({
        spreadsheetId: 'test-sheet-id',
        range: 'Settings!B2', // Assuming it finds it at row 2
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[JSON.stringify({ strategy: ['C'], psychology: ['D'] })]]
        }
      })
    })

    it('appends new setting if key not found', async () => {
        // 1. Mock existing settings check (empty or key missing)
        const mockGet = vi.fn().mockResolvedValue({
          data: { values: [['Key', 'Value']] }
        })
        
        // 2. Mock append
        const mockAppend = vi.fn().mockResolvedValue({})
  
        const mockClient = {
          spreadsheets: {
            get: vi.fn().mockResolvedValue({
              data: { sheets: [{ properties: { title: 'Settings' } }] }
            }),
            values: {
              get: mockGet,
              update: vi.fn(),
              append: mockAppend
            }
          }
        }
        // @ts-ignore
        googleSheets.getSheetsClient.mockResolvedValue(mockClient)
  
        await saveSettings('new_key', 'some_value')
  
        expect(mockAppend).toHaveBeenCalledWith({
          spreadsheetId: 'test-sheet-id',
          range: 'Settings!A:B',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
              values: [['new_key', JSON.stringify('some_value')]]
          }
        })
      })
  })
})
