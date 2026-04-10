import type { Trade } from '~/types'

export const useAnalytics = () => {
  
  const parseNumber = (val: any): number => {
    if (typeof val === 'number') return val
    if (!val) return 0
    // Remove currency symbols, commas, and spaces, keep - and .
    const clean = String(val).replace(/[^0-9.-]/g, '')
    const num = parseFloat(clean)
    return isNaN(num) ? 0 : num
  }

  const getVal = (obj: any, key: string) => {
    if (!obj) return undefined
    const keys = Object.keys(obj)
    const foundKey = keys.find(k => k.toLowerCase() === key.toLowerCase())
    if (foundKey) return obj[foundKey]
    
    // Fallback for space-less versions like "exitdate" for "Exit Date"
    const flatKey = key.toLowerCase().replace(/\s/g, '')
    const foundFlatKey = keys.find(k => k.toLowerCase().replace(/\s/g, '') === flatKey)
    return foundFlatKey ? obj[foundFlatKey] : undefined
  }

  const isClosed = (t: Trade): boolean => {
    const status = String(getVal(t, 'status') || '').toLowerCase()
    return status === 'closed'
  }

  const calculateProfitFactor = (trades: Trade[]): number => {
    const closedTrades = trades.filter(isClosed)
    let grossProfit = 0
    let grossLoss = 0

    closedTrades.forEach(t => {
      const pnl = parseNumber(getVal(t, 'pnl'))
      if (pnl > 0) grossProfit += pnl
      else grossLoss += Math.abs(pnl)
    })

    if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0
    return Number((grossProfit / grossLoss).toFixed(2))
  }

  const calculateWinRate = (trades: Trade[]): number => {
    const closedTrades = trades.filter(isClosed)
    if (closedTrades.length === 0) return 0
    
    const wins = closedTrades.filter(t => parseNumber(getVal(t, 'pnl')) > 0).length
    return Number(((wins / closedTrades.length) * 100).toFixed(2))
  }

  const calculateExpectancy = (trades: Trade[]): number => {
    const closedTrades = trades.filter(isClosed)
    if (closedTrades.length === 0) return 0

    const wins = closedTrades.filter(t => parseNumber(getVal(t, 'pnl')) > 0)
    const losses = closedTrades.filter(t => parseNumber(getVal(t, 'pnl')) <= 0)

    const avgWin = wins.length > 0 
      ? wins.reduce((sum, t) => sum + parseNumber(getVal(t, 'pnl')), 0) / wins.length 
      : 0
    
    const avgLoss = losses.length > 0 
      ? Math.abs(losses.reduce((sum, t) => sum + parseNumber(getVal(t, 'pnl')), 0)) / losses.length 
      : 0

    const winRate = wins.length / closedTrades.length
    const lossRate = losses.length / closedTrades.length

    return Number(((avgWin * winRate) - (avgLoss * lossRate)).toFixed(2))
  }

  const calculateAverageRMultiple = (trades: Trade[]): number => {
    const closedTrades = trades.filter(isClosed)
    if (closedTrades.length === 0) return 0

    let totalR = 0
    let count = 0

    closedTrades.forEach(t => {
      const pnl = parseNumber(getVal(t, 'pnl'))
      const risk = parseNumber(getVal(t, 'risk'))
      
      if (risk > 0) {
        totalR += pnl / risk
        count++
      }
    })

    if (count === 0) return 0
    return Number((totalR / count).toFixed(2))
  }

  const calculateAverageHoldingTime = (trades: Trade[]): { wins: number, losses: number } => {
    const closedTrades = trades.filter(isClosed)
    const wins = closedTrades.filter(t => parseNumber(getVal(t, 'pnl')) > 0)
    const losses = closedTrades.filter(t => parseNumber(getVal(t, 'pnl')) <= 0)

    const getDurationMs = (t: Trade) => {
      const startVal = getVal(t, 'createdAt') || getVal(t, 'date') || getVal(t, 'date created')
      const endVal = getVal(t, 'exit date') || getVal(t, 'exitdate')
      
      if (!startVal || !endVal) return 0
      
      const start = new Date(startVal).getTime()
      const end = new Date(endVal).getTime()
      
      if (isNaN(start) || isNaN(end)) return 0
      return Math.abs(end - start)
    }

    const avgWinTime = wins.length > 0
      ? wins.reduce((sum, t) => sum + getDurationMs(t), 0) / wins.length
      : 0

    const avgLossTime = losses.length > 0
      ? losses.reduce((sum, t) => sum + getDurationMs(t), 0) / losses.length
      : 0

    return {
      wins: Math.round(avgWinTime),
      losses: Math.round(avgLossTime)
    }
  }

  const calculateMaxConsecutiveLosses = (trades: Trade[]): number => {
    const closedTrades = trades
      .filter(isClosed)
      .sort((a, b) => {
        const dateA = new Date(getVal(a, 'date') || getVal(a, 'createdAt')).getTime()
        const dateB = new Date(getVal(b, 'date') || getVal(b, 'createdAt')).getTime()
        return dateA - dateB
      })

    let maxStreak = 0
    let currentStreak = 0

    closedTrades.forEach(t => {
      const pnl = parseNumber(getVal(t, 'pnl'))
      if (pnl <= 0) {
        currentStreak++
        if (currentStreak > maxStreak) maxStreak = currentStreak
      } else {
        currentStreak = 0
      }
    })

    return maxStreak
  }

  const calculateMaxDrawdown = (equityCurve: { equity: number }[]): number => {
    if (equityCurve.length === 0) return 0

    let maxEquity = -Infinity
    let maxDD = 0

    equityCurve.forEach(point => {
      if (point.equity > maxEquity) {
        maxEquity = point.equity
      }
      
      if (maxEquity > 0) {
        const dd = (maxEquity - point.equity) / maxEquity
        if (dd > maxDD) maxDD = dd
      }
    })

    return Number((maxDD * 100).toFixed(2))
  }

  const calculateBehavioralStats = (trades: Trade[]) => {
    const closedTrades = trades.filter(isClosed)
    if (closedTrades.length === 0) return {
      executionRate: 0,
      mentalDistribution: { A: 0, B: 0, C: 0 },
      emotionFrequency: {} as Record<string, number>
    }

    const rulesFollowedCount = closedTrades.filter(t => t['Rules Followed'] === true || t.rulesFollowed === true).length
    const executionRate = (rulesFollowedCount / closedTrades.length) * 100

    const mentalDistribution = { A: 0, B: 0, C: 0 }
    const emotionFrequency: Record<string, number> = {}

    closedTrades.forEach(t => {
      // Mental
      const cat = (t['Mental Category'] || t.mentalCategory || 'B') as 'A' | 'B' | 'C'
      if (mentalDistribution[cat] !== undefined) mentalDistribution[cat]++

      // Emotions
      const emotionsVal = t.Emotions || t.emotions
      if (emotionsVal) {
        const list = Array.isArray(emotionsVal) ? emotionsVal : String(emotionsVal).split(',').map(s => s.trim())
        list.forEach(e => {
          if (e) emotionFrequency[e] = (emotionFrequency[e] || 0) + 1
        })
      }
    })

    return {
      executionRate: Number(executionRate.toFixed(1)),
      mentalDistribution,
      emotionFrequency
    }
  }

  const fetchRiskData = async (initialBalance: number = 0, riskPerTrade: number = 0.02) => {
    try {
      return await $fetch('/api/analytics/risk', {
        query: { initialBalance, riskPerTrade }
      })
    } catch (error: any) {
      throw error
    }
  }

  const filterTradesByTimeframe = (trades: Trade[], timeframe: 'All Time' | { start?: Date | null, end?: Date | null }) => {
    if (timeframe === 'All Time') return trades

    return trades.filter(t => {
      const dateVal = getVal(t, 'date') || getVal(t, 'createdAt') || getVal(t, 'date created')
      if (!dateVal) return false

      const tradeDate = new Date(dateVal).getTime()
      if (isNaN(tradeDate)) return false

      const start = timeframe.start ? new Date(timeframe.start).getTime() : -Infinity
      const end = timeframe.end ? new Date(timeframe.end).setHours(23, 59, 59, 999) : Infinity

      return tradeDate >= start && tradeDate <= end
    })
  }

  return {
    calculateProfitFactor,
    calculateWinRate,
    calculateExpectancy,
    calculateAverageRMultiple,
    calculateAverageHoldingTime,
    calculateMaxConsecutiveLosses,
    calculateMaxDrawdown,
    calculateBehavioralStats,
    fetchRiskData,
    filterTradesByTimeframe
  }
}
