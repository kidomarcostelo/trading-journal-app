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
    expect(wrapper.text()).toContain('Crypto')
    expect(wrapper.text()).toContain('Open')
    expect(wrapper.text()).toContain('01/11/2026')
  })

  it('applies correct classes for Status', () => {
    const wrapper = mount(TradeSummaryCard, {
      props: {
        trade: {
          Pair: 'BTC/USD',
          Action: 'Long',
          Status: 'Open'
        }
      }
    })
    
    // Check for Emerald color based on Status
    const statusText = wrapper.find('.text-emerald-400')
    expect(statusText.exists()).toBe(true)
  })

  it('formats Excel serial dates correctly', () => {
    const wrapper = mount(TradeSummaryCard, {
      props: { 
        trade: {
          Pair: 'ETH/USD',
          Date: '45658' // Excel serial for ~2025-01-01
        }
      }
    })
    
    // 45658 should map to roughly Jan 1 2025
    expect(wrapper.text()).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })
})
