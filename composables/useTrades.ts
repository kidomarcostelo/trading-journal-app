import { computed, ref, type Ref } from 'vue'
import type { Trade } from '../types'

export type FilterPeriod = 'week' | 'month' | 'all'
export type SortField = 'Status' | 'Date' | 'Pair'

export const useTrades = (trades: Ref<Trade[]>) => {
  const filterPeriod = ref<FilterPeriod>('all')
  const sortBy = ref<SortField>('Date')

  const filteredTrades = computed(() => {
    let result = [...trades.value]

    // Filtering
    if (filterPeriod.value !== 'all') {
      const now = new Date('2026-01-11') // Mocked current date for logic consistency
      
      result = result.filter(t => {
        if (!t.Date) return false
        const tDate = new Date(t.Date)
        if (isNaN(tDate.getTime())) return false

        if (filterPeriod.value === 'week') {
          // Calculate start of week (Sunday)
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - now.getDay())
          startOfWeek.setHours(0, 0, 0, 0)
          return tDate >= startOfWeek
        }

        if (filterPeriod.value === 'month') {
          return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()
        }

        return true
      })
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy.value === 'Status') {
        const order = { 'Open': 0, 'Closed': 1, 'Cancelled': 2, 'Missed': 3 }
        const aVal = order[a.Status as keyof typeof order] ?? 99
        const bVal = order[b.Status as keyof typeof order] ?? 99
        return aVal - bVal
      }
      
      if (sortBy.value === 'Date') {
        const aDate = new Date(a.Date || 0).getTime()
        const bDate = new Date(b.Date || 0).getTime()
        return bDate - aDate // Descending
      }

      if (sortBy.value === 'Pair') {
        return (a.Pair || '').localeCompare(b.Pair || '')
      }

      return 0
    })

    return result
  })

  return {
    filterPeriod,
    sortBy,
    filteredTrades
  }
}
