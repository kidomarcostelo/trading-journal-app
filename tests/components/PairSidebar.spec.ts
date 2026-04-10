import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PairSidebar from '../../components/PairSidebar.vue'

describe('PairSidebar', () => {
  it('renders a list of pairs', () => {
    const wrapper = mount(PairSidebar, {
      props: {
        pairs: ['BTC/USD', 'ETH/USD', 'SOL/USD'],
        selectedPair: 'BTC/USD'
      }
    })
    
    const items = wrapper.findAll('li')
    expect(items.length).toBe(3)
    expect(items[0].text()).toContain('BTC/USD')
    expect(items[1].text()).toContain('ETH/USD')
    expect(items[2].text()).toContain('SOL/USD')
  })

  it('emits select event when a pair is clicked', async () => {
    const wrapper = mount(PairSidebar, {
      props: {
        pairs: ['BTC/USD', 'ETH/USD'],
        selectedPair: 'BTC/USD'
      }
    })

    const items = wrapper.findAll('li')
    await items[1].trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]).toEqual(['ETH/USD'])
  })

  it('highlights the selected pair', () => {
    const wrapper = mount(PairSidebar, {
      props: {
        pairs: ['BTC/USD', 'ETH/USD'],
        selectedPair: 'ETH/USD'
      }
    })

    const items = wrapper.findAll('li')
    expect(items[1].classes()).toContain('bg-slate-800')
    expect(items[0].classes()).not.toContain('bg-slate-800')
  })
})