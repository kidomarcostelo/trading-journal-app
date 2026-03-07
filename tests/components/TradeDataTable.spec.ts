import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, Suspense, defineComponent } from 'vue'
import TradeDataTable from '../../components/TradeDataTable.vue'

// Mock useFetch
vi.stubGlobal('useFetch', vi.fn().mockResolvedValue({
  data: {
    value: [
      { id: 'Status', values: ['Open', 'Closed', 'Cancelled', 'Missed'] },
      { id: 'Action', values: ['Long', 'Short'] },
      { id: 'Market', values: ['Crypto', 'Forex', 'Indices', 'Stocks', 'Commodities'] }
    ]
  },
  pending: { value: false }
}))

const mountSuspense = (component: any, props: any = {}) => {
  return mount(defineComponent({
    render() {
      return h(Suspense, null, {
        default: h(component, props),
        fallback: h('div', 'Loading...')
      })
    }
  }))
}

describe('TradeDataTable', () => {
  const mockTrade = {
    Action: 'Long',
    Market: 'Crypto',
    Status: 'Open',
    Risk: 100,
    PNL: 250
  }

  it('renders labels and data from props', async () => {
    const wrapper = mountSuspense(TradeDataTable, { trade: mockTrade })
    await new Promise(resolve => setTimeout(resolve, 50)) // wait for suspense
    
    // Check for new headers
    expect(wrapper.text()).toContain('Action')
    expect(wrapper.text()).toContain('Market')
    expect(wrapper.text()).toContain('Status')
    expect(wrapper.text()).toContain('Risk')
    expect(wrapper.text()).toContain('PNL')
    expect(wrapper.text()).toContain('RR')
    
    // Check values
    const selects = wrapper.findAll('select')
    expect(selects[0].element.value).toBe('Crypto') // Market
    expect(selects[1].element.value).toBe('Open') // Status
    
    const inputs = wrapper.findAll('input')
    // Order: Risk, PNL, RR
    expect(inputs[0].element.value).toBe('100') // Risk
    expect(inputs[1].element.value).toBe('250') // PNL
  })

  it('emits update when an input changes', async () => {
    const wrapper = mountSuspense(TradeDataTable, { trade: mockTrade })
    await new Promise(resolve => setTimeout(resolve, 50)) // wait for suspense

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('150') // Risk input is now first input (after selects)

    // The emitted event is fired from the child component inside the suspense
    const childComponent = wrapper.findComponent(TradeDataTable)
    expect(childComponent.emitted('update')).toBeTruthy()
    const emittedValue = childComponent.emitted('update')![0][0] as any
    expect(emittedValue.Risk).toBe(150)
  })
})
