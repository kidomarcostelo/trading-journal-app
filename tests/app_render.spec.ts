import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, Suspense, defineComponent } from 'vue'
import IndexPage from '../pages/dashboard.vue'

vi.mock('lucide-vue-next', () => ({
  Terminal: { render: () => h('div', { 'data-testid': 'terminal-icon' }) },
  PlusCircle: { render: () => h('div', { 'data-testid': 'plus-icon' }) },
  LayoutGrid: { render: () => h('div', { 'data-testid': 'grid-icon' }) },
  List: { render: () => h('div', { 'data-testid': 'list-icon' }) },
  RefreshCw: { render: () => h('div', { 'data-testid': 'refresh-icon' }) },
  LayoutDashboard: { render: () => h('div', { 'data-testid': 'dashboard-icon' }) },
  Moon: { render: () => h('div', { 'data-testid': 'moon-icon' }) },
  Sun: { render: () => h('div', { 'data-testid': 'sun-icon' }) },
  FileText: { render: () => h('div') },
  Settings: { render: () => h('div') },
  Save: { render: () => h('div') },
  Loader2: { render: () => h('div') },
  Image: { render: () => h('div') },
  ChevronsUpDown: { render: () => h('div') },
  ChevronsLeft: { render: () => h('div') },
  ChevronsRight: { render: () => h('div') },
  PanelLeftClose: { render: () => h('div') },
  PanelLeftOpen: { render: () => h('div') },
  Check: { render: () => h('div') },
  X: { render: () => h('div') },
  ArrowRight: { render: () => h('div') },
  Filter: { render: () => h('div') },
  ArrowUpDown: { render: () => h('div') },
  ArrowUp: { render: () => h('div', { 'data-testid': 'arrow-up' }) },
  ArrowDown: { render: () => h('div', { 'data-testid': 'arrow-down' }) },
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
        TradeGallery: true,
        Combobox: true,
        PaneNav: true,
        TradeStats: true,
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

describe('Index Page', () => {
  it('renders the system title', async () => {
    const wrapper = mountSuspense(IndexPage)
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(wrapper.text()).toContain('Trades')
  })
})
