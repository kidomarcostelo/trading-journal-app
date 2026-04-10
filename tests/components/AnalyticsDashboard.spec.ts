import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AnalyticsDashboard from '../../components/AnalyticsDashboard.vue'

// Mock useAnalytics
vi.mock('~/composables/useAnalytics', () => ({
  useAnalytics: () => ({
    calculateProfitFactor: () => 2.5,
    calculateWinRate: () => 60.0,
    calculateExpectancy: () => 150.0,
    calculateAverageRMultiple: () => 0,
    calculateAverageHoldingTime: () => ({ wins: 86400000, losses: 172800000 }), // 1d, 2d
    calculateBehavioralStats: () => ({
      executionRate: 95.0,
      mentalDistribution: { A: 10, B: 5, C: 2 },
      emotionFrequency: { 'Calm': 8, 'Greed': 3 }
    }),
    fetchRiskData: vi.fn().mockResolvedValue({
      riskOfRuin: 0.05,
      equityCurve: []
    }),
    calculateMaxDrawdown: vi.fn().mockReturnValue(5.0),
    calculateMaxConsecutiveLosses: vi.fn().mockReturnValue(2)
  })
}))

// Mock useToast
vi.mock('~/composables/useToast', () => ({
  useToast: () => ({
    addToast: vi.fn()
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
        trades: []
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

  it('renders backfill section', () => {
    const wrapper = mount(AnalyticsDashboard, {
      props: {
        trades: []
      }
    })

    expect(wrapper.text()).toContain('Backfill MAE/MFE')
    expect(wrapper.text()).toContain('Run Backfill')
  })

  it('renders charts section', () => {
    const wrapper = mount(AnalyticsDashboard, {
      props: {
        trades: []
      },
      global: {
        stubs: {
          'EquityCurveChart': true,
          'PerformanceHeatmap': true,
          'RiskDashboard': true
        }
      }
    })

    expect(wrapper.findComponent({ name: 'EquityCurveChart' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'PerformanceHeatmap' }).exists()).toBe(true)
  })

  it('renders behavioral metrics', () => {
    const wrapper = mount(AnalyticsDashboard, {
      props: {
        trades: []
      }
    })

    expect(wrapper.text()).toContain('Execution %')
    expect(wrapper.text()).toContain('95%')
    expect(wrapper.text()).toContain('Mental Distribution')
    expect(wrapper.text()).toContain('Common Emotions')
    expect(wrapper.text()).toContain('Calm')
    expect(wrapper.text()).toContain('8')
  })
})
