import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, Suspense, defineComponent } from 'vue'
import App from '../app.vue'

vi.mock('lucide-vue-next', () => ({
  Terminal: { render: () => h('div', { 'data-testid': 'terminal-icon' }) },
  PlusCircle: { render: () => h('div', { 'data-testid': 'plus-icon' }) },
  LayoutGrid: { render: () => h('div', { 'data-testid': 'grid-icon' }) },
  List: { render: () => h('div', { 'data-testid': 'list-icon' }) },
  RefreshCw: { render: () => h('div', { 'data-testid': 'refresh-icon' }) },
  LayoutDashboard: { render: () => h('div', { 'data-testid': 'dashboard-icon' }) },
  Save: { render: () => h('div') },
  Loader2: { render: () => h('div') },
  Image: { render: () => h('div') },
  ChevronsUpDown: { render: () => h('div') },
  Check: { render: () => h('div') },
  X: { render: () => h('div') },
  ArrowRight: { render: () => h('div') }
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
        Combobox: true
      }
    }
  })
}

describe('App.vue', () => {
  it('renders the system title', async () => {
    const wrapper = mountSuspense(App)
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(wrapper.text()).toContain('Trading Journal')
  })

  // I removed the Terminal icon from the main view (replaced with LayoutDashboard inside a div) 
  // actually I kept Terminal as a placeholder in imports but used LayoutDashboard in the template. 
  // Let's check the template: 
  // <div class="p-2 ..."><LayoutDashboard ... /></div> 
  // So 'terminal-icon' (mock for Terminal) might NOT be there if I removed <Terminal />.
  // Wait, I see <Terminal class="w-8 h-8..." /> is gone?
  // In previous App.vue: <Terminal ... />
  // In new App.vue: <LayoutDashboard ... />
  // So I should check for dashboard-icon.

  it('contains the dashboard icon', async () => {
    const wrapper = mountSuspense(App)
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(wrapper.find('[data-testid="dashboard-icon"]').exists()).toBe(true)
  })
})