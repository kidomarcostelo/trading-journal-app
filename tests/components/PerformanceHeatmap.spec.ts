import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, defineComponent } from 'vue'
import PerformanceHeatmap from '../../components/PerformanceHeatmap.vue'

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

describe('PerformanceHeatmap', () => {
  it('renders correctly', () => {
    const wrapper = mount(PerformanceHeatmap, {
      props: { trades: [] },
      global: {
        stubs: {
          'client-only': { template: '<div><slot /></div>' },
          'apexchart': true
        }
      }
    })

    expect(wrapper.text()).toContain('Daily Performance')
    expect(wrapper.findComponent({ name: 'apexchart' }).exists()).toBe(true)
  })
})
