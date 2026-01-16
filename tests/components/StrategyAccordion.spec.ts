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
    { id: 'Price Action', values: ['Trend', 'Reversal', 'Scalp'] },
    { id: 'HTF: trading with trend? (1d - 1w)', values: ['Bullish', 'Bearish'] }
  ]

  const mockTrade = {
    'Price Action': ['Trend'],
    'HTF: trading with trend? (1d - 1w)': []
  }

  it('renders matching categories from schema', () => {
    const wrapper = mount(StrategyAccordion, {
      props: {
        config: mockConfig,
        modelValue: mockTrade
      }
    })

    const headers = wrapper.findAll('.text-terminal-highlight')
    // All 5 schema defined sections should render
    expect(headers).toHaveLength(5)
    expect(headers[0].text()).toContain('Strategies')
    expect(headers[1].text()).toContain('Price Action')
  })

  it('passes correct props to ChipSelect', async () => {
    const wrapper = mount(StrategyAccordion, {
        props: {
          config: mockConfig,
          modelValue: mockTrade
        },
        global: {
            stubs: {
                ChipSelect: true
            }
        }
      })

    const chipSelects = wrapper.findAllComponents({ name: 'ChipSelect' })
    expect(chipSelects.length).toBe(5)
    
    // Price Action is at index 1
    const paSelect = chipSelects[1]
    expect(paSelect.props('label')).toBe('')
    expect(paSelect.props('options')).toEqual(['Trend', 'Reversal', 'Scalp'])
    expect(paSelect.props('modelValue')).toEqual(['Trend'])
  })
  
  it('emits update when ChipSelect emits', async () => {
      const wrapper = mount(StrategyAccordion, {
        props: {
          config: mockConfig,
          modelValue: mockTrade
        }
      })
      
      const chipSelects = wrapper.findAllComponents({ name: 'ChipSelect' })
      // Price Action is at index 1
      const paSelect = chipSelects[1]
      
      await paSelect.vm.$emit('update:modelValue', ['Trend', 'Reversal'])
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emittedValue = wrapper.emitted('update:modelValue')![0][0] as any
      expect(emittedValue['Price Action']).toEqual(['Trend', 'Reversal'])
  })
})
