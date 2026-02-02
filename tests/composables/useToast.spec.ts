import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useToast } from '../../composables/useToast'
import { nextTick } from 'vue'

describe('useToast', () => {
  beforeEach(() => {
    const { toasts } = useToast()
    toasts.value = []
  })

  it('adds a toast notification', () => {
    const { toasts, addToast } = useToast()
    
    addToast({
      title: 'Success',
      message: 'Saved successfully',
      type: 'success'
    })

    expect(toasts.value.length).toBe(1)
    expect(toasts.value[0].title).toBe('Success')
    expect(toasts.value[0].type).toBe('success')
  })

  it('removes a toast notification after duration', () => {
    vi.useFakeTimers()
    const { toasts, addToast } = useToast()
    
    addToast({
      title: 'Success',
      message: 'Saved successfully',
      duration: 1000
    })

    expect(toasts.value.length).toBe(1)
    
    vi.advanceTimersByTime(1000)
    
    expect(toasts.value.length).toBe(0)
    vi.useRealTimers()
  })
  
  it('removes a toast manually', () => {
      const { toasts, addToast, removeToast } = useToast()
      
      const id = addToast({
          title: 'Manual Remove',
          message: 'Test'
      })
      
      expect(toasts.value.length).toBe(1)
      
      removeToast(id)
      
      expect(toasts.value.length).toBe(0)
  })
})
