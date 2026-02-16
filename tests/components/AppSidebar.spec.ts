import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppSidebar from '../../components/AppSidebar.vue'

// Mock dependencies
import { h, ref } from 'vue'

vi.mock('lucide-vue-next', () => ({
  LogOut: { name: 'LogOut', render: () => h('div', { class: 'logout-icon' }) }
}))

// Mock useUI
const activeTabMock = ref('daily-trades')
const sidebarWidthMock = ref(240)
const isSidebarCollapsedMock = ref(false)
const toggleSidebarMock = vi.fn()

vi.mock('~/composables/useUI', () => ({
  useUI: vi.fn(() => ({
    activeTab: activeTabMock,
    sidebarWidth: sidebarWidthMock,
    isSidebarCollapsed: isSidebarCollapsedMock,
    toggleSidebar: toggleSidebarMock
  }))
}))

// Mock useUserSession
const clearMock = vi.fn()
vi.mock('#auth', () => ({})) // prevent Nuxt auth import issues if any
vi.stubGlobal('useUserSession', vi.fn().mockReturnValue({
  user: ref({ email: 'test@example.com' }),
  clear: clearMock
}))

// Mock router
const pushMock = vi.fn()
vi.stubGlobal('navigateTo', pushMock)
vi.stubGlobal('useRoute', vi.fn(() => ({ path: '/dashboard' })))

describe('AppSidebar', () => {
  it('renders correctly', () => {
    const wrapper = mount(AppSidebar, {
      global: {
        stubs: {
          PaneNav: {
            template: `
              <div class="pane-nav-stub">
                <button @click="$emit('update:activeTab', 'settings')">Settings</button>
                <button @click="$emit('update:activeTab', 'daily-trades')">Dashboard</button>
              </div>
            `,
            props: ['activeTab', 'collapsed']
          }
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('navigates to settings when settings tab is selected', async () => {
    const wrapper = mount(AppSidebar, {
      global: {
        stubs: {
          PaneNav: {
            template: `<button class="settings-btn" @click="$emit('update:activeTab', 'settings')">Settings</button>`,
            props: ['activeTab', 'collapsed']
          }
        }
      }
    })

    await wrapper.find('.settings-btn').trigger('click')
    
    expect(activeTabMock.value).toBe('settings')
    expect(pushMock).toHaveBeenCalledWith('/settings')
  })

  it('navigates to dashboard when other tab is selected', async () => {
    const wrapper = mount(AppSidebar, {
      global: {
        stubs: {
          PaneNav: {
            template: `<button class="dashboard-btn" @click="$emit('update:activeTab', 'daily-trades')">Dashboard</button>`,
            props: ['activeTab', 'collapsed']
          }
        }
      }
    })

    await wrapper.find('.dashboard-btn').trigger('click')
    
    expect(activeTabMock.value).toBe('daily-trades')
    expect(pushMock).toHaveBeenCalledWith('/dashboard')
  })

  it('logs out user', async () => {
    const wrapper = mount(AppSidebar, {
      global: {
        stubs: {
          PaneNav: true
        }
      }
    })

    // Find logout button by icon class or text
    const logoutBtn = wrapper.findAll('button').find(b => 
      b.text().includes('test') || 
      b.find('.logout-icon').exists()
    )
    
    if (logoutBtn) {
        await logoutBtn.trigger('click')
        expect(clearMock).toHaveBeenCalled()
        expect(pushMock).toHaveBeenCalledWith('/login')
    } else {
        throw new Error('Logout button not found')
    }
  })
})
