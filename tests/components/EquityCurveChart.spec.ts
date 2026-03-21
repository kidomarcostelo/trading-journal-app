import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, defineComponent } from 'vue'
import EquityCurveChart from '../../components/EquityCurveChart.vue'

// Mock ApexCharts
vi.mock('vue3-apexcharts', () => ({
  default: defineComponent({
    name: 'ApexChart',
    props: ['options', 'series'],
    render() {
      return h('div', { 'data-testid': 'mock-apexchart' })
    }
  })
}))

describe('EquityCurveChart', () => {
  const mockData = [
    { date: 'Initial', equity: 1000 },
    { date: '2023-01-01', equity: 1100 },
    { date: '2023-01-02', equity: 1050 },
  ]

  it('renders correctly with data', () => {
    const wrapper = mount(EquityCurveChart, {
      props: { data: mockData },
      global: {
        stubs: {
          'client-only': { template: '<div><slot /></div>' },
          'apexchart': true
        }
      }
    })

    expect(wrapper.text()).toContain('Equity Curve')
    expect(wrapper.findComponent({ name: 'apexchart' }).exists()).toBe(true)
  })
})
