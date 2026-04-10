import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PairGallery from '../../components/PairGallery.vue'

describe('PairGallery', () => {
  it('renders a grid of trades with stats and tags', () => {
    const wrapper = mount(PairGallery, {
      props: {
        trades: [
          { 
            id: '1', 
            pair: 'BTC/USD', 
            pnl: 100, 
            date: '2024-01-01',
            beforeImage: 'before.jpg',
            afterImage: 'after.jpg',
            strategies: ['Breakout']
          }
        ]
      }
    })
    
    const cards = wrapper.findAll('.trade-card')
    expect(cards.length).toBe(1)
    expect(wrapper.text()).toContain('BTC/USD')
    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('2024-01-01')
    expect(wrapper.text()).toContain('Breakout')
    
    const images = wrapper.findAll('img')
    expect(images.length).toBeGreaterThanOrEqual(2)
  })

  it('shows empty state when no trades provided', () => {
    const wrapper = mount(PairGallery, {
      props: { trades: [] }
    })
    expect(wrapper.text().toLowerCase()).toContain('no trades found')
  })
})