import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SaveControls from '../../../components/ui/SaveControls.vue'

describe('SaveControls', () => {
  it('renders FAB and toggles', () => {
    const wrapper = mount(SaveControls, {
        props: {
            modelValue: 'manual',
            isDirty: false,
            isLoading: false
        }
    })
    
    expect(wrapper.find('button[aria-label="Save"]').exists()).toBe(true)
    // Should show settings/toggle trigger
    expect(wrapper.find('button[aria-label="Save Settings"]').exists()).toBe(true)
  })

  it('emits save event when FAB is clicked', async () => {
      const wrapper = mount(SaveControls, {
          props: {
              modelValue: 'manual',
              isDirty: true,
              isLoading: false
          }
      })
      
      await wrapper.find('button[aria-label="Save"]').trigger('click')
      expect(wrapper.emitted('save')).toBeTruthy()
  })

  it('toggles save mode', async () => {
      const wrapper = mount(SaveControls, {
          props: {
              modelValue: 'manual',
              isDirty: false,
              isLoading: false
          }
      })
      
      // Open settings menu
      await wrapper.find('button[aria-label="Save Settings"]').trigger('click')
      
      // Find mode options (assuming they are rendered when menu is open)
      const autoOption = wrapper.findAll('button').find(b => b.text().includes('Always Autosave'))
      
      if (!autoOption) throw new Error('Autosave option not found')
          
      await autoOption.trigger('click')
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['auto'])
  })
})
