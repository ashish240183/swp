import { YearlyData } from '../types';

export const runSimulation = (
  inputs: any, 
  sipAmount: number, 
  monthlyIncome: number, 
  returnFinalCorpusOnly = false
) => {
  try {
    const {
      currentAge,
      retirementAge,
      endAge,
      sipPaymentEndAge,
      yearlyIncomeIncrease,
      addedCorpusNow,
      addedCorpusRetirement,
      sipIncreaseRate,
      sipFreezeAge,
      expectedReturn
    } = inputs;

    const monthlyReturn = expectedReturn / 100 / 12;
    let corpus = addedCorpusNow;
    let currentSip = sipAmount;
    let currentIncome = 0;
    const yearlyData: YearlyData[] = [];

    for (let age = currentAge; age <= endAge; age++) {
      const isRetired = age >= retirementAge;
      const isSipActive = age <= sipPaymentEndAge;
      
      let yearStartCorpus = corpus;
      let totalSipForYear = 0;
      let totalWithdrawalForYear = 0;

      // Add retirement corpus at retirement age
      if (age === retirementAge) {
        corpus += addedCorpusRetirement;
        yearStartCorpus = corpus; // Update year start corpus to include the addition
      }

      // Calculate current income for the year if retired
      if (isRetired) {
        currentIncome = monthlyIncome * Math.pow(1 + yearlyIncomeIncrease / 100, age - retirementAge);
      }

      // Process each month
      for (let month = 1; month <= 12; month++) {
        // First: Add SIP contribution
        if (isSipActive) {
          corpus += currentSip;
          totalSipForYear += currentSip;
        }

        // Second: Subtract withdrawal
        if (isRetired) {
          corpus -= currentIncome;
          totalWithdrawalForYear += currentIncome;
        }

        // Third: Apply monthly returns on the net corpus
        corpus = corpus * (1 + monthlyReturn);
      }

      // Store SIP amount before increasing it
      const displaySipAmount = currentSip;

      // Increase SIP for next year if not frozen
      if (age < sipFreezeAge && isSipActive) {
        currentSip = currentSip * (1 + sipIncreaseRate / 100);
      }

      yearlyData.push({
        age,
        yearStartCorpus: Math.round(yearStartCorpus),
        sipAmount: isSipActive ? Math.round(displaySipAmount) : 0,
        totalSipForYear: Math.round(totalSipForYear),
        monthlyIncome: isRetired ? Math.round(currentIncome) : 0,
        totalWithdrawalForYear: Math.round(totalWithdrawalForYear),
        yearEndCorpus: Math.round(corpus),
        netCashFlow: Math.round((totalSipForYear - totalWithdrawalForYear) / 12),
        isRetired,
        isSipActive,
        isSipFrozen: age >= sipFreezeAge && isSipActive
      });

      // Stop if corpus goes negative during retirement
      if (corpus <= 0 && isRetired) break;
    }

    if (returnFinalCorpusOnly) {
      return { finalCorpus: corpus };
    }
    
    const summary = {
        totalSipInvested: yearlyData.reduce((sum, year) => sum + year.totalSipForYear, 0),
        totalWithdrawn: yearlyData.reduce((sum, year) => sum + year.totalWithdrawalForYear, 0),
        finalCorpus: yearlyData.length > 0 ? yearlyData[yearlyData.length - 1]?.yearEndCorpus || 0 : corpus,
      };

    return { yearlyData, summary };
  } catch (error) {
    console.error('Error in runSimulation:', error);
    throw new Error('Error in runSimulation');
  }
}; 