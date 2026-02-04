import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TradeDataTable from '../../components/TradeDataTable.vue'

describe('TradeDataTable', () => {
  const mockTrade = {
    Action: 'Long',
    Market: 'Crypto',
    Status: 'Open',
    Risk: 100,
    PNL: 250
  }

  it('renders labels and data from props', () => {
    const wrapper = mount(TradeDataTable, {
      props: {
        trade: mockTrade
      }
    })
    
    // Check for new headers
    expect(wrapper.text()).toContain('Action')
    expect(wrapper.text()).toContain('Market')
    expect(wrapper.text()).toContain('Status')
    expect(wrapper.text()).toContain('Risk')
    expect(wrapper.text()).toContain('Exit Price')
    expect(wrapper.text()).toContain('PNL')
    expect(wrapper.text()).toContain('Exit Date')
    
    // Check values
    const selects = wrapper.findAll('select')
    expect(selects[0].element.value).toBe('Crypto') // Market
    expect(selects[1].element.value).toBe('Open') // Status
    
    const inputs = wrapper.findAll('input')
    // Order: Risk, Exit Price, PNL, Exit Date
    expect(inputs[0].element.value).toBe('100') // Risk
    expect(inputs[2].element.value).toBe('250') // PNL
  })

  it('emits update when an input changes', async () => {
    const wrapper = mount(TradeDataTable, {
      props: {
        trade: mockTrade
      }
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('150') // Risk input is now first input (after selects)

    expect(wrapper.emitted('update')).toBeTruthy()
    const emittedValue = wrapper.emitted('update')![0][0] as any
    expect(emittedValue.Risk).toBe(150)
  })
})
