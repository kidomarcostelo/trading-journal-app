import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSettings } from '../../composables/useSettings'

// Mock global $fetch
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock useState
const stateMock: Record<string, any> = {}
vi.stubGlobal('useState', (key: string, init: () => any) => {
  if (!stateMock[key]) {
    // Basic reactive ref-like object for testing
    let val = init ? init() : undefined
    stateMock[key] = {
      get value() { return val },
      set value(v) { val = v }
    }
  }
  return stateMock[key]
})

describe('useSettings Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const key in stateMock) delete stateMock[key]
  })

  it('initializes with default state', () => {
    const { settings, strategyChecklists, isLoading } = useSettings()
    expect(settings.value).toEqual({ panels: [], visibleTradeFormChips: ['Strategies', 'Price Action'] })
    expect(strategyChecklists.value).toEqual({})
    expect(isLoading.value).toBe(false)
  })

  it('fetches settings using $fetch', async () => {
    const mockPanels = [
        { id: 'p1', title: 'Test', categories: ['A'] }
    ]
    mockFetch.mockResolvedValue({ 
      chip_layout: { panels: mockPanels, visibleTradeFormChips: ['Strategies', 'Price Action'] },
      strategyChecklists: {
        'Default': {
          rules: [{ description: 'Rule 1', weight: 1, isMandatory: false }],
          tiers: [{ label: 'S Tier', threshold: 10 }]
        }
      }
    })

    const { fetchSettings, settings, strategyChecklists } = useSettings()
    await fetchSettings()

    expect(mockFetch).toHaveBeenCalledWith('/api/settings')
    expect(settings.value).toEqual({ panels: mockPanels, visibleTradeFormChips: ['Strategies', 'Price Action'] })
    expect(strategyChecklists.value).toEqual({
      'Default': {
        rules: [{ description: 'Rule 1', weight: 1, isMandatory: false }],
        tiers: [{ label: 'S Tier', threshold: 10 }]
      }
    })
  })

  it('saves settings using $fetch with key format', async () => {
    mockFetch.mockResolvedValue({ success: true })

    const { saveSettings, settings } = useSettings()
    
    // Set some state
    const mockPanels = [{ id: 'p1', title: 'Test', categories: ['C'] }]
    settings.value = { panels: mockPanels, visibleTradeFormChips: ['Strategies', 'Price Action'] }

    await saveSettings()

    expect(mockFetch).toHaveBeenCalledWith('/api/settings', {
      method: 'POST',
      body: { key: 'chip_layout', value: { panels: mockPanels, visibleTradeFormChips: ['Strategies', 'Price Action'] } }
    })
  })
  
  it('saves checklist config using $fetch', async () => {
    mockFetch.mockResolvedValue({ success: true })

    const { saveChecklistConfig, strategyChecklists } = useSettings()

    const mockRules = [{ description: 'Rule 2', weight: 2, isMandatory: true }]
    const mockTiers = [{ label: 'A Tier', threshold: 5 }]

    await saveChecklistConfig('Breakout', mockRules, mockTiers)

    expect(mockFetch).toHaveBeenCalledWith('/api/settings', {
      method: 'POST',
      body: { 
        key: 'strategyChecklists', 
        value: {
          'Breakout': { rules: mockRules, tiers: mockTiers }
        }
      }
    })
    expect(strategyChecklists.value).toEqual({
      'Breakout': { rules: mockRules, tiers: mockTiers }
    })
  })

  it('updateLayout updates local state', () => {
      const { updateLayout, settings } = useSettings()
      const mockPanels = { panels: [{ id: 'p1', title: 'Test', categories: ['New'] }], visibleTradeFormChips: ['Strategies', 'Price Action'] }
      updateLayout(mockPanels)
      expect(settings.value).toEqual(mockPanels)
  })
})
