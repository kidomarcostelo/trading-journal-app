import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import AnalyticsPage from '../../pages/analytics.vue'
import AnalyticsDashboard from '../../components/AnalyticsDashboard.vue'
import PairSidebar from '../../components/PairSidebar.vue'
import PairGallery from '../../components/PairGallery.vue'

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
    const today = new Date().toISOString()
    vi.stubGlobal('useFetch', () => ({
      data: ref([
        { id: '1', pair: 'BTC/USD', pnl: 100, status: 'Closed', date: today },
        { id: '2', pair: 'ETH/USD', pnl: 200, status: 'Closed', date: today }
      ]),
      refresh: vi.fn(),
      pending: ref(false)
    }))

    // Mock useAnalytics to avoid issues with missing functions or API calls
    vi.mock('~/composables/useAnalytics', () => ({
      useAnalytics: () => ({
        getPairStats: () => ({ winRate: 100, pnl: 100, count: 1 }),
        getTopProfitablePairs: () => [
          { pair: 'BTC/USD', pnl: 100, count: 1 },
          { pair: 'ETH/USD', pnl: 200, count: 1 }
        ]
      })
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
    expect(wrapper.findComponent(AnalyticsDashboard).exists()).toBe(true)
    expect(wrapper.findComponent(PairSidebar).exists()).toBe(false)

    // Click Pair Analysis tab
    const tabs = wrapper.findAll('button')
    const pairTab = tabs.find(t => t.text().includes('Pair Analysis'))
    if (!pairTab) throw new Error('Pair Analysis tab not found')
    
    await pairTab.trigger('click')
    await flushPromises()

    // Now shows Pair view
    expect(wrapper.findComponent(AnalyticsDashboard).exists()).toBe(false)
    expect(wrapper.findComponent(PairSidebar).exists()).toBe(true)
    expect(wrapper.findComponent(PairGallery).exists()).toBe(true)
  })
})