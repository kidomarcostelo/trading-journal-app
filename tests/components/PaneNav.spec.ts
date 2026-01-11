import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PaneNav from '../../components/PaneNav.vue'
import { h } from 'vue'

// Mock lucide icons
vi.mock('lucide-vue-next', () => ({
  LayoutDashboard: { render: () => h('div') },
  FileText: { render: () => h('div') },
  List: { render: () => h('div') },
  Settings: { render: () => h('div') },
  Moon: { render: () => h('div') },
  Sun: { render: () => h('div') }
}))

describe('PaneNav', () => {
  it('renders navigation links', () => {
    const wrapper = mount(PaneNav, {
      props: {
        activeTab: 'daily-trades',
        isDark: true
      }
    })
    
    expect(wrapper.text()).toContain('Daily Report')
    expect(wrapper.text()).toContain('Daily Trades')
    expect(wrapper.text()).toContain('Settings')
  })

  it('emits update:activeTab when a link is clicked', async () => {
    const wrapper = mount(PaneNav, {
      props: {
        activeTab: 'daily-trades',
        isDark: true
      }
    })
    
    const reportButton = wrapper.findAll('button').find(b => b.text().includes('Daily Report'))
    await reportButton?.trigger('click')
    
    expect(wrapper.emitted('update:activeTab')?.[0]).toEqual(['daily-report'])
  })

  it('emits toggle-theme when theme button is clicked', async () => {
    const wrapper = mount(PaneNav, {
      props: {
        activeTab: 'daily-trades',
        isDark: true
      }
    })
    
    const themeButton = wrapper.findAll('button').find(b => b.text().includes('Dark Mode') || b.text().includes('Light Mode'))
    await themeButton?.trigger('click')
    
    expect(wrapper.emitted('toggle-theme')).toBeTruthy()
  })
})
