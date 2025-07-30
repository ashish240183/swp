export interface YearlyData {
  age: number;
  yearStartCorpus: number;
  sipAmount: number;
  totalSipForYear: number;
  monthlyIncome: number;
  totalWithdrawalForYear: number;
  yearEndCorpus: number;
  netCashFlow: number;
  isRetired: boolean;
  isSipActive: boolean;
  isSipFrozen: boolean;
}

export interface SummaryData {
  totalSipInvested: number;
  totalWithdrawn: number;
  finalCorpus: number;
} 