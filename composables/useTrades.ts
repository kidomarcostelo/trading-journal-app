import { computed, ref, type Ref } from 'vue'
import type { Trade } from '../types'

export type FilterPeriod = 'week' | 'month' | 'last-week' | 'last-month' | 'all'
export type SortField = 'Status' | 'Date' | 'Pair'
export type SortDir = 'asc' | 'desc'

export const useTrades = (trades: Ref<Trade[]>) => {
  const filterPeriod = ref<FilterPeriod>('all')
  const sortBy = ref<SortField>('Date')
  const sortDir = ref<SortDir>('desc')

  const getVal = (obj: any, key: string) => {
    const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase())
    return foundKey ? obj[foundKey] : undefined
  }

  const filteredTrades = computed(() => {
    let result = [...trades.value]

    // Helper to parse date from trade
    const getTradeDate = (t: any): Date | null => {
      // check multiple keys
      const val = getVal(t, 'date') || getVal(t, 'date created') || getVal(t, 'created at')
      if (!val) return null

      // Check for Excel Serial (number or string-number > 20000)
      if (!isNaN(Number(val)) && Number(val) > 20000) {
        // (Serial - 25569) * 86400 * 1000
        return new Date((Number(val) - 25569) * 86400 * 1000)
      }
      
      const d = new Date(val)
      return isNaN(d.getTime()) ? null : d
    }

    // Filtering
    if (filterPeriod.value !== 'all') {
      const now = new Date() // Use real current date
      
      // Calculate start of current week (Sunday)
      const startOfThisWeek = new Date(now)
      startOfThisWeek.setDate(now.getDate() - now.getDay())
      startOfThisWeek.setHours(0, 0, 0, 0)

      result = result.filter(t => {
        const tDate = getTradeDate(t)
        if (!tDate) return false

        if (filterPeriod.value === 'week') {
          return tDate >= startOfThisWeek
        }

        if (filterPeriod.value === 'last-week') {
          const startOfLastWeek = new Date(startOfThisWeek)
          startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)
          return tDate >= startOfLastWeek && tDate < startOfThisWeek
        }

        if (filterPeriod.value === 'month') {
          return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()
        }

        if (filterPeriod.value === 'last-month') {
          const lastMonthDate = new Date(now)
          lastMonthDate.setDate(1) // Avoid edge cases with day overflow (e.g. March 31 -> Feb 28)
          lastMonthDate.setMonth(now.getMonth() - 1)
          return tDate.getMonth() === lastMonthDate.getMonth() && tDate.getFullYear() === lastMonthDate.getFullYear()
        }

        return true
      })
    }

    // Sorting
    result.sort((a, b) => {
      let diff = 0
      
      if (sortBy.value === 'Status') {
        const order = { 'open': 0, 'closed': 1, 'cancelled': 2, 'missed': 3 }
        const aVal = order[String(getVal(a, 'status')).toLowerCase() as keyof typeof order] ?? 99
        const bVal = order[String(getVal(b, 'status')).toLowerCase() as keyof typeof order] ?? 99
        diff = aVal - bVal
      } else if (sortBy.value === 'Date') {
        const aDate = getTradeDate(a)?.getTime() || 0
        const bDate = getTradeDate(b)?.getTime() || 0
        diff = aDate - bDate 
      } else if (sortBy.value === 'Pair') {
        diff = (String(getVal(a, 'pair') || '')).localeCompare(String(getVal(b, 'pair') || ''))
      }

      // Apply Direction
      return sortDir.value === 'asc' ? diff : -diff
    })

    return result
  })

  return {
    filterPeriod,
    sortBy,
    sortDir,
    filteredTrades
  }
}
