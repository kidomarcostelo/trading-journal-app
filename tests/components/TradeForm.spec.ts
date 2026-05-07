import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, Suspense, nextTick } from 'vue'
import TradeForm from '../../components/TradeForm.vue'

// Mock useFetch
vi.stubGlobal('useFetch', vi.fn().mockReturnValue({
  data: { value: [
    { id: 'Strategy', values: ['Trend', 'Breakout'] },
    { id: 'Psychology', values: ['FOMO', 'Revenge'] }
  ] },
  pending: { value: false },
  refresh: vi.fn()
}))

// Wrapper to handle Suspense
const mountSuspense = (component: any) => {
  return mount(defineComponent({
    render() {
      return h(Suspense, null, {
        default: h(component),
        fallback: h('div', 'Loading...')
      })
    }
  }))
}

describe('TradeForm', () => {
  it('renders input fields', async () => {
    const wrapper = mountSuspense(TradeForm)
    // Wait for Suspense to resolve
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(wrapper.find('input[name="Pair"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('updates form data on input', async () => {
    const wrapper = mountSuspense(TradeForm)
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const pairInput = wrapper.find('input[name="Pair"]')
    await pairInput.setValue('BTC/USD')
    
    // We need to find the actual component instance to check the form state
    const formComponent = wrapper.findComponent(TradeForm)
    expect((formComponent.vm as any).form.Pair).toBe('BTC/USD')
  })

  it('renders new behavioral fields when status is Closed', async () => {
    const wrapper = mountSuspense(TradeForm)
    await new Promise(resolve => setTimeout(resolve, 0))
    const formComponent = wrapper.findComponent(TradeForm)
    
    // Set status to Closed
    ;(formComponent.vm as any).form.Status = 'Closed'
    await nextTick()
    
    expect(wrapper.text()).toContain('MAE (Adverse)')
    expect(wrapper.text()).toContain('Execution & Mindset')
  })
})