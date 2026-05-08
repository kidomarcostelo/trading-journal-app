import type { Trade } from '~/types'

export const useAnalytics = () => {
  
  const parseNumber = (val: any): number => {
    if (typeof val === 'number') return val
    if (!val || String(val).trim() === '') return 0
    // Handle strings: remove currency, commas, and handle negative signs correctly
    const clean = String(val).replace(/[^0-9.-]/g, '')
    const num = parseFloat(clean)
    return isNaN(num) ? 0 : num
  }

  const getVal = (obj: any, key: string) => {
    if (!obj) return undefined
    const keys = Object.keys(obj)
    const lowerTarget = key.toLowerCase().trim()
    
    // 1. Exact or Case-Insensitive Match (Highest Priority)
    const foundKey = keys.find(k => k.toLowerCase().trim() === lowerTarget)
    if (foundKey) return obj[foundKey]
    
    // 2. Special handling for common aliases with PRIORITY
    // PnL Aliases
    if (lowerTarget === 'pnl' || lowerTarget === 'net pnl' || lowerTarget === 'profit') {
      const pnlKeys = ['Net PNL', 'Net Pnl', 'PNL', 'pnl', 'Profit', 'Profit/Loss', 'Gain/Loss', 'P/L']
      for (const pk of pnlKeys) {
        const match = keys.find(k => k.toLowerCase().trim() === pk.toLowerCase().trim())
        if (match) return obj[match]
      }
    }

    // Mental Category Aliases - Priority to "Mental Game Category"
    if (lowerTarget === 'mental category' || lowerTarget === 'mental' || lowerTarget === 'mental game category') {
      const mentalKeys = ['Mental Game Category', 'Mental Category', 'Mental', 'Psychology', 'Mindset']
      for (const mk of mentalKeys) {
        const match = keys.find(k => k.toLowerCase().trim() === mk.toLowerCase().trim())
        if (match) return obj[match]
      }
    }

    // Rules Followed Aliases
    if (lowerTarget === 'rules followed' || lowerTarget === 'execution') {
      const ruleKeys = ['Rules Followed', 'Rules', 'Execution', 'Followed Rules']
      for (const rk of ruleKeys) {
        const match = keys.find(k => k.toLowerCase().trim() === rk.toLowerCase().trim())
        if (match) return obj[match]
      }
    }

    // 3. Fallback for space-less versions
    const flatTarget = lowerTarget.replace(/\s/g, '')
    const foundFlatKey = keys.find(k => k.toLowerCase().replace(/\s/g, '') === flatTarget)
    return foundFlatKey ? obj[foundFlatKey] : undefined
  }

  const isClosed = (t: Trade): boolean => {
    const status = String(getVal(t, 'status') || '').toLowerCase().trim()
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
      mentalDistribution: { 'Untagged': 0 } as Record<string, number>,
      emotionFrequency: {} as Record<string, number>,
      tacticalCategoryDistribution: { 'Untagged': 0 } as Record<string, number>,
      tacticalSkillFrequency: {} as Record<string, number>
    }

    const rulesFollowedCount = closedTrades.filter(t => {
      const val = getVal(t, 'rules followed')
      return val === true || String(val).toLowerCase().trim() === 'true' || val === 1 || val === '1'
    }).length
    const executionRate = (rulesFollowedCount / closedTrades.length) * 100

    const mentalDistribution: Record<string, number> = {}
    const emotionFrequency: Record<string, number> = {}
    const tacticalCategoryDistribution: Record<string, number> = {}
    const tacticalSkillFrequency: Record<string, number> = {}

    closedTrades.forEach(t => {
      // Dynamic Mental Category based on ACTUAL values in "Mental Game Category"
      // We manually find the key to avoid getVal's alias fallback picking up older columns (like "Mental Category")
      const mentalKey = Object.keys(t).find(k => k.toLowerCase().trim() === 'mental game category')
      const catVal = mentalKey ? t[mentalKey] : undefined
      const cat = catVal ? String(catVal).trim() : ''
      
      // If the value is empty or just whitespace, tag as "Untagged"
      const label = cat === '' ? 'Untagged' : cat
      mentalDistribution[label] = (mentalDistribution[label] || 0) + 1

      // Emotions - strictly from 'Mental Game' case-sensitive, fallback to 'emotions'
      const emotionsVal = t['Mental Game'] || getVal(t, 'emotions')
      if (emotionsVal) {
        const list = Array.isArray(emotionsVal) ? emotionsVal : String(emotionsVal).split(',').map(s => s.trim())
        list.forEach(e => {
          if (e) emotionFrequency[e] = (emotionFrequency[e] || 0) + 1
        })
      }

      // Tactical Skill Category - strictly case-sensitive
      const tacticalCatVal = t['Tactical Skill Category']
      const tacticalCat = tacticalCatVal ? String(tacticalCatVal).trim() : ''
      const tacticalLabel = tacticalCat === '' ? 'Untagged' : tacticalCat
      tacticalCategoryDistribution[tacticalLabel] = (tacticalCategoryDistribution[tacticalLabel] || 0) + 1

      // Tactical Skill - strictly case-sensitive, treat as single string
      const tacticalSkillVal = t['Tactical Skill']
      if (tacticalSkillVal) {
        const skill = String(tacticalSkillVal).trim()
        if (skill) {
          tacticalSkillFrequency[skill] = (tacticalSkillFrequency[skill] || 0) + 1
        }
      }
    })

    return {
      executionRate: Number(executionRate.toFixed(1)),
      mentalDistribution,
      emotionFrequency,
      tacticalCategoryDistribution,
      tacticalSkillFrequency
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

  const getPairStats = (trades: Trade[], pair: string, timeframe: 'All Time' | { start?: Date | null, end?: Date | null } = 'All Time') => {
    const timeFiltered = filterTradesByTimeframe(trades, timeframe)
    const pairTrades = timeFiltered.filter(t => (t.pair === pair || t.Pair === pair))
    const closedTrades = pairTrades.filter(isClosed)
    
    if (closedTrades.length === 0) return { winRate: 0, pnl: 0, count: 0 }

    let wins = 0
    let totalPnl = 0

    closedTrades.forEach(t => {
      const pnl = parseNumber(getVal(t, 'pnl'))
      totalPnl += pnl
      if (pnl > 0) wins++
    })

    return {
      winRate: Number(((wins / closedTrades.length) * 100).toFixed(2)),
      pnl: Number(totalPnl.toFixed(2)),
      count: closedTrades.length
    }
  }

  const getTopProfitablePairs = (trades: Trade[], timeframe: 'All Time' | { start?: Date | null, end?: Date | null } = 'All Time', limit = 10) => {
    const timeFiltered = filterTradesByTimeframe(trades, timeframe)
    const closedTrades = timeFiltered.filter(isClosed)
    
    if (closedTrades.length === 0) return []

    const pairData: Record<string, { pnl: number, count: number }> = {}

    closedTrades.forEach(t => {
      const pairStr = String(getVal(t, 'pair') || 'Unknown')
      const pnl = parseNumber(getVal(t, 'pnl'))
      if (!pairData[pairStr]) {
        pairData[pairStr] = { pnl: 0, count: 0 }
      }
      pairData[pairStr].pnl += pnl
      pairData[pairStr].count++
    })

    const sortedPairs = Object.entries(pairData)
      .map(([pair, data]) => ({ 
        pair, 
        pnl: Number(data.pnl.toFixed(2)),
        count: data.count
      }))
      .sort((a, b) => b.pnl - a.pnl)

    return sortedPairs.slice(0, limit)
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
    filterTradesByTimeframe,
    getPairStats,
    getTopProfitablePairs,
    getVal,
    parseNumber,
    isClosed
  }
}
