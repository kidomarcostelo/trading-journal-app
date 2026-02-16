import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, Suspense, defineComponent } from 'vue'
import IndexPage from '../pages/dashboard.vue'

vi.mock('lucide-vue-next', () => ({
  LayoutDashboard: { render: () => h('div', { 'data-testid': 'dashboard-icon' }) },
  PlusCircle: { render: () => h('div') },
  Settings: { render: () => h('div') },
  FileText: { render: () => h('div') },
  List: { render: () => h('div') },
  RefreshCw: { render: () => h('div') },
  Moon: { render: () => h('div') },
  Sun: { render: () => h('div') },
  ChevronsLeft: { render: () => h('div') },
  ChevronsRight: { render: () => h('div') },
  Filter: { render: () => h('div') },
  ArrowUp: { render: () => h('div') },
  ArrowDown: { render: () => h('div') },
  LogOut: { render: () => h('div') }
}))

// Mock useFetch
vi.stubGlobal('useFetch', vi.fn().mockImplementation((url) => {
  if (url === '/api/trades') {
    return { data: { value: [] }, refresh: vi.fn(), pending: { value: false } }
  }
  if (url === '/api/config') {
    return { data: { value: [] }, refresh: vi.fn(), pending: { value: false } }
  }
  return { data: { value: null } }
}))

// Mock useState
vi.stubGlobal('useState', vi.fn((key, init) => {
  return { value: init ? init() : null }
}))

// Mock nuxt-auth-utils
vi.stubGlobal('useUserSession', vi.fn().mockReturnValue({
  user: { value: { email: 'test@example.com' } },
  clear: vi.fn()
}))

const mountSuspense = (component: any) => {
  return mount(defineComponent({
    render() {
      return h(Suspense, null, {
        default: h(component),
        fallback: h('div', 'Loading...')
      })
    }
  }), {
    global: {
      stubs: {
        TradeForm: true,
        TradeList: true,
        TradeDataTable: true,
        TradeStats: true,
        PaneNav: true,
        StrategyAccordion: true,
        PsychologyGrid: true,
        TradingViewChart: true,
        TradeScreenshots: true,
        TradeReview: true,
        CollapsibleSection: true
      }
    }
  })
}

describe('3-Pane Dashboard Layout', () => {
  it('contains three main panes: Navigation, List, and Detail', async () => {
    const wrapper = mountSuspense(IndexPage)
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // We expect the three panes to exist (they might be within components or direct elements)
    // Looking at index.vue template:
    // Pane 1: Navigation Sidebar (contains PaneNav)
    // Pane 2: Trade List (section with data-testid="pane-list")
    // Pane 3: Main Detail View (main with data-testid="pane-detail")
    
    expect(wrapper.find('[data-testid="pane-list"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="pane-detail"]').exists()).toBe(true)
  })
})
