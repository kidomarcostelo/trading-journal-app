import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StrategyAccordion from '../../components/StrategyAccordion.vue'
import ChipSelect from '../../components/ChipSelect.vue'

// Mock the child component to isolate unit tests
vi.mock('../../components/ChipSelect.vue', () => ({
  default: {
    name: 'ChipSelect',
    props: ['label', 'options', 'modelValue', 'category'],
    emits: ['update:modelValue'],
    template: '<div class="chip-select-stub"></div>'
  }
}))

describe('StrategyAccordion', () => {
  const mockConfig = [
    { id: 'Strategy', values: ['Trend', 'Reversal', 'Scalp'] },
    { id: 'Psychology', values: ['FOMO', 'Revenge', 'Good'] }
  ]

  const mockTrade = {
    Strategy: ['Trend'],
    Psychology: []
  }

  it('renders all categories from config', () => {
    const wrapper = mount(StrategyAccordion, {
      props: {
        config: mockConfig,
        modelValue: mockTrade
      }
    })

    const headers = wrapper.findAll('button')
    // Each CollapsibleSection has a button as its header
    expect(headers).toHaveLength(2)
    expect(headers[0].text()).toContain('Strategy')
    expect(headers[1].text()).toContain('Psychology')
  })

  it('toggles category expansion on click', async () => {
    const wrapper = mount(StrategyAccordion, {
      props: {
        config: mockConfig,
        modelValue: mockTrade
      }
    })

    // Find the first CollapsibleSection's button
    const header = wrapper.find('button')
    await header.trigger('click')
    
    // CollapsibleSection should now be collapsed (since it starts expanded)
    // We check if ANY ChipSelect exists.
    const chipSelect = wrapper.findComponent({ name: 'ChipSelect' })
    expect(chipSelect.exists()).toBe(true) // The second one should still exist if they are independent
    
    // Let's check the number of ChipSelects
    expect(wrapper.findAllComponents({ name: 'ChipSelect' })).toHaveLength(1)
  })

  it('passes correct props to ChipSelect', async () => {
    const wrapper = mount(StrategyAccordion, {
        props: {
          config: mockConfig,
          modelValue: mockTrade
        },
        global: {
            stubs: {
                ChipSelect: true // Use the real stub/mock
            }
        }
      })

    // Categories are expanded by default, so we don't need to click
    const chipSelects = wrapper.findAllComponents({ name: 'ChipSelect' })
    expect(chipSelects.length).toBeGreaterThan(0)
    
    const strategySelect = chipSelects[0]
    // The implementation passes an empty string for label to avoid duplication with header
    expect(strategySelect.props('label')).toBe('')
    expect(strategySelect.props('options')).toEqual(['Trend', 'Reversal', 'Scalp'])
    expect(strategySelect.props('modelValue')).toEqual(['Trend'])
  })
  
  it('emits update when ChipSelect emits', async () => {
      // Logic for handling updates
      const wrapper = mount(StrategyAccordion, {
        props: {
          config: mockConfig,
          modelValue: mockTrade
        }
      })
      
      // Categories are expanded by default
      const chipSelects = wrapper.findAllComponents({ name: 'ChipSelect' })
      const strategySelect = chipSelects[0] // Strategy is first
      
      // Simulate update from child
      await strategySelect.vm.$emit('update:modelValue', ['Trend', 'Reversal'])
      
      // Wrapper should emit update:modelValue with the updated trade object
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emittedValue = wrapper.emitted('update:modelValue')![0][0] as any
      expect(emittedValue.Strategy).toEqual(['Trend', 'Reversal'])
  })
})
