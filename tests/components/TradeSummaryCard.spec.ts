import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TradeSummaryCard from '../../components/TradeSummaryCard.vue'

describe('TradeSummaryCard', () => {
  const mockTrade = {
    ID: '1',
    Pair: 'BTC/USD',
    Action: 'Long',
    Market: 'Crypto',
    Status: 'Open',
    Date: '01/11/2026'
  }

  it('renders trade details correctly', () => {
    const wrapper = mount(TradeSummaryCard, {
      props: { trade: mockTrade }
    })
    
    expect(wrapper.text()).toContain('BTC/USD')
    expect(wrapper.text()).toContain('Long')
    expect(wrapper.text()).toContain('Crypto')
    expect(wrapper.text()).toContain('Open')
    expect(wrapper.text()).toContain('01/11/2026')
  })

  it('applies correct classes for Action and Status', () => {
    const wrapper = mount(TradeSummaryCard, {
      props: { trade: mockTrade }
    })
    
    // Check for Emerald/Rose colors based on Action/Status
    const actionText = wrapper.find('.text-emerald-500')
    expect(actionText.exists()).toBe(true)
  })
})
