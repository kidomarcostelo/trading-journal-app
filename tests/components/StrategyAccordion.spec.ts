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
    // In our mock, only 'Strategies' and 'Price Action' match the candidates in STRATEGY_SCHEMA
    expect(headers.length).toBeGreaterThanOrEqual(2)
    expect(headers[0].text()).toContain('Strategies')
    expect(headers[1].text()).toContain('Price Action')
  })

  it('passes correct props to ChipSelect', async () => {
    const wrapper = mount(StrategyAccordion, {
      props: {
        config: mockConfig,
        modelValue: { 'Price Action': ['Trend'] }
      },
      global: {
        stubs: {
          ChipSelect: true
        }
      }
    })

    const chipSelects = wrapper.findAllComponents({ name: 'ChipSelect' })
    expect(chipSelects.length).toBeGreaterThanOrEqual(2)
    
    // Price Action is at index 1
    const priceActionChipSelect = chipSelects[1]
    expect(priceActionChipSelect.props('options')).toEqual(['Trend', 'Reversal', 'Breakout'])
    expect(priceActionChipSelect.props('modelValue')).toEqual(['Trend'])
  })

  it('emits update when ChipSelect emits', async () => {
      const wrapper = mount(StrategyAccordion, {
        props: {
          config: mockConfig,
          modelValue: { 'Price Action': ['Trend'] }
        },
        global: {
          stubs: {
            ChipSelect: false // Render actual ChipSelect to trigger events
          }
        }
      })

      const priceActionSection = wrapper.findAll('.flex-col')[1]
      const buttons = priceActionSection.findAll('button')
      
      // Click 'Reversal' which is index 1
      await buttons[1].trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emittedValue = wrapper.emitted('update:modelValue')![0][0] as any
      // In ChipSelect, toggleOption should add 'Reversal' to ['Trend']
      expect(emittedValue['Price Action']).toEqual(['Trend', 'Reversal'])
  })
})
