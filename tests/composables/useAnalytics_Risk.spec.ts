import { describe, it, expect, vi } from 'vitest'
import { useAnalytics } from '../../composables/useAnalytics'

// Mocking useFetch or global $fetch
global.$fetch = vi.fn()

describe('useAnalytics Risk Fetching', () => {
  const { fetchRiskData } = useAnalytics()

  it('should fetch risk data from the API', async () => {
    const mockResponse = {
      riskOfRuin: 0.1,
      equityCurve: [{ date: '2023-01-01', equity: 1000 }],
      metrics: { winRate: 0.5, edge: 100 }
    }
    
    ;(global.$fetch as any).mockResolvedValue(mockResponse)

    const data = await fetchRiskData(10000, 0.02)
    
    expect(global.$fetch).toHaveBeenCalledWith('/api/analytics/risk', {
      query: { initialBalance: 10000, riskPerTrade: 0.02 }
    })
    expect(data).toEqual(mockResponse)
  })

  it('should handle API errors gracefully', async () => {
    ;(global.$fetch as any).mockRejectedValue(new Error('API Error'))
    
    await expect(fetchRiskData(10000, 0.02)).rejects.toThrow('API Error')
  })
})
