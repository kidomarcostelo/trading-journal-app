import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick, ref, computed, Suspense, defineComponent } from 'vue'
import IndexPage from '../../pages/dashboard.vue'

// Mock dependencies
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
}))

const mockTradesData = ref([])
vi.stubGlobal('useFetch', vi.fn().mockReturnValue({ 
    data: mockTradesData, 
    refresh: vi.fn(), 
    pending: ref(false) 
}))

// Mock useState
vi.stubGlobal('useState', vi.fn((key, init) => {
  return { value: init ? init() : null }
}))

vi.stubGlobal('useUserSession', vi.fn().mockReturnValue({
  user: ref({ email: 'test@example.com' }),
  clear: vi.fn()
}))

vi.stubGlobal('navigateTo', vi.fn())
vi.stubGlobal('$fetch', vi.fn())

// Mock composables
vi.mock('~/composables/useTrades', () => ({
  useTrades: vi.fn(() => ({
    filterPeriod: ref('all'),
    sortBy: ref('Date'),
    sortDir: ref('desc'),
    filteredTrades: computed(() => [])
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
  useToast: vi.fn(() => ({ addToast: vi.fn() }))
}))

vi.mock('~/composables/useDuration', () => ({
  useDuration: vi.fn(() => ({ getDuration: vi.fn() }))
}))

const mountSuspense = () => {
  return mount(defineComponent({
    render() {
      return h(Suspense, null, {
        default: h(IndexPage),
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
        PaneNav: {
            template: `<button class="pane-nav-stub" @click="$emit('update:activeTab', 'settings')">Settings</button>`,
            props: ['activeTab']
        },
        StrategyAccordion: true,
        PsychologyGrid: true,
        TradingViewChart: true,
        TradeScreenshots: true,
        TradeReview: true,
        CollapsibleSection: true,
        SaveControls: true,
        ToastNotification: true,
        DeleteConfirmationModal: true
      }
    }
  })
}

describe('Index Page - Settings Integration', () => {

  it('navigates to settings page when activeTab becomes settings', async () => {

    const wrapper = mountSuspense()

    await new Promise(resolve => setTimeout(resolve, 50)) // Wait for suspense



    // Click settings in PaneNav stub

    await wrapper.find('.pane-nav-stub').trigger('click')

    await nextTick()

    

    // Should navigate to settings

    expect(navigateTo).toHaveBeenCalledWith('/settings')

  })

})
