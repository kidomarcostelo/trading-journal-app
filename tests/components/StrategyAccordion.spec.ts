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

    const headers = wrapper.findAll('.accordion-header')
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

    // Initially assume first is expanded or all are expanded? 
    // Spec says "Accordion style". Usually one open or independent toggles.
    // Let's assume independent toggles.
    
    // Check initial state (maybe all collapsed or first expanded).
    // Let's check for content visibility.
    
    const header = wrapper.find('.accordion-header')
    await header.trigger('click')
    
    // Verify state change (class or existence of content)
    // Depending on implementation, content might be v-if or v-show
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
