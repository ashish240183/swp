import { useState, useEffect } from 'react';
import { YearlyData, SummaryData } from '../types';
import { runSimulation } from '../services/calculationService';

interface Inputs {
  currentAge: number;
  retirementAge: number;
  endAge: number;
  sipPaymentEndAge: number;
  yearlyIncomeIncrease: number;
  addedCorpusNow: number;
  addedCorpusRetirement: number;
  sipIncreaseRate: number;
  sipFreezeAge: number;
  expectedReturn: number;
  calculationMode: string;
  startingSipAmount: number;
  startingMonthlyIncome: number;
  targetEndCorpus: number;
}

export const useSWPCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>({
    currentAge: 25,
    retirementAge: 50,
    endAge: 85,
    sipPaymentEndAge: 85,
    yearlyIncomeIncrease: 5,
    addedCorpusNow: 0,
    addedCorpusRetirement: 100000000,
    sipIncreaseRate: 5,
    sipFreezeAge: 65,
    expectedReturn: 10,
    calculationMode: 'calculateSIP',
    startingSipAmount: 0,
    startingMonthlyIncome: 800000,
    targetEndCorpus: 0,
  });

  const [results, setResults] = useState<YearlyData[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalSipInvested: 0,
    totalWithdrawn: 0,
    finalCorpus: 0
  });

  const handleInputChange = (field: string, value: string | number) => {
    try {
      const cleanValue = typeof value === 'string' ? value.replace(/,/g, '') : value.toString();
      let numericValue = parseFloat(cleanValue) || 0;
      
      if (cleanValue && cleanValue.length > 0 && !isNaN(numericValue)) {
        if (cleanValue.includes('.')) {
          numericValue = parseFloat(cleanValue);
        } else {
          numericValue = parseInt(cleanValue, 10) || 0;
        }
      }
      
      setInputs((prev: Inputs) => ({ ...prev, [field]: numericValue }));
    } catch (error) {
      console.error('Error in handleInputChange:', error);
    }
  };

  const calculateSWP = () => {
    try {
      const { calculationMode, targetEndCorpus, startingSipAmount, startingMonthlyIncome } = inputs;
      
      if (calculationMode === 'calculateSIP') {
        let low = 1000;
        let high = 5000000;
        let bestSip = 0;
        let iterations = 0;
        const maxIterations = 50;
        
        while (iterations < maxIterations && high - low > 100) {
          const mid = Math.floor((low + high) / 2);
          const { finalCorpus } = runSimulation(inputs, mid, startingMonthlyIncome, true);
          
          if(!finalCorpus) {
            continue;
          }

          const difference = Math.abs(finalCorpus - targetEndCorpus);
          
          if (difference < 100000) {
            bestSip = mid;
            break;
          }
          
          if (finalCorpus > targetEndCorpus) {
            high = mid;
          } else {
            low = mid;
          }
          bestSip = mid;
          iterations++;
        }
        
        setInputs((prev: Inputs) => ({ ...prev, startingSipAmount: Math.round(bestSip) }));
        const { yearlyData, summary } = runSimulation(inputs, bestSip, startingMonthlyIncome);
        setResults(yearlyData);
        setSummary(summary);
        
      } else if (calculationMode === 'calculateIncome') {
        let low = 10000;
        let high = 5000000;
        let bestIncome = 0;
        let iterations = 0;
        const maxIterations = 50;
        
        while (iterations < maxIterations && high - low > 1000) {
          const mid = Math.floor((low + high) / 2);
          const { finalCorpus } = runSimulation(inputs, startingSipAmount, mid, true);

          if(!finalCorpus) {
            continue;
          }

          const difference = Math.abs(finalCorpus - targetEndCorpus);
          
          if (difference < 100000) {
            bestIncome = mid;
            break;
          }
          
          if (finalCorpus > targetEndCorpus) {
            low = mid;
          } else {
            high = mid;
          }
          bestIncome = mid;
          iterations++;
        }
        
        setInputs((prev: Inputs) => ({ ...prev, startingMonthlyIncome: Math.round(bestIncome) }));
        const { yearlyData, summary } = runSimulation(inputs, startingSipAmount, bestIncome);
        setResults(yearlyData);
        setSummary(summary);
        
      } else if (calculationMode === 'calculateEndCorpus') {
        const { yearlyData, summary } = runSimulation(inputs, startingSipAmount, startingMonthlyIncome);
        setResults(yearlyData);
        setSummary(summary);
      }
    } catch (error) {
      console.error('Error in calculateSWP:', error);
    }
  };

  useEffect(() => {
    calculateSWP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    inputs,
    results,
    summary,
    handleInputChange,
    calculateSWP,
    setInputs
  };
}; 