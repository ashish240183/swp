import React, { useEffect } from 'react';
import { useSWPCalculator } from '../hooks/useSWPCalculator';
import { formatCurrency, convertToWords, formatNumberWithCommas } from '../utils/formatters';

const SWPCalculator = () => {
  const {
    inputs,
    results,
    summary,
    handleInputChange,
    calculateSWP,
    setInputs
  } = useSWPCalculator();

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Chrome, Safari, Edge, Opera */
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      
      /* Firefox */
      input[type=number] {
        -moz-appearance: textfield;
        appearance: textfield;
      }
      
      /* Prevent touch events from changing number values */
      input[type=number] {
        touch-action: manipulation;
      }
      
      /* Disable wheel events on number inputs */
      input[type=number]::-webkit-inner-spin-button,
      input[type=number]::-webkit-outer-spin-button {
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
    
    // Prevent wheel events on number inputs
    const preventWheel = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (target.type === 'number') {
        target.blur();
        e.preventDefault();
      }
    };
    
    document.addEventListener('wheel', preventWheel, { passive: false });
    
    return () => {
      document.head.removeChild(style);
      document.removeEventListener('wheel', preventWheel);
    };
  }, []);

  const formatInputValue = (value: number) => {
    return formatNumberWithCommas(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">SWP Calculator</h1>
          <p className="text-indigo-100">A comprehensive tool to plan your systematic withdrawal strategy.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Parameters</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Current Age</label>
                      <input
                        type="number"
                        value={inputs.currentAge}
                        onChange={(e) => handleInputChange('currentAge', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter your age as of today.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Planned Retirement Age</label>
                      <input
                        type="number"
                        value={inputs.retirementAge}
                        onChange={(e) => handleInputChange('retirementAge', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">The age you plan to stop working.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Life Expectancy (SWP End Age)</label>
                      <input
                        type="number"
                        value={inputs.endAge}
                        onChange={(e) => handleInputChange('endAge', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">The age until which you want to receive withdrawals.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Annual Return (%)</label>
                      <input
                        type="number"
                        value={inputs.expectedReturn}
                        onChange={(e) => handleInputChange('expectedReturn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Your portfolio's estimated annual growth rate.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income Increase (%)</label>
                    <input
                      type="number"
                      value={inputs.yearlyIncomeIncrease}
                      onChange={(e) => handleInputChange('yearlyIncomeIncrease', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Yearly % increase in withdrawal to counter inflation.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Corpus & SIP Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Investment Value (₹)</label>
                    <input
                      type="text"
                      value={formatInputValue(inputs.addedCorpusNow)}
                      onChange={(e) => handleInputChange('addedCorpusNow', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="5,00,00,000"
                    />
                    <p className="text-xs text-gray-500 mt-1">The total value of your current investments. {convertToWords(inputs.addedCorpusNow)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lumpsum at Retirement (₹)</label>
                    <input
                      type="text"
                      value={formatInputValue(inputs.addedCorpusRetirement)}
                      onChange={(e) => handleInputChange('addedCorpusRetirement', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="5,00,00,000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Any extra funds you'll add at retirement (e.g., PF). {convertToWords(inputs.addedCorpusRetirement)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Annual SIP Increase (%)</label>
                      <input
                        type="number"
                        value={inputs.sipIncreaseRate}
                        onChange={(e) => handleInputChange('sipIncreaseRate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">The yearly percentage increase in your SIP amount.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SIP End Age</label>
                      <input
                        type="number"
                        value={inputs.sipPaymentEndAge}
                        onChange={(e) => handleInputChange('sipPaymentEndAge', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">The age you will stop making SIP contributions.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SIP Increase Freeze Age</label>
                    <input
                      type="number"
                      value={inputs.sipFreezeAge}
                      onChange={(e) => handleInputChange('sipFreezeAge', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">The age your SIP amount stops increasing annually.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Calculation Mode</h2>
            <div className="space-y-4">
              <div 
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${inputs.calculationMode === 'calculateSIP' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}
                onClick={() => setInputs(prev => ({ ...prev, calculationMode: 'calculateSIP' }))}
              >
                <h3 className="font-semibold text-blue-800">Calculate Required SIP</h3>
                <p className="text-sm text-gray-600">Find the SIP needed for your goals.</p>
              </div>
              <div 
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${inputs.calculationMode === 'calculateIncome' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}
                onClick={() => setInputs(prev => ({ ...prev, calculationMode: 'calculateIncome' }))}
              >
                <h3 className="font-semibold text-blue-800">Calculate Max Income</h3>
                <p className="text-sm text-gray-600">Find the max income you can get.</p>
              </div>
              <div 
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${inputs.calculationMode === 'calculateEndCorpus' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}
                onClick={() => setInputs(prev => ({ ...prev, calculationMode: 'calculateEndCorpus' }))}
              >
                <h3 className="font-semibold text-blue-800">Calculate Final Corpus</h3>
                <p className="text-sm text-gray-600">See the final corpus value.</p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={calculateSWP}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-3 rounded-md hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 font-medium text-lg"
              >
                Calculate SWP
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          {inputs.calculationMode === 'calculateSIP' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Mode 1: Calculate Required SIP Amount</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Desired Monthly Income</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.startingMonthlyIncome)}
                      onChange={(e) => handleInputChange('startingMonthlyIncome', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5,00,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{convertToWords(inputs.startingMonthlyIncome)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Target Corpus at End Age</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.targetEndCorpus)}
                      onChange={(e) => handleInputChange('targetEndCorpus', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{inputs.targetEndCorpus === 0 ? 'Zero balance at end' : `Leave ${convertToWords(inputs.targetEndCorpus)}`}</p>
                </div>
                <div className="p-4 bg-green-100 rounded-lg text-center">
                  <label className="block text-sm font-medium text-green-800 mb-2">Required SIP</label>
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(inputs.startingSipAmount)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{convertToWords(inputs.startingSipAmount)}</p>
                </div>
              </div>
            </div>
          )}

          {inputs.calculationMode === 'calculateIncome' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Mode 2: Calculate Maximum Monthly Income</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Your Monthly SIP</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.startingSipAmount)}
                      onChange={(e) => handleInputChange('startingSipAmount', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1,00,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{convertToWords(inputs.startingSipAmount)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Target Corpus at End Age</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.targetEndCorpus)}
                      onChange={(e) => handleInputChange('targetEndCorpus', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{inputs.targetEndCorpus === 0 ? 'Zero balance at end' : `Leave ${convertToWords(inputs.targetEndCorpus)}`}</p>
                </div>
                <div className="p-4 bg-green-100 rounded-lg text-center">
                  <label className="block text-sm font-medium text-green-800 mb-2">Maximum Monthly Income</label>
                  <div className="text-2xl font-bold text-green-700">
                    {formatCurrency(inputs.startingMonthlyIncome)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{convertToWords(inputs.startingMonthlyIncome)}</p>
                </div>
              </div>
            </div>
          )}

          {inputs.calculationMode === 'calculateEndCorpus' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Mode 3: Calculate Final Corpus</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Your Monthly SIP</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.startingSipAmount)}
                      onChange={(e) => handleInputChange('startingSipAmount', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1,00,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{convertToWords(inputs.startingSipAmount)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Desired Monthly Income</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.startingMonthlyIncome)}
                      onChange={(e) => handleInputChange('startingMonthlyIncome', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5,00,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{convertToWords(inputs.startingMonthlyIncome)}</p>
                </div>
                <div className="p-4 bg-green-100 rounded-lg text-center">
                  <label className="block text-sm font-medium text-green-800 mb-2">Final Corpus</label>
                  <div className="text-2xl font-bold text-green-700">
                    {results.length > 0 ? formatCurrency(results[results.length - 1]?.yearEndCorpus || 0) : '---'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {results.length > 0 ? convertToWords(results[results.length - 1]?.yearEndCorpus || 0) : 'Click Calculate'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {results.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <h3 className="font-medium text-blue-800">Total SIP Invested</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(summary.totalSipInvested)}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <h3 className="font-medium text-green-800">Total Withdrawn</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(summary.totalWithdrawn)}</p>
              </div>
              <div className="bg-indigo-50 p-6 rounded-lg text-center">
                <h3 className="font-medium text-indigo-800">Final Corpus</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{formatCurrency(summary.finalCorpus)}</p>
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-800 text-white">
              <h2 className="text-xl font-semibold">Year-by-Year Projection</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Age</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Phase</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">Year Start Corpus</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">Monthly SIP</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">Annual SIP Total</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">Monthly Income</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">Annual Withdrawal</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">Net Monthly Cash Flow</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">Year End Corpus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((row, index) => (
                    <tr key={index} className={`hover:bg-gray-50 transition-colors duration-200 ${row.isRetired ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 font-medium">{row.age}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            row.isRetired 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {row.isRetired ? 'Retirement' : 'Accumulation'}
                          </span>
                          {row.isSipActive && (
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                              row.isSipFrozen 
                                ? 'bg-orange-100 text-orange-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {row.isSipFrozen ? 'SIP Frozen' : 'SIP Active'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">{formatCurrency(row.yearStartCorpus)}</td>
                      <td className="px-6 py-4 text-right">{row.sipAmount > 0 ? formatCurrency(row.sipAmount) : '-'}</td>
                      <td className="px-6 py-4 text-right">{row.totalSipForYear > 0 ? formatCurrency(row.totalSipForYear) : '-'}</td>
                      <td className="px-6 py-4 text-right">{row.monthlyIncome > 0 ? formatCurrency(row.monthlyIncome) : '-'}</td>
                      <td className="px-6 py-4 text-right">{row.totalWithdrawalForYear > 0 ? formatCurrency(row.totalWithdrawalForYear) : '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-semibold ${row.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(row.netCashFlow))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-800">{formatCurrency(row.yearEndCorpus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SWPCalculator;