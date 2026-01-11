import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TradeList from '../../components/TradeList.vue'

describe('TradeList', () => {
  const mockTrades = [
    { 'ID': '1', 'Pair': 'BTC/USD', 'PnL': '100', 'Tags': ['Trend'] },
    { 'ID': '2', 'Pair': 'ETH/USD', 'PnL': '-50', 'Tags': ['FOMO'] }
  ]

  it('renders a table with trade data', () => {
    const wrapper = mount(TradeList, {
      props: { trades: mockTrades }
    })
    
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.text()).toContain('BTC/USD')
    expect(wrapper.text()).toContain('ETH/USD')
  })

  it('identifies columns from trade keys', () => {
    const wrapper = mount(TradeList, {
      props: { trades: mockTrades }
    })
    
    const headers = wrapper.findAll('th')
    const headerTexts = headers.map(h => h.text())
    expect(headerTexts).toContain('Pair')
    expect(headerTexts).toContain('Action')
    expect(headerTexts).toContain('Status')
    expect(headerTexts).not.toContain('PnL')
  })
})
