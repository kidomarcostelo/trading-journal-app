import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ref } from 'vue'
import { useTrades } from '../../composables/useTrades'
import type { Trade } from '../../types'

describe('useTrades Composable', () => {
  // Mock System Time to Sunday, Jan 11 2026
  beforeEach(() => {
    vi.useFakeTimers()
    const date = new Date('2026-01-11T12:00:00Z')
    vi.setSystemTime(date)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const mockTrades = ref<Trade[]>([
    { ID: '1', Pair: 'BTC/USD', Action: 'Long', Market: 'Crypto', Status: 'Open', Date: '2026-01-11' }, // Sunday (Today) - This Week
    { ID: '2', Pair: 'ETH/USD', Action: 'Short', Market: 'Crypto', Status: 'Closed', Date: '2026-01-10' }, // Saturday (Last Week)
    { ID: '3', Pair: 'AAPL', Action: 'Long', Market: 'Stocks', Status: 'Cancelled', Date: '2025-12-25' }, // Last Month (Dec 2025)
    { ID: '4', Pair: 'SOL/USD', Action: 'Long', Market: 'Crypto', Status: 'Missed', Date: '2026-01-12' }, // Monday (Tomorrow/This Week)
    { ID: '5', Pair: 'EUR/USD', Action: 'Short', Market: 'Forex', Status: 'Open', Date: '2026-01-01' }, // First of Month (This Month, Last Week)
    // Excel Serial Date Case
    // 46033 = Jan 11 2026 approx
    { ID: '6', Pair: 'XRP/USD', Action: 'Long', Market: 'Crypto', Status: 'Open', Date: '46033' },
    // A trade from last month (Dec 2025) explicitly
    { ID: '7', Pair: 'TSLA', Action: 'Short', Market: 'Stocks', Status: 'Closed', Date: '2025-12-01' }
  ])

  it('initializes with default values', () => {
    const { filterPeriod, sortBy, filteredTrades } = useTrades(mockTrades)
    expect(filterPeriod.value).toBe('all')
    expect(sortBy.value).toBe('Date')
    expect(filteredTrades.value.length).toBe(7)
  })

  it('filters by Week (Current Week starts Sunday Jan 11)', () => {
    const { filterPeriod, filteredTrades } = useTrades(mockTrades)
    filterPeriod.value = 'week'
    
    // This week: Jan 11 onwards
    const ids = filteredTrades.value.map(t => t.ID)
    expect(ids).toContain('1')
    expect(ids).toContain('4')
    expect(ids).toContain('6') // Excel date Jan 11
    
    expect(ids).not.toContain('2') // Jan 10 (Last week)
    expect(ids).not.toContain('5') // Jan 1 (Last week)
  })

  it('filters by Last Week (Jan 4 - Jan 10)', () => {
    const { filterPeriod, filteredTrades } = useTrades(mockTrades)
    filterPeriod.value = 'last-week'

    const ids = filteredTrades.value.map(t => t.ID)
    expect(ids).toContain('2') // Jan 10
    // Jan 1 is NOT last week (Jan 1 is Thursday before last week, wait)
    // Jan 11 is Sunday.
    // This Week: Jan 11 - Jan 17
    // Last Week: Jan 4 - Jan 10
    // Jan 1 is PREVIOUS to last week.
    
    expect(ids).not.toContain('1')
    expect(ids).not.toContain('5') // Jan 1 is outside last week (Jan 4-10)
  })

  it('filters by Month (Jan 2026)', () => {
    const { filterPeriod, filteredTrades } = useTrades(mockTrades)
    filterPeriod.value = 'month'
    
    const ids = filteredTrades.value.map(t => t.ID)
    expect(ids).toContain('1')
    expect(ids).toContain('2')
    expect(ids).toContain('4')
    expect(ids).toContain('5')
    expect(ids).toContain('6')
    expect(ids).not.toContain('3') // Dec 2025
    expect(ids).not.toContain('7') // Dec 2025
  })

  it('filters by Last Month (Dec 2025)', () => {
    const { filterPeriod, filteredTrades } = useTrades(mockTrades)
    filterPeriod.value = 'last-month'
    
    const ids = filteredTrades.value.map(t => t.ID)
    expect(ids).toContain('3')
    expect(ids).toContain('7')
    expect(ids).not.toContain('1') // Jan
  })

  it('sorts by Status', () => {
    const { sortBy, sortDir, filteredTrades } = useTrades(mockTrades)
    sortBy.value = 'Status'
    sortDir.value = 'asc' // Open (0), Closed (1)
    
    // Order: Open, Closed, Cancelled, Missed
    // Open: 1, 5, 6
    let statuses = filteredTrades.value.map(t => t.Status)
    expect(statuses[0]).toBe('Open')
    expect(statuses[3]).toBe('Closed')

    // Test Descending
    sortDir.value = 'desc'
    statuses = filteredTrades.value.map(t => t.Status)
    // Cancelled (2) or Missed (3) should be first (depending on data presence)
    // 3 is Cancelled, 4 is Missed.
    // Order Values: Open 0, Closed 1, Cancelled 2, Missed 3
    // Descending: Missed (3), Cancelled (2), Closed (1), Open (0)
    expect(statuses[0]).toBe('Missed')
  })

  it('sorts by Date', () => {
    const { sortBy, sortDir, filteredTrades } = useTrades(mockTrades)
    sortBy.value = 'Date'
    
    // Test Descending (Default)
    sortDir.value = 'desc'
    let ids = filteredTrades.value.map(t => t.ID)
    // 4 (Jan 12) > 1/6 (Jan 11) > 2 (Jan 10) > 5 (Jan 1) > 3/7 (Dec)
    expect(ids[0]).toBe('4')

    // Test Ascending
    sortDir.value = 'asc'
    ids = filteredTrades.value.map(t => t.ID)
    // Oldest first: 3/7 (Dec 2025)
    expect(['3', '7']).toContain(ids[0])
    expect(['3', '7']).toContain(ids[1])
    expect(ids[2]).toBe('5') // Jan 1
  })
})
