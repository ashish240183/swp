import { useEffect } from 'react';
import { useSWPCalculator } from '../hooks/useSWPCalculator';
import { formatCurrency, convertToWords, formatNumberWithCommas } from '../utils/formatters';

const SWPCalculator = () => {
  const {
    inputs,
    results,
    summary,
    errors,
    hasCalculated,
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
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">SWP Calculator</h1>
          <p className="text-indigo-100 text-sm sm:text-base">A comprehensive tool to plan your systematic withdrawal strategy.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Parameters</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Current Age</label>
                      <input
                        type="text"
                        value={formatInputValue(inputs.currentAge)}
                        onChange={(e) => handleInputChange('currentAge', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter your age as of today.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Planned Retirement Age</label>
                      <input
                        type="text"
                        value={formatInputValue(inputs.retirementAge)}
                        onChange={(e) => handleInputChange('retirementAge', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">The age you plan to stop working.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Life Expectancy (SWP End Age)</label>
                      <input
                        type="text"
                        value={formatInputValue(inputs.endAge)}
                        onChange={(e) => handleInputChange('endAge', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">The age until which you want to receive withdrawals.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Annual Return (%)</label>
                      <input
                        type="text"
                        value={formatInputValue(inputs.expectedReturn)}
                        onChange={(e) => handleInputChange('expectedReturn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Your portfolio's estimated annual growth rate.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income Increase (%)</label>
                    <input
                      type="text"
                      value={formatInputValue(inputs.yearlyIncomeIncrease)}
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
                    <div className="relative">
                      <input
                        type="text"
                        value={formatInputValue(inputs.addedCorpusNow)}
                        onChange={(e) => handleInputChange('addedCorpusNow', e.target.value)}
                        className="w-full pr-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="5,00,00,000"
                      />
                      <span className="absolute bottom-0.5 right-3 text-xs text-gray-400 pointer-events-none">{convertToWords(inputs.addedCorpusNow)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">The total value of your current investments.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lumpsum at Retirement (₹)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formatInputValue(inputs.addedCorpusRetirement)}
                        onChange={(e) => handleInputChange('addedCorpusRetirement', e.target.value)}
                        className="w-full pr-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="5,00,00,000"
                      />
                      <span className="absolute bottom-0.5 right-3 text-xs text-gray-400 pointer-events-none">{convertToWords(inputs.addedCorpusRetirement)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Any extra funds you'll add at retirement (e.g., PF).</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Annual SIP Increase (%)</label>
                      <input
                        type="text"
                        value={formatInputValue(inputs.sipIncreaseRate)}
                        onChange={(e) => handleInputChange('sipIncreaseRate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">The yearly percentage increase in your SIP amount.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SIP End Age</label>
                      <input
                        type="text"
                        value={inputs.sipPaymentEndAge === 0 ? '' : formatInputValue(inputs.sipPaymentEndAge)}
                        onChange={(e) => handleInputChange('sipPaymentEndAge', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">The age you will stop making SIP contributions.</p>
                      {errors.sipPaymentEndAge && (
                        <p className="text-xs text-red-600 mt-1">{errors.sipPaymentEndAge}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SIP Increase Freeze Age</label>
                    <input
                      type="text"
                      value={inputs.sipFreezeAge === 0 ? '' : formatInputValue(inputs.sipFreezeAge)}
                      onChange={(e) => handleInputChange('sipFreezeAge', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">The age your SIP amount stops increasing annually.</p>
                    {errors.sipFreezeAge && (
                      <p className="text-xs text-red-600 mt-1">{errors.sipFreezeAge}</p>
                    )}
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
                <h3 className="font-semibold text-blue-800">Calculate Required Monthly SIP</h3>
                <p className="text-sm text-gray-600">Find the SIP needed for your goals.</p>
              </div>
              <div 
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${inputs.calculationMode === 'calculateIncome' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}
                onClick={() => setInputs(prev => ({ ...prev, calculationMode: 'calculateIncome' }))}
              >
                <h3 className="font-semibold text-blue-800">Calculate Max Monthly Income</h3>
                <p className="text-sm text-gray-600">Find the max income you can get.</p>
              </div>
              <div 
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${inputs.calculationMode === 'calculateEndCorpus' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}
                onClick={() => setInputs(prev => ({ ...prev, calculationMode: 'calculateEndCorpus' }))}
              >
                <h3 className="font-semibold text-blue-800">Calculate Final Corpus</h3>
                <p className="text-sm text-gray-600">See the final corpus value.</p>
              </div>
            {/* Mode specific inputs placed inside the Calculation Mode card */}
            {inputs.calculationMode === 'calculateSIP' && (
              <div className="mt-6 grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desired Monthly Income</label>
                  <div className="flex items-center relative">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.startingMonthlyIncome)}
                      onChange={(e) => handleInputChange('startingMonthlyIncome', e.target.value)}
                      className="flex-1 pr-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5,00,000"
                    />
                    <span className="absolute bottom-0.5 right-3 text-xs text-gray-400 pointer-events-none">{convertToWords(inputs.startingMonthlyIncome)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Corpus at End Age</label>
                  <div className="flex items-center relative">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.targetEndCorpus)}
                      onChange={(e) => handleInputChange('targetEndCorpus', e.target.value)}
                      className="flex-1 pr-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <span className="absolute bottom-0.5 right-3 text-xs text-gray-400 pointer-events-none">{convertToWords(inputs.targetEndCorpus)}</span>
                  </div>
                </div>
              </div>
            )}
            {inputs.calculationMode === 'calculateIncome' && (
              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Monthly SIP</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.startingSipAmount)}
                      onChange={(e) => handleInputChange('startingSipAmount', e.target.value)}
                      className="flex-1 pr-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1,00,000"
                    />
                    <span className="absolute bottom-0.5 right-3 text-xs text-gray-400 pointer-events-none">{convertToWords(inputs.startingSipAmount)}</span>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Corpus at End Age</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.targetEndCorpus)}
                      onChange={(e) => handleInputChange('targetEndCorpus', e.target.value)}
                      className="flex-1 pr-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <span className="absolute bottom-0.5 right-3 text-xs text-gray-400 pointer-events-none">{convertToWords(inputs.targetEndCorpus)}</span>
                  </div>
                </div>
              </div>
            )}
            {inputs.calculationMode === 'calculateEndCorpus' && (
              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Monthly SIP</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.startingSipAmount)}
                      onChange={(e) => handleInputChange('startingSipAmount', e.target.value)}
                      className="flex-1 pr-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1,00,000"
                    />
                    <span className="absolute bottom-0.5 right-3 text-xs text-gray-400 pointer-events-none">{convertToWords(inputs.startingSipAmount)}</span>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desired Monthly Income</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.startingMonthlyIncome)}
                      onChange={(e) => handleInputChange('startingMonthlyIncome', e.target.value)}
                      className="flex-1 pr-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5,00,000"
                    />
                    <span className="absolute bottom-0.5 right-3 text-xs text-gray-400 pointer-events-none">{convertToWords(inputs.startingMonthlyIncome)}</span>
                  </div>
                </div>
              </div>
            )}
            </div>

          </div>
        </div>

        {/* Calculate button spanning full width */}
        <div className="mb-8">
          <button
            disabled={Object.values(errors).some(Boolean)}
            onClick={calculateSWP}
            className={`w-full lg:w-1/2 mx-auto block px-12 py-4 rounded-md font-medium text-lg transition-all duration-300 transform hover:scale-105 ${Object.values(errors).some(Boolean) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700'}`}
          >
            Calculate SWP
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md mb-8 hidden">
          {inputs.calculationMode === 'calculateSIP' && (
            <div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="p-4 bg-gray-50 rounded-lg hidden">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Desired Monthly Income</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.startingMonthlyIncome)}
                      onChange={(e) => handleInputChange('startingMonthlyIncome', e.target.value)}
                      className="flex-1 pr-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5,00,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{convertToWords(inputs.startingMonthlyIncome)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg hidden">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Target Corpus at End Age</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.targetEndCorpus)}
                      onChange={(e) => handleInputChange('targetEndCorpus', e.target.value)}
                      className="flex-1 pr-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{inputs.targetEndCorpus === 0 ? 'Zero balance at end' : `Leave ${convertToWords(inputs.targetEndCorpus)}`}</p>
                </div>
                <div className="p-4 bg-green-100 rounded-lg text-center">
                  <label className="block text-sm font-medium text-green-800 mb-2">Required Monthly SIP</label>
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg hidden">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Your Monthly SIP</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.startingSipAmount)}
                      onChange={(e) => handleInputChange('startingSipAmount', e.target.value)}
                      className="flex-1 pr-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1,00,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{convertToWords(inputs.startingSipAmount)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg hidden">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Target Corpus at End Age</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.targetEndCorpus)}
                      onChange={(e) => handleInputChange('targetEndCorpus', e.target.value)}
                      className="flex-1 pr-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg hidden">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Your Monthly SIP</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.startingSipAmount)}
                      onChange={(e) => handleInputChange('startingSipAmount', e.target.value)}
                      className="flex-1 pr-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1,00,000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{convertToWords(inputs.startingSipAmount)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg hidden">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Desired Monthly Income</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">₹</span>
                    <input
                      type="text"
                      value={formatInputValue(inputs.startingMonthlyIncome)}
                      onChange={(e) => handleInputChange('startingMonthlyIncome', e.target.value)}
                      className="flex-1 pr-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        
        {hasCalculated && results.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {inputs.calculationMode === 'calculateSIP' && (
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <h3 className="font-medium text-green-800">Required Monthly SIP</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(inputs.startingSipAmount)}</p>
                </div>
              )}
              {inputs.calculationMode === 'calculateIncome' && (
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <h3 className="font-medium text-green-800">Max Monthly Income</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(inputs.startingMonthlyIncome)}</p>
                </div>
              )}
              {inputs.calculationMode === 'calculateEndCorpus' && (
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <h3 className="font-medium text-green-800">Final Corpus</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{results.length > 0 ? formatCurrency(results[results.length - 1]?.yearEndCorpus || 0) : '---'}</p>
                </div>
              )}
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
            <div className="px-4 py-3 bg-gray-800 text-white">
              <h2 className="text-lg font-semibold">Year-by-Year Projection</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                  <span>Working Years</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-400 rounded"></div>
                  <span>Retirement Years 🏖️</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-orange-300">❄️ SIP Frozen</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 border-b border-gray-300">Age</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-700 border-b border-gray-300">Start Corpus</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-700 border-b border-gray-300">Monthly SIP</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-700 border-b border-gray-300">Monthly Income</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-700 border-b border-gray-300 hidden lg:table-cell">Net Cash Flow</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-700 border-b border-gray-300">End Corpus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((row, index) => (
                    <tr key={index} className={`transition-colors duration-150 ${
                      row.isRetired 
                        ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-400' 
                        : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400'
                    }`}>
                      <td className={`px-3 py-2 font-medium whitespace-nowrap ${
                        row.isRetired ? 'text-red-800' : 'text-blue-800'
                      }`}>
                        <div className="flex items-center gap-1">
                          <span>{row.age}</span>
                          {row.isRetired && <span className="text-xs">🏖️</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(row.yearStartCorpus)}</td>
                      <td className="px-3 py-2 text-right">
                        {row.sipAmount > 0 ? (
                          <span className={`font-medium ${
                            row.isSipFrozen ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(row.sipAmount)}
                            {row.isSipFrozen && <span className="ml-1 text-xs">❄️</span>}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {row.monthlyIncome > 0 ? (
                          <span className="text-blue-600 font-medium">{formatCurrency(row.monthlyIncome)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right hidden lg:table-cell">
                        <span className={`font-medium ${
                          row.netCashFlow < 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {row.netCashFlow >= 0 ? '+' : ''}{formatCurrency(row.netCashFlow)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatCurrency(row.yearEndCorpus)}</td>
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