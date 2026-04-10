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
    expect(wrapper.text()).toContain('Open')
    expect(wrapper.text()).toContain('01/11/2026')
  })

  it('renders outcome arrow for closed trades', () => {
    const wrapper = mount(TradeSummaryCard, {
      props: {
        trade: {
          Status: 'Closed',
          pnl: 100,
          Pair: 'BTC/USD'
        }
      }
    })
    
    // Check for win arrow (ArrowUp is rendered as an SVG)
    expect(wrapper.find('svg.text-emerald-400').exists()).toBe(true)

    const lossWrapper = mount(TradeSummaryCard, {
      props: {
        trade: {
          Status: 'Closed',
          pnl: -50,
          Pair: 'ETH/USD'
        }
      }
    })
    expect(lossWrapper.find('svg.text-rose-400').exists()).toBe(true)
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

  it('emits delete event when delete button is clicked', async () => {
    const wrapper = mount(TradeSummaryCard, {
      props: { trade: mockTrade }
    })
    
    // Toggle menu
    await wrapper.find('button[aria-label="More options"]').trigger('click')
    
    // Click delete
    const deleteBtn = wrapper.find('button.text-error')
    expect(deleteBtn.exists()).toBe(true)
    await deleteBtn.trigger('click')
    
    expect(wrapper.emitted().delete).toBeTruthy()
    expect(wrapper.emitted().delete[0]).toEqual(['1'])
  })
})
