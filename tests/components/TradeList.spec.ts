import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TradeList from '../../components/TradeList.vue'

describe('TradeList', () => {
  const mockTrades = [
    { 'ID': '1', 'Pair': 'BTC/USD' },
    { 'ID': '2', 'Pair': 'ETH/USD' }
  ]

  it('renders a list of trade cards', () => {
    const wrapper = mount(TradeList, {
      props: { trades: mockTrades },
      global: {
          stubs: { TradeSummaryCard: true }
      }
    })
    
    expect(wrapper.findAllComponents({ name: 'TradeSummaryCard' }).length).toBe(2)
  })

  it('passes collapsed prop to trade cards', () => {
    const wrapper = mount(TradeList, {
      props: { 
        trades: mockTrades,
        collapsed: true
      },
      global: {
          stubs: { TradeSummaryCard: true }
      }
    })
    
    const cards = wrapper.findAllComponents({ name: 'TradeSummaryCard' })
    expect(cards[0].props('collapsed')).toBe(true)
  })

  it('emits select event when a card is clicked', async () => {
    const wrapper = mount(TradeList, {
      props: { trades: mockTrades }
    })
    
    const cards = wrapper.findAllComponents({ name: 'TradeSummaryCard' })
    await cards[0].trigger('click')
    
    expect(wrapper.emitted('select')?.[0]).toEqual(['1'])
  })

  it('shows empty message when no trades', () => {
    const wrapper = mount(TradeList, {
      props: { trades: [] }
    })
    
    expect(wrapper.text()).toContain('No trades found')
  })
})