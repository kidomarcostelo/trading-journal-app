import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AnalyticsDashboard from '../../components/AnalyticsDashboard.vue'
import { ref } from 'vue'

// Mock useAnalytics
vi.mock('~/composables/useAnalytics', () => ({
  useAnalytics: () => ({
    calculateProfitFactor: () => 2.5,
    calculateWinRate: () => 60.0,
    calculateExpectancy: () => 150.0,
    calculateAverageRMultiple: () => 0,
    calculateAverageHoldingTime: () => ({ wins: 86400000, losses: 172800000 }) // 1d, 2d
  })
}))

// Mock useDuration to format the holding time
vi.mock('~/composables/useDuration', () => ({
  useDuration: () => ({
    formatDuration: (ms: number) => ms === 86400000 ? '1d' : '2d'
  })
}))

describe('AnalyticsDashboard', () => {
  it('renders core metrics correctly', () => {
    const wrapper = mount(AnalyticsDashboard, {
      props: {
        trades: [] // Mock trades, the composable mock handles the return values
      }
    })

    expect(wrapper.text()).toContain('Profit Factor')
    expect(wrapper.text()).toContain('2.5')
    
    expect(wrapper.text()).toContain('Win Rate')
    expect(wrapper.text()).toContain('60%')

    expect(wrapper.text()).toContain('Expectancy')
    expect(wrapper.text()).toContain('150')
  })

  it('renders average holding times', () => {
    const wrapper = mount(AnalyticsDashboard, {
      props: {
        trades: []
      }
    })

    expect(wrapper.text()).toContain('Avg Hold (Win)')
    expect(wrapper.text()).toContain('1d')

    expect(wrapper.text()).toContain('Avg Hold (Loss)')
    expect(wrapper.text()).toContain('2d')
  })
})
