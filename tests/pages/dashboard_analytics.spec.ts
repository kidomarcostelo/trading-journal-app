import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick, ref, computed, Suspense, defineComponent } from 'vue'
import Dashboard from '../../pages/dashboard.vue'

// Mock Lucide icons
vi.mock('lucide-vue-next', () => ({
  LayoutDashboard: { render: () => h('div') },
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
  LogOut: { render: () => h('div') },
  Trash2: { render: () => h('div') },
  MoreVertical: { render: () => h('div') }
}))

// Mock useFetch
const mockTradesData = ref<any[]>([])
vi.stubGlobal('useFetch', vi.fn().mockImplementation((url) => {
  if (url === '/api/trades') {
    return { data: mockTradesData, refresh: vi.fn(), pending: ref(false) }
  }
  if (url === '/api/config') {
    return { data: ref([]), refresh: vi.fn(), pending: ref(false) }
  }
  return { data: ref(null) }
}))

// Mock useUI
vi.mock('~/composables/useUI', () => ({
  useUI: () => ({
    sidebarWidth: ref(200),
    activeTab: ref('dashboard')
  })
}))

// Mock settings
vi.mock('~/composables/useSettings', () => ({
  useSettings: () => ({
    settings: ref({ panels: [] }),
    loading: ref(false),
    fetchSettings: vi.fn()
  })
}))

vi.stubGlobal('useState', vi.fn((key, init) => {
  return { value: init ? init() : null }
}))

vi.stubGlobal('useUserSession', vi.fn().mockReturnValue({
  user: ref({ email: 'test@example.com' }),
  clear: vi.fn()
}))

vi.stubGlobal('$fetch', vi.fn())

vi.mock('~/composables/useTrades', () => ({
  useTrades: vi.fn((trades) => ({
    filterPeriod: ref('week'),
    sortBy: ref('Date'),
    sortDir: ref('desc'),
    filteredTrades: computed(() => trades.value)
  }))
}))

vi.mock('~/composables/useAutoSave', () => ({
  useAutoSave: vi.fn(() => ({
    saveMode: ref('auto'),
    isDirty: ref(false),
    dirtyTradeIds: ref(new Set()),
    isLoading: ref(false),
    trackChange: vi.fn(),
    triggerSave: vi.fn(),
    onNavigate: vi.fn()
  }))
}))

vi.mock('~/composables/useToast', () => ({
  useToast: vi.fn(() => ({
    addToast: vi.fn()
  }))
}))

vi.mock('~/composables/useDuration', () => ({
  useDuration: vi.fn(() => ({
    getDuration: vi.fn(() => '1d')
  }))
}))

const mountSuspense = () => {
  return mount(defineComponent({
    render() {
      return h(Suspense, null, {
        default: h(Dashboard),
        fallback: h('div', 'Loading...')
      })
    }
  }), {
    global: {
      stubs: {
        TradeForm: true,
        TradeList: {
            template: '<div class="trade-list-stub" @click="$emit(\'select\', \'1\')"></div>',
            props: ['trades']
        },
        TradeDataTable: true,
        TradeStats: true,
        PaneNav: true,
        TradeScreenshots: true,
        TradeReview: true,
        AnalyticsDashboard: {
          template: '<div data-testid="analytics-stub">Analytics Content</div>',
          props: ['trades']
        },
        CollapsibleSection: {
            template: '<div><slot /></div>',
            props: ['title']
        },
        SaveControls: true,
        FloatingChecklist: true,
        DeleteConfirmationModal: true,
        ChipPanel: true,
        NuxtLink: true,
        CalendarRange: true
      }
    }
  })
}

describe('Dashboard Analytics Tab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTradesData.value = [{ id: '1', Pair: 'BTC/USD', Status: 'Open' }]
  })

  it('renders Analytics tab and switches content', async () => {
    const wrapper = mountSuspense()
    await new Promise(resolve => setTimeout(resolve, 50))
    await nextTick()

    // 0. Select a trade to show detail pane
    const tradeListStub = wrapper.find('.trade-list-stub')
    await tradeListStub.trigger('click')
    await nextTick()

    // 1. Find Analytics button
    const buttons = wrapper.findAll('button')
    const analyticsBtn = buttons.find(b => b.text().includes('Analytics'))
    expect(analyticsBtn).toBeDefined()

    // 2. Click it
    await analyticsBtn?.trigger('click')
    await nextTick()

    // 3. Check for AnalyticsDashboard stub
    const analyticsStub = wrapper.find('[data-testid="analytics-stub"]')
    expect(analyticsStub.exists()).toBe(true)
    expect(analyticsStub.text()).toBe('Analytics Content')
  })
})
