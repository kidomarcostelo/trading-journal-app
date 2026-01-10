import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TradeGallery from '../../components/TradeGallery.vue'

describe('TradeGallery', () => {
  const mockTrades = [
    { 
      'ID': '1', 
      'Pair': 'BTC/USD', 
      'Before Picture': ['https://img1.com'], 
      'After Picture': ['https://img2.com'],
      'PnL': '100'
    }
  ]

  it('renders trade cards with images', () => {
    const wrapper = mount(TradeGallery, {
      props: { trades: mockTrades }
    })
    
    expect(wrapper.text()).toContain('BTC/USD')
    expect(wrapper.findAll('img').length).toBeGreaterThan(0)
  })
})
