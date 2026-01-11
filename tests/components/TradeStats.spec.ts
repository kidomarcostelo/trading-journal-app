import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TradeStats from '../../components/TradeStats.vue'

describe('TradeStats', () => {
  const mockTrades = [
    { ID: '1', PnL: 100, Status: 'Closed' },
    { ID: '2', PnL: -50, Status: 'Closed' },
    { ID: '3', PnL: 200, Status: 'Closed' },
    { ID: '4', PnL: 0, Status: 'Open' } // Open trades usually don't count for Win% unless realized
  ]

  it('renders summary statistics', () => {
    const wrapper = mount(TradeStats, {
      props: { trades: mockTrades }
    })
    
    expect(wrapper.text()).toContain('Win Rate')
    expect(wrapper.text()).toContain('Total PnL')
    expect(wrapper.text()).toContain('Trades')
  })

  it('calculates metrics correctly', () => {
    const wrapper = mount(TradeStats, {
      props: { trades: mockTrades }
    })
    
    // Total Trades: 4
    expect(wrapper.text()).toContain('4')
    
    // Total PnL: 100 - 50 + 200 = 250
    expect(wrapper.text()).toContain('250')
    
    // Win Rate: 2 wins (100, 200) / 3 closed trades = 66.6% or 67%
    // Assuming we filter by Status='Closed' for Win Rate
    expect(wrapper.text()).toMatch(/66\.7%|67%/)
  })
})
