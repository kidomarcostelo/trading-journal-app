import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick, ref, computed, Suspense, defineComponent } from 'vue'
import Dashboard from '../../pages/dashboard.vue'

// Mock icons
vi.mock('lucide-vue-next', () => ({
  LayoutDashboard: { render: () => h('div') },
  PlusCircle: { render: () => h('div') },
  RefreshCw: { render: () => h('div') },
  ChevronsLeft: { render: () => h('div') },
  ChevronsRight: { render: () => h('div') },
  Filter: { render: () => h('div') },
  ArrowUp: { render: () => h('div') },
  ArrowDown: { render: () => h('div') },
  Trash2: { render: () => h('div') },
  FileText: { render: () => h('div') }
}))

// Mock Data
const mockTradesData = ref<any[]>([])

// Mocks
vi.stubGlobal('useFetch', vi.fn().mockImplementation((url) => {
  if (url === '/api/trades') return { data: mockTradesData, refresh: vi.fn(), pending: ref(false) }
  return { data: ref([]), refresh: vi.fn(), pending: ref(false) }
}))

vi.mock('~/composables/useUI', () => ({ useUI: () => ({ sidebarWidth: ref(200), activeTab: ref('dashboard') }) }))
vi.mock('~/composables/useSettings', () => ({ useSettings: () => ({ settings: ref({ panels: [] }), loading: ref(false), fetchSettings: vi.fn() }) }))
vi.stubGlobal('useState', vi.fn((key, init) => ({ value: init ? init() : null })))
vi.stubGlobal('useUserSession', vi.fn().mockReturnValue({ user: ref({ email: 'test@example.com' }), clear: vi.fn() }))
vi.stubGlobal('$fetch', vi.fn())

// Use Real Logic for Analytics to verify the switching behavior
vi.mock('~/composables/useAnalytics', async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual
  }
})

// Mock Trades Logic to return data
vi.mock('~/composables/useTrades', () => ({
  useTrades: (trades: any) => ({
    filterPeriod: ref('week'),
    sortBy: ref('Date'),
    sortDir: ref('desc'),
    filteredTrades: computed(() => trades.value)
  })
}))

vi.mock('~/composables/useAutoSave', () => ({ 
  useAutoSave: () => ({ 
    saveMode: ref('auto'), 
    isDirty: ref(false), 
    dirtyTradeIds: ref(new Set()), 
    trackChange: vi.fn(),
    onNavigate: vi.fn() // Added missing mock
  }) 
}))
vi.mock('~/composables/useToast', () => ({ useToast: () => ({ addToast: vi.fn() }) }))
vi.mock('~/composables/useDuration', () => ({ useDuration: () => ({ getDuration: () => '1d', formatDuration: (v:any) => v }) }))

const mountSuspense = () => {
  return mount(defineComponent({
    render() { return h(Suspense, null, { default: h(Dashboard), fallback: h('div', 'Loading...') }) }
  }), {
    global: {
      stubs: {
        TradeForm: true,
        TradeList: { template: '<div class="trade-list-stub"><div v-for="t in trades" :key="t.id" :class="`trade-item-${t.id}`" @click="$emit(\'select\', t.id)"></div></div>', props: ['trades'] },
        CollapsibleSection: { template: '<div><slot /></div>' },
        SaveControls: true, DeleteConfirmationModal: true, ChipPanel: true, NuxtLink: true, CalendarRange: true
      }
    }
  })
}

describe('Dashboard Contextual Analytics', () => {
  beforeEach(() => {
    mockTradesData.value = [
      { id: '1', Pair: 'BTC/USD', Status: 'Closed', pnl: 100 }, // Win
      { id: '2', Pair: 'ETH/USD', Status: 'Closed', pnl: -100 }, // Loss
      { id: '3', Pair: 'BTC/USD', Status: 'Closed', pnl: 100 }  // Win
    ]
  })

  it('updates analytics based on the selected trade pair', async () => {
    const wrapper = mountSuspense()
    await new Promise(resolve => setTimeout(resolve, 50))
    await nextTick()

    // 1. Select Trade 1 (BTC)
    await wrapper.find('.trade-item-1').trigger('click')
    await nextTick()

    // 2. Open Analytics Tab
    const buttons = wrapper.findAll('button')
    const analyticsBtn = buttons.find(b => b.text().includes('Analytics'))
    await analyticsBtn?.trigger('click')
    await nextTick()

    // 3. Verify Analytics for BTC (Trade 1 & 3 = 2 Wins, 100% Win Rate)
    // We look for "Win Rate" and the value "100%"
    // Since we are using the real component (not stubbed), we can check text.
    expect(wrapper.text()).toContain('Win Rate')
    expect(wrapper.text()).toContain('100%')

    // 4. Select Trade 2 (ETH)
    await wrapper.find('.trade-item-2').trigger('click')
    await nextTick()

    // 5. Verify Analytics for ETH (Trade 2 = 1 Loss, 0% Win Rate)
    expect(wrapper.text()).toContain('Win Rate')
    expect(wrapper.text()).toContain('0%')
  })
})
