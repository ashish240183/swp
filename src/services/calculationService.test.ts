import { describe, it, expect } from 'vitest';
import { runSimulation } from './calculationService';

describe('runSimulation', () => {
  const baseInputs = {
    currentAge: 30,
    retirementAge: 60,
    endAge: 85,
    sipPaymentEndAge: 60,
    yearlyIncomeIncrease: 5,
    addedCorpusNow: 1000000,
    addedCorpusRetirement: 5000000,
    sipIncreaseRate: 5,
    sipFreezeAge: 50,
    expectedReturn: 10,
    calculationMode: 'calculateEndCorpus',
    startingSipAmount: 50000,
    startingMonthlyIncome: 100000,
    targetEndCorpus: 0,
  };

  it('should calculate the final corpus correctly with no SIP and no withdrawal', () => {
    const inputs = {
      ...baseInputs,
      startingSipAmount: 0,
      startingMonthlyIncome: 0,
      retirementAge: 86, // No retirement
      addedCorpusRetirement: 0,
    };
    const { summary } = runSimulation(inputs, 0, 0);
    // 10L at 10% for 55 years should be ~26.4 Cr
    expect(summary.finalCorpus).toBeGreaterThan(260000000);
    expect(summary.finalCorpus).toBeLessThan(270000000);
  });

  it('should handle retirement and withdrawals correctly', () => {
    const inputs = { ...baseInputs, sipPaymentEndAge: 60, endAge: 61 };
    const { yearlyData, summary } = runSimulation(inputs, 50000, 100000);
    
    const retirementYear = yearlyData.find(y => y.age === 60);
    expect(retirementYear?.isRetired).toBe(true);
    expect(retirementYear?.monthlyIncome).toBe(100000);
    expect(retirementYear?.totalWithdrawalForYear).toBe(1200000);

    const postRetirementYear = yearlyData.find(y => y.age === 61);
    expect(postRetirementYear?.monthlyIncome).toBe(105000); // 5% increase

    expect(summary.totalWithdrawn).toBeGreaterThan(0);
  });

  it('should handle SIP correctly, including increase and freeze', () => {
    const inputs = { ...baseInputs, endAge: 52 };
    const { yearlyData, summary } = runSimulation(inputs, 50000, 0);

    const firstYear = yearlyData.find(y => y.age === 30);
    expect(firstYear?.sipAmount).toBe(50000);
    expect(firstYear?.totalSipForYear).toBe(600000);

    const secondYear = yearlyData.find(y => y.age === 31);
    expect(secondYear?.sipAmount).toBe(52500); // 5% increase
    
    const frozenYear = yearlyData.find(y => y.age === 50);
    expect(frozenYear?.isSipFrozen).toBe(true);
    
    const nextYear = yearlyData.find(y => y.age === 51);
    expect(nextYear?.sipAmount).toBe(frozenYear?.sipAmount);

    expect(summary.totalSipInvested).toBeGreaterThan(0);
  });
  
  it('should stop simulation if corpus becomes negative during retirement', () => {
    const inputs = { 
        ...baseInputs, 
        addedCorpusNow: 10000,
        addedCorpusRetirement: 0,
        startingSipAmount: 0,
        retirementAge: 31,
        endAge: 40,
        startingMonthlyIncome: 20000 
    };
    const { yearlyData } = runSimulation(inputs, 0, 20000);
    expect(yearlyData[yearlyData.length - 1].yearEndCorpus).toBeLessThanOrEqual(0);
    expect(yearlyData.length).toBeLessThan(10); // Should not run for all 10 years
  });

  it('should return only final corpus when requested', () => {
    const result = runSimulation(baseInputs, 50000, 100000, true);
    expect(result.finalCorpus).toBeDefined();
    expect(result.yearlyData).toBeUndefined();
    expect(result.summary).toBeUndefined();
  });

  it('should return a valid summary even with no results', () => {
    const inputs = { ...baseInputs, endAge: 29 }; // No years to simulate
    const { summary, yearlyData } = runSimulation(inputs, 50000, 100000);
    expect(yearlyData.length).toBe(0);
    expect(summary.totalSipInvested).toBe(0);
    expect(summary.totalWithdrawn).toBe(0);
    expect(summary.finalCorpus).toBe(inputs.addedCorpusNow);
  });
}); 