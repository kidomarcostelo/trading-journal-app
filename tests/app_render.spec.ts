import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import App from '../app.vue'

vi.mock('lucide-vue-next', () => ({
  Terminal: { render: () => h('div', { 'data-testid': 'terminal-icon' }) },
  PlusCircle: { render: () => h('div', { 'data-testid': 'plus-icon' }) }
}))

describe('App.vue', () => {
  it('renders the system title', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          TradeForm: true
        }
      }
    })
    expect(wrapper.text()).toContain('Trading Journal System')
  })

  it('contains the terminal icon', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          TradeForm: true
        }
      }
    })
    expect(wrapper.find('[data-testid="terminal-icon"]').exists()).toBe(true)
  })
})
