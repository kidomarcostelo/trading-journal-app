import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChipSelect from '../../components/ChipSelect.vue'

describe('ChipSelect', () => {
  it('renders labels and options', () => {
    const wrapper = mount(ChipSelect, {
      props: {
        label: 'Strategies',
        options: ['Trend', 'Breakout'],
        modelValue: []
      }
    })
    expect(wrapper.text()).toContain('Strategies')
    expect(wrapper.text()).toContain('Trend')
    expect(wrapper.text()).toContain('Breakout')
  })

  it('emits update:modelValue when a chip is clicked', async () => {
    const wrapper = mount(ChipSelect, {
      props: {
        label: 'Strategies',
        options: ['Trend', 'Breakout'],
        modelValue: []
      }
    })

    const chips = wrapper.findAll('button')
    await chips[0].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['Trend']])
  })

  it('toggles selection when multiple is allowed', async () => {
    const wrapper = mount(ChipSelect, {
      props: {
        label: 'Strategies',
        options: ['Trend', 'Breakout'],
        modelValue: ['Trend']
      }
    })

    const chips = wrapper.findAll('button')
    await chips[0].trigger('click') // Toggle off

    expect(wrapper.emitted('update:modelValue')![0]).toEqual([[]])
  })
})
