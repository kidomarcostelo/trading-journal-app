import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PaneNav from '../../components/PaneNav.vue'
import { h, reactive, computed } from 'vue'

// Mock lucide icons
vi.mock('lucide-vue-next', () => ({
  LayoutDashboard: { render: () => h('div') },
  FileText: { render: () => h('div') },
  List: { render: () => h('div') },
  BarChart3: { render: () => h('div') },
  Settings: { render: () => h('div') },
  Moon: { render: () => h('div') },
  Sun: { render: () => h('div') },
  PanelLeftClose: { render: () => h('div') },
  PanelLeftOpen: { render: () => h('div') }
}))

// Mock useColorMode with reactive state to simulate toggle
const colorModeMock = reactive({
  value: 'dark',
  preference: 'dark',
  unknown: false,
  forced: false
})

vi.stubGlobal('useColorMode', () => colorModeMock)
vi.stubGlobal('computed', computed)

describe('PaneNav', () => {
  it('renders navigation links', () => {
    const wrapper = mount(PaneNav, {
      props: {
        activeTab: 'daily-trades'
      }
    })
    
    expect(wrapper.text()).toContain('Daily Report')
    expect(wrapper.text()).toContain('Daily Trades')
    expect(wrapper.text()).toContain('Settings')
  })

  it('emits update:activeTab when a link is clicked', async () => {
    const wrapper = mount(PaneNav, {
      props: {
        activeTab: 'daily-trades'
      }
    })
    
    const reportButton = wrapper.findAll('button').find(b => b.text().includes('Daily Report'))
    await reportButton?.trigger('click')
    
    expect(wrapper.emitted('update:activeTab')?.[0]).toEqual(['daily-report'])
  })

  it('toggles theme preference when theme button is clicked', async () => {
    // Reset mock
    colorModeMock.value = 'dark'
    colorModeMock.preference = 'dark'

    const wrapper = mount(PaneNav, {
      props: {
        activeTab: 'daily-trades'
      }
    })
    
    const themeButton = wrapper.findAll('button').find(b => b.text().includes('Dark Mode') || b.text().includes('Light Mode'))
    await themeButton?.trigger('click')
    
    // Check if preference changed
    expect(colorModeMock.preference).toBe('light')
  })
})