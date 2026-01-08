export interface ChipConfig {
  [category: string]: string[];
}

export interface TradeEntry {
  date: string;
  pair: string;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  imagesBefore: string[];
  imagesAfter: string[];
  tags: Record<string, string | string[]>;
  notes?: string;
}

export interface Trade extends TradeEntry {
  id: string;
  rowIndex: number;
}
