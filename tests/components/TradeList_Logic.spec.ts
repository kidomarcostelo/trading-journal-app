import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TradeList from '../../components/TradeList.vue'
import TradeSummaryCard from '../../components/TradeSummaryCard.vue'

describe('TradeList Filtering and Sorting', () => {
  const mockTrades = [
    { ID: '1', Pair: 'BTC/USD', Action: 'Long', Market: 'Crypto', Status: 'Open', Date: '01/20/2026' },
    { ID: '2', Pair: 'ETH/USD', Action: 'Short', Market: 'Crypto', Status: 'Closed', Date: '01/05/2026' },
    { ID: '3', Pair: 'AAPL', Action: 'Long', Market: 'Stocks', Status: 'Cancelled', Date: '12/25/2025' }
  ]

  beforeEach(() => {
    // Set system time to Jan 20, 2026 (Tuesday)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-20'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('filters trades by time period (Week)', async () => {
    // Note: Assuming we will add props or internal state for filtering
    const wrapper = mount(TradeList, {
      props: { 
        trades: mockTrades,
        filterPeriod: 'week' // Proposed prop
      }
    })
    
    // Today is Jan 20, 2026 (Tuesday)
    // Jan 20 should be in 'week'
    expect(wrapper.text()).toContain('BTC/USD')
    expect(wrapper.text()).not.toContain('ETH/USD')
    expect(wrapper.text()).not.toContain('AAPL')
  })

  it('filters trades by time period (Month)', async () => {
    const wrapper = mount(TradeList, {
      props: { 
        trades: mockTrades,
        filterPeriod: 'month' // Proposed prop
      }
    })
    
    // Jan 2026 should include Jan 10 and Jan 5
    expect(wrapper.text()).toContain('BTC/USD')
    expect(wrapper.text()).toContain('ETH/USD')
    expect(wrapper.text()).not.toContain('AAPL')
  })

  it('sorts trades by Status', async () => {
    const wrapper = mount(TradeList, {
      props: { 
        trades: mockTrades,
        filterPeriod: 'all',
        sortBy: 'Status',
        sortDir: 'asc'
      }
    })
    
    const cards = wrapper.findAllComponents(TradeSummaryCard)
    expect(cards.length).toBe(3)
    
    // Check order: Open (ID 1), Closed (ID 2), Cancelled (ID 3)
    expect(cards[0].props('trade').ID).toBe('1')
    expect(cards[1].props('trade').ID).toBe('2')
    expect(cards[2].props('trade').ID).toBe('3')
  })
})
