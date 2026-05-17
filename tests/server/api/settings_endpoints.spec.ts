import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as settingsUtils from '../../../server/utils/settings'

// Mock the settings utility
vi.mock('../../../server/utils/settings', () => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn()
}))

// Mock h3
vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual as any,
    readBody: vi.fn(),
    defineEventHandler: (handler: any) => handler
  }
})

import { readBody } from 'h3'
// Import handlers AFTER mocking h3
import getHandler from '../../../server/api/settings/index.get'
import postHandler from '../../../server/api/settings/index.post'

describe('Settings API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/settings', () => {
    it('returns the chip_layout setting', async () => {
      // @ts-ignore
      settingsUtils.getSettings.mockResolvedValue({
        chip_layout: { panels: [{ id: '1', title: 'Test', categories: ['A'] }] }
      })

      const response = await getHandler({} as any)

      expect(settingsUtils.getSettings).toHaveBeenCalled()
      expect(response).toEqual({
        chip_layout: { panels: [{ id: '1', title: 'Test', categories: ['A'] }] },
        strategyChecklists: {}
      })
    })

    it('returns default empty layout if setting is missing', async () => {
      // @ts-ignore
      settingsUtils.getSettings.mockResolvedValue({})

      const response = await getHandler({} as any)

      expect(response).toEqual({
        chip_layout: { panels: [] },
        strategyChecklists: {}
      })
    })
  })

  describe('POST /api/settings', () => {
    it('saves the chip_layout setting', async () => {
      const mockBody = { strategy: ['C'], psychology: ['D'] }
      
      // Mock readBody return value
      // @ts-ignore
      readBody.mockResolvedValue(mockBody)

      await postHandler({} as any)

      expect(settingsUtils.saveSettings).toHaveBeenCalledWith('chip_layout', expect.objectContaining({
          strategy: ['C'],
          psychology: ['D']
      }))
    })
  })
})
