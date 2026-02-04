import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAutoSave } from '../../composables/useAutoSave'

describe('useAutoSave (Batch)', () => {
  const mockSaveFn = vi.fn().mockResolvedValue({ success: true })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('tracks multiple dirty trades', () => {
    const { dirtyTradeIds, trackChange, isDirty } = useAutoSave(mockSaveFn)
    
    trackChange('trade-1')
    expect(isDirty.value).toBe(true)
    expect(dirtyTradeIds.value.has('trade-1')).toBe(true)
    
    trackChange('trade-2')
    expect(dirtyTradeIds.value.size).toBe(2)
  })

  it('passes dirty IDs to save function', async () => {
    const { triggerSave, trackChange } = useAutoSave(mockSaveFn)
    trackChange('trade-1')
    trackChange('trade-2')
    
    await triggerSave()
    
    // Expect saveFn to be called with the set or array of IDs
    expect(mockSaveFn).toHaveBeenCalledWith(expect.any(Set))
    const calledSet = mockSaveFn.mock.calls[0][0]
    expect(calledSet.has('trade-1')).toBe(true)
    expect(calledSet.has('trade-2')).toBe(true)
  })

  it('clears dirty IDs after successful save', async () => {
    const { triggerSave, trackChange, dirtyTradeIds } = useAutoSave(mockSaveFn)
    trackChange('trade-1')
    
    await triggerSave()
    expect(dirtyTradeIds.value.size).toBe(0)
  })

  it('keeps dirty IDs on navigation in manual mode', async () => {
    const { onNavigate, trackChange, dirtyTradeIds, saveMode } = useAutoSave(mockSaveFn)
    saveMode.value = 'manual'
    
    trackChange('trade-1')
    await onNavigate()
    
    // Should NOT clear in manual mode
    expect(dirtyTradeIds.value.has('trade-1')).toBe(true)
  })
})
