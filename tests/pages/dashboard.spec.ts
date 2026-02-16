import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick, ref, computed, Suspense, defineComponent } from 'vue'
import IndexPage from '../../pages/dashboard.vue'

// Mock Lucide icons
vi.mock('lucide-vue-next', () => ({
  LayoutDashboard: { render: () => h('div') },
  PlusCircle: { render: () => h('div') },
  Settings: { render: () => h('div') },
  FileText: { render: () => h('div') },
  List: { render: () => h('div', { 'data-testid': 'list-icon' }) },
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
const mockTradesData = ref([{ ID: '1', Pair: 'BTC/USD', Status: 'Open' }, { ID: '2', Pair: 'ETH/USD', Status: 'Closed' }])
const mockRefresh = vi.fn()

vi.stubGlobal('useFetch', vi.fn().mockImplementation((url) => {
  if (url === '/api/trades') {
    return { data: mockTradesData, refresh: mockRefresh, pending: ref(false) }
  }
  if (url === '/api/config') {
    return { data: ref([]), refresh: vi.fn(), pending: ref(false) }
  }
  return { data: ref(null) }
}))

// Mock useState
vi.stubGlobal('useState', vi.fn((key, init) => {
  return { value: init ? init() : null }
}))

// Mock nuxt-auth-utils
vi.stubGlobal('useUserSession', vi.fn().mockReturnValue({
  user: ref({ email: 'test@example.com' }),
  clear: vi.fn()
}))

// Mock $fetch
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock composables
vi.mock('~/composables/useTrades', () => ({
  useTrades: vi.fn((trades) => ({
    filterPeriod: ref('all'),
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
        default: h(IndexPage),
        fallback: h('div', 'Loading...')
      })
    }
  }), {
    global: {
      stubs: {
        TradeForm: true,
        TradeList: {
          template: '<div class="trade-list-stub"><button class="delete-btn" @click="$emit(\'delete\', \'1\')">Delete 1</button></div>',
          props: ['trades', 'activeId']
        },
        TradeDataTable: true,
        TradeStats: true,
        PaneNav: true,
        StrategyAccordion: true,
        PsychologyGrid: true,
        TradingViewChart: true,
        TradeScreenshots: true,
        TradeReview: true,
        CollapsibleSection: true,
        SaveControls: true,
        ToastNotification: true,
        DeleteConfirmationModal: {
            template: '<div v-if="isOpen" class="modal-stub"><button class="confirm-btn" @click="$emit(\'confirm\')">Confirm</button></div>',
            props: ['isOpen', 'isDeleting']
        }
      }
    }
  })
}

describe('Index Page - Deletion Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTradesData.value = [{ ID: '1', Pair: 'BTC/USD', Status: 'Open' }, { ID: '2', Pair: 'ETH/USD', Status: 'Closed' }]
  })

  it('shows delete modal when TradeList emits delete', async () => {
    const wrapper = mountSuspense()
    await new Promise(resolve => setTimeout(resolve, 50))
    
    const deleteBtn = wrapper.find('.delete-btn')
    await deleteBtn.trigger('click')
    
    expect(wrapper.find('.modal-stub').exists()).toBe(true)
  })

  it('executes delete API call and updates state on confirm', async () => {
    mockFetch.mockResolvedValue({ success: true })
    const wrapper = mountSuspense()
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Trigger delete flow
    await wrapper.find('.delete-btn').trigger('click')
    
    // Confirm
    await wrapper.find('.confirm-btn').trigger('click')
    
    expect(mockFetch).toHaveBeenCalledWith('/api/trades', expect.objectContaining({
      method: 'DELETE',
      query: { id: '1' }
    }))
    
    await nextTick()
    // Should remove from local trades
    expect(mockTradesData.value.length).toBe(1)
    expect(mockTradesData.value[0].ID).toBe('2')
  })
})