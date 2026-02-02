import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAutoSave } from '../../composables/useAutoSave'
import { nextTick, ref } from 'vue'

describe('useAutoSave', () => {
  const mockSaveFn = vi.fn().mockResolvedValue({ success: true })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('manages save modes', () => {
    const { saveMode } = useAutoSave(mockSaveFn)
    expect(saveMode.value).toBe('manual')
    
    saveMode.value = 'auto'
    expect(saveMode.value).toBe('auto')
  })

  it('tracks dirty state', () => {
    const { isDirty, trackChange } = useAutoSave(mockSaveFn)
    expect(isDirty.value).toBe(false)
    
    trackChange()
    expect(isDirty.value).toBe(true)
  })

  it('debounces saves in auto mode', async () => {
    const { saveMode, trackChange } = useAutoSave(mockSaveFn)
    saveMode.value = 'auto'
    
    trackChange()
    expect(mockSaveFn).not.toHaveBeenCalled()
    
    vi.advanceTimersByTime(500)
    expect(mockSaveFn).toHaveBeenCalledTimes(1)
  })

  it('does not auto-save in manual mode', async () => {
    const { saveMode, trackChange } = useAutoSave(mockSaveFn)
    saveMode.value = 'manual'
    
    trackChange()
    vi.advanceTimersByTime(1000)
    expect(mockSaveFn).not.toHaveBeenCalled()
  })

  it('triggers manual save', async () => {
    const { triggerSave, isDirty, trackChange } = useAutoSave(mockSaveFn)
    trackChange()
    
    await triggerSave()
    expect(mockSaveFn).toHaveBeenCalledTimes(1)
    expect(isDirty.value).toBe(false)
  })

  it('triggers save on navigation', async () => {
    const { saveMode, onNavigate, trackChange } = useAutoSave(mockSaveFn)
    saveMode.value = 'navigation'
    
    trackChange()
    await onNavigate()
    expect(mockSaveFn).toHaveBeenCalledTimes(1)
  })
  
  it('does not trigger save on navigation if not dirty', async () => {
      const { saveMode, onNavigate } = useAutoSave(mockSaveFn)
      saveMode.value = 'navigation'
      
      await onNavigate()
      expect(mockSaveFn).not.toHaveBeenCalled()
  })
})
