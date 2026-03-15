import { defineEventHandler, getQuery } from 'h3'
import type { Trade } from '~/types'

export function calculateRiskOfRuin(winRate: number, riskPerTrade: number, edge: number): number {
  if (winRate === 0) return 1
  if (winRate === 1) return 0
  if (edge === 0) return 1
  
  // Formula: ((1 - W) / (1 + W)) ^ (Risk / Edge)
  const base = (1 - winRate) / (1 + winRate)
  const exponent = riskPerTrade / edge
  
  const risk = Math.pow(base, exponent)
  return isNaN(risk) ? 1 : Math.min(risk, 1) // Cap at 1 (100%)
}

export function generateEquityCurve(trades: Trade[], initialBalance: number): { date: string, equity: number }[] {
  const curve = [{ date: 'Initial', equity: initialBalance }]
  
  // Filter for closed trades and valid pnl
  const closedTrades = trades
    .filter(t => t.status === 'Closed' && t.pnl !== undefined && t.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())

  let currentEquity = initialBalance
  for (const trade of closedTrades) {
    currentEquity += Number(trade.pnl)
    curve.push({
      date: trade.date!,
      equity: currentEquity
    })
  }
  
  return curve
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const initialBalance = Number(query.initialBalance) || 0
  const riskPerTrade = Number(query.riskPerTrade) || 0.02 // Default to 2% if not provided

  // In Nuxt Nitro, we can fetch from other local endpoints
  const trades = await $fetch<Trade[]>('/api/trades')
  
  // Calculate winRate and edge
  const closedTrades = trades.filter(t => t.status === 'Closed' && t.pnl !== undefined)
  const winningTrades = closedTrades.filter(t => Number(t.pnl) > 0)
  const losingTrades = closedTrades.filter(t => Number(t.pnl) < 0)

  const winRate = closedTrades.length > 0 ? winningTrades.length / closedTrades.length : 0
  
  const totalWin = winningTrades.reduce((sum, t) => sum + Number(t.pnl), 0)
  const totalLoss = losingTrades.reduce((sum, t) => sum + Math.abs(Number(t.pnl)), 0)
  
  const avgWin = winningTrades.length > 0 ? totalWin / winningTrades.length : 0
  const avgLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0
  
  const lossRate = 1 - winRate
  const edge = (avgWin * winRate) - (avgLoss * lossRate)
  
  // Prevent negative or weird Risk of Ruin, cap at 1
  const riskOfRuin = calculateRiskOfRuin(winRate, riskPerTrade, edge)
  const equityCurve = generateEquityCurve(trades, initialBalance)
  
  return {
    riskOfRuin,
    equityCurve,
    metrics: {
      winRate,
      edge,
      riskPerTrade,
      avgWin,
      avgLoss
    }
  }
})
