import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, Suspense, defineComponent } from 'vue'
import App from '../app.vue'

vi.mock('lucide-vue-next', () => ({
  Terminal: { render: () => h('div') },
  PlusCircle: { render: () => h('div') },
  LayoutGrid: { render: () => h('div') },
  List: { render: () => h('div') },
  RefreshCw: { render: () => h('div') },
  LayoutDashboard: { render: () => h('div') },
  Moon: { render: () => h('div') },
  Sun: { render: () => h('div') },
  Save: { render: () => h('div') },
  Loader2: { render: () => h('div') },
  Image: { render: () => h('div') },
  ChevronsUpDown: { render: () => h('div') },
  Check: { render: () => h('div') },
  X: { render: () => h('div') },
  ArrowRight: { render: () => h('div') },
  DailyReport: { render: () => h('div') },
  Settings: { render: () => h('div') },
  FileText: { render: () => h('div') }
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
        PaneList: true,
        PaneDetail: true
      }
    }
  })
}

describe('3-Pane Dashboard Layout', () => {
  it('contains three main panes: Navigation, List, and Detail', async () => {
    const wrapper = mountSuspense(App)
    await new Promise(resolve => setTimeout(resolve, 50))
    
    expect(wrapper.find('[data-testid="pane-nav"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="pane-list"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="pane-detail"]').exists()).toBe(true)
  })

  it('Navigation pane contains links for Daily Report, Daily Trades, and Settings', async () => {
    const wrapper = mountSuspense(App)
    await new Promise(resolve => setTimeout(resolve, 50))
    
    const navPane = wrapper.find('[data-testid="pane-nav"]')
    expect(navPane.text()).toContain('Daily Report')
    expect(navPane.text()).toContain('Daily Trades')
    expect(navPane.text()).toContain('Settings')
  })
})
