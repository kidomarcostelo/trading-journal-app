import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Combobox from '../../components/Combobox.vue'

describe('Combobox', () => {
  it('renders input with label', () => {
    const wrapper = mount(Combobox, {
      props: {
        label: 'Strategies',
        options: ['Trend', 'Breakout'],
        modelValue: '',
        multiple: false
      }
    })
    expect(wrapper.text()).toContain('Strategies')
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('filters options based on input', async () => {
    const wrapper = mount(Combobox, {
      props: {
        label: 'Strategies',
        options: ['Trend', 'Breakout'],
        modelValue: '',
        multiple: false
      }
    })

    const input = wrapper.find('input')
    await input.setValue('Tr')
    
    // Dropdown should appear
    const dropdown = wrapper.find('.absolute.z-50')
    expect(dropdown.exists()).toBe(true)
    
    // Should show "Trend" but not "Breakout"
    expect(dropdown.text()).toContain('Trend')
    expect(dropdown.text()).not.toContain('Breakout')
  })

  it('emits update:modelValue on selection (single)', async () => {
    const wrapper = mount(Combobox, {
      props: {
        label: 'Strategies',
        options: ['Trend', 'Breakout'],
        modelValue: '',
        multiple: false
      }
    })

    const input = wrapper.find('input')
    await input.setValue('Tr')
    
    const dropdown = wrapper.find('.absolute.z-50')
    const button = dropdown.find('button') // First option (Trend)
    await button.trigger('click')

    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeTruthy()
    expect(events!.map(e => e[0])).toContain('Trend')
  })
})
