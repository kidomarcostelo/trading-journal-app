import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import AnalyticsPage from '../../pages/analytics.vue'

const globalStubs = {
  NuxtLink: true,
  AnalyticsDashboard: true,
  PairSidebar: true,
  PairGallery: true,
  CalendarRange: true,
  BarChart3: true,
  TrendingUp: true,
  RefreshCw: true,
  LayoutDashboard: true
}

describe('Analytics Page', () => {
  beforeAll(() => {
    vi.stubGlobal('useFetch', () => ({
      data: ref([
        { id: '1', pair: 'BTC/USD', pnl: 100, status: 'Closed' },
        { id: '2', pair: 'ETH/USD', pnl: 200, status: 'Closed' }
      ]),
      refresh: vi.fn(),
      pending: ref(false)
    }))
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('renders tabs for Overview and Pair Analysis', () => {
    const wrapper = mount(AnalyticsPage, {
      global: { stubs: globalStubs }
    })
    
    expect(wrapper.text()).toContain('Overview')
    expect(wrapper.text()).toContain('Pair Analysis')
  })

  it('switches to Pair Analysis view when tab is clicked', async () => {
    const wrapper = mount(AnalyticsPage, {
      global: { stubs: globalStubs }
    })

    // Initially shows AnalyticsDashboard
    expect(wrapper.findComponent({ name: 'AnalyticsDashboard' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'PairSidebar' }).exists()).toBe(false)

    // Click Pair Analysis tab
    const tabs = wrapper.findAll('button')
    const pairTab = tabs.find(t => t.text().includes('Pair Analysis'))
    if (!pairTab) throw new Error('Pair Analysis tab not found')
    
    await pairTab.trigger('click')
    await flushPromises()

    // Now shows Pair view
    expect(wrapper.findComponent({ name: 'AnalyticsDashboard' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'PairSidebar' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'PairGallery' }).exists()).toBe(true)
  })
})