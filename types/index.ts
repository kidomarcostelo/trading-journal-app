export type TradeStatus = 'Open' | 'Closed' | 'Cancelled' | 'Missed'
export type TradeMarket = 'Crypto' | 'Forex' | 'Indices' | 'Stocks' | 'Commodities'
export type TradeDirection = 'Long' | 'Short'

export interface ChipOption {
  label: string
  color?: string // Optional, as we might just have string values now
}

export interface ChipCategory {
  id: string // The header name (e.g., "Strategies")
  values: string[] // The column values
}

// Deprecating the old ChipConfig for now, or aliasing it
export type ChipConfig = ChipCategory

export interface TradeEntry {
  [key: string]: any // Allow dynamic keys based on headers
  id?: string
  createdAt?: string
}

export interface ChecklistRule {
  description: string
  weight: number
  isMandatory: boolean
}

export interface TierThreshold {
  label: string
  threshold: number
}

export type StrategyChecklistConfig = Record<string, {
  rules: ChecklistRule[]
  tiers: TierThreshold[]
}>

export interface Trade extends TradeEntry {
  id: string
  createdAt: string
  
  // Core Fields
  pair?: string
  status?: TradeStatus
  market?: TradeMarket
  direction?: TradeDirection
  date?: string
  
  // Checklist & Tier
  checklistScore?: number
  tier?: string
  
  // Metrics
  entryPrice?: number
  exitPrice?: number
  size?: number
  pnl?: number
  mae?: number
  mfe?: number
  
  // Behavioral & Execution
  rulesFollowed?: boolean
  mentalCategory?: 'A' | 'B' | 'C'
  emotions?: string[]
  
  // Timing
  entryTime?: string
  exitTime?: string
  session?: 'London' | 'New York' | 'Asia' | 'Overnight'
}

export interface AppConfig {
  spreadsheetId: string
  chips: ChipCategory[]
}
