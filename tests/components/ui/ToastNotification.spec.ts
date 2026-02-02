import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ToastNotification from '../../../components/ui/ToastNotification.vue'
import { useToast } from '../../../composables/useToast'

describe('ToastNotification', () => {
  it('renders toasts from the composable', async () => {
    const { addToast } = useToast()
    
    addToast({
      title: 'Test Toast',
      message: 'This is a test message',
      type: 'success'
    })

    const wrapper = mount(ToastNotification)
    
    expect(wrapper.text()).toContain('Test Toast')
    expect(wrapper.text()).toContain('This is a test message')
    // Check for the success class more robustly
    const toast = wrapper.find('div.rounded-lg')
    expect(toast.classes()).toContain('bg-emerald-950/90')
  })

  it('removes toast when close button is clicked', async () => {
    const { addToast, toasts } = useToast()
    // clear previous
    toasts.value = []
    
    addToast({
      title: 'Removable Toast',
      message: 'Click to remove',
    })

    const wrapper = mount(ToastNotification)
    
    await wrapper.find('button').trigger('click')
    
    expect(toasts.value.length).toBe(0)
  })
})
