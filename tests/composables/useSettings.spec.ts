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
    const { settings, isLoading } = useSettings()
    expect(settings.value).toEqual({ strategy: [], psychology: [] })
    expect(isLoading.value).toBe(false)
  })

  it('fetches settings using $fetch', async () => {
    mockFetch.mockResolvedValue({ strategy: ['A'], psychology: ['B'] })

    const { fetchSettings, settings } = useSettings()
    await fetchSettings()

    expect(mockFetch).toHaveBeenCalledWith('/api/settings')
    expect(settings.value).toEqual({ strategy: ['A'], psychology: ['B'] })
  })

  it('saves settings using $fetch', async () => {
    mockFetch.mockResolvedValue({ success: true })

    const { saveSettings, settings } = useSettings()
    
    // Set some state
    settings.value = { strategy: ['C'], psychology: ['D'] }

    await saveSettings()

    expect(mockFetch).toHaveBeenCalledWith('/api/settings', {
      method: 'POST',
      body: { strategy: ['C'], psychology: ['D'] }
    })
  })
  
  it('updateLayout updates local state', () => {
      const { updateLayout, settings } = useSettings()
      updateLayout({ strategy: ['New'], psychology: [] })
      expect(settings.value).toEqual({ strategy: ['New'], psychology: [] })
  })
})