import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RiskDashboard from '../../components/RiskDashboard.vue'

// Mock useAnalytics
vi.mock('../../composables/useAnalytics', () => ({
  useAnalytics: () => ({
    fetchRiskData: vi.fn().mockResolvedValue({
      riskOfRuin: 0.05,
      equityCurve: [{ equity: 1000 }, { equity: 950 }]
    }),
    calculateMaxDrawdown: vi.fn().mockReturnValue(5.0),
    calculateMaxConsecutiveLosses: vi.fn().mockReturnValue(2)
  })
}))

describe('RiskDashboard', () => {
  const mockTrades = [
    { id: '1', status: 'Closed', pnl: 100, date: '2023-01-01' },
    { id: '2', status: 'Closed', pnl: -50, date: '2023-01-02' },
  ]

  it('renders risk metrics correctly', async () => {
    const wrapper = mount(RiskDashboard, {
      props: {
        trades: mockTrades as any,
        initialBalance: 10000,
        riskPerTrade: 0.02
      }
    })

    // Wait for async setup
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('Risk of Ruin')
    expect(wrapper.text()).toContain('5.0%') // Risk of Ruin (0.05 * 100)
    expect(wrapper.text()).toContain('Max Drawdown')
    expect(wrapper.text()).toContain('5.0%') // MDD
    expect(wrapper.text()).toContain('Consecutive Losses')
    expect(wrapper.text()).toContain('2') // Consecutive losses
  })
})
