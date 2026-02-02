import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StrategyAccordion from '../../components/StrategyAccordion.vue'
import ChipSelect from '../../components/ChipSelect.vue'

describe('StrategyAccordion', () => {
  const mockConfig = [
    { id: 'Strategies', values: ['Trend', 'Reversal', 'Breakout'] },
    { id: 'Price Action', values: ['Bullish', 'Bearish'] }
  ]

  const mockTrade = {
    'Strategies': ['Trend'],
    'Price Action': []
  }

  it('renders matching categories from schema', () => {
    const wrapper = mount(StrategyAccordion, {
      props: {
        config: mockConfig,
        modelValue: mockTrade
      },
      global: {
        stubs: {
          ChipSelect: {
            template: '<div class="chip-select-stub"></div>'
          }
        }
      }
    })

    const headers = wrapper.findAll('.text-terminal-highlight')
    // In our mock, 'Strategies' and 'Price Action' match the candidates in STRATEGY_SCHEMA
    expect(headers.length).toBeGreaterThanOrEqual(2)
    expect(headers[0].text()).toContain('Strategies')
    expect(headers[1].text()).toContain('Price Action')
  })

  it('passes correct props to ChipSelect', async () => {
    const wrapper = mount(StrategyAccordion, {
      props: {
        config: mockConfig,
        modelValue: { 'Price Action': ['Bullish'] }
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
    expect(priceActionChipSelect.props('options')).toEqual(['Bullish', 'Bearish'])
    expect(priceActionChipSelect.props('modelValue')).toEqual(['Bullish'])
  })

  it('emits update when ChipSelect emits', async () => {
      const wrapper = mount(StrategyAccordion, {
        props: {
          config: mockConfig,
          modelValue: { 'Strategies': ['Trend'] }
        }
      })

      // Find all buttons in the first section (Strategies)
      const buttons = wrapper.findAll('button')
      
      const reversalButton = buttons.find(b => b.text().trim() === 'Reversal')
      
      if (!reversalButton) {
        throw new Error('Reversal button not found')
      }

      await reversalButton.trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emittedValue = wrapper.emitted('update:modelValue')![0][0] as any
      expect(emittedValue['Strategies']).toEqual(['Trend', 'Reversal'])
  })
})
