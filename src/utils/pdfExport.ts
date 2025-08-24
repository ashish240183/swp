// PDF Export utility for SWP Calculator
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Custom formatter for PDF to avoid formatting issues
const formatCurrencyForPDF = (amount: number): string => {
  if (amount === 0) return 'Rs 0';
  
  // Handle negative numbers
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Manual formatting without locale to avoid PDF rendering issues
  const numStr = Math.round(absAmount).toString();
  let result = '';
  
  // Add commas manually using standard international format
  for (let i = numStr.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) {
      result = ',' + result;
    }
    result = numStr[i] + result;
  }
  
  return `${isNegative ? '-' : ''}Rs ${result}`;
};

interface SWPInputs {
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

interface SWPSummary {
  totalSipInvested: number;
  totalWithdrawn: number;
  finalCorpus: number;
}

export const exportToPDF = async (
  inputs: SWPInputs,
  summary: SWPSummary,
  hasResults: boolean
): Promise<void> => {
  try {
    // Create new jsPDF instance
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SWP Calculator Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Add generation date
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Add input parameters section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Input Parameters', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const inputData = [
      ['Current Age', `${inputs.currentAge} years`],
      ['Planned Retirement Age', `${inputs.retirementAge} years`],
      ['Life Expectancy (SWP End Age)', `${inputs.endAge} years`],
      ['SIP Payment End Age', `${inputs.sipPaymentEndAge} years`],
      ['SIP Increase Freeze Age', `${inputs.sipFreezeAge} years`],
      ['Expected Annual Return', `${inputs.expectedReturn}%`],
      ['Annual Income Increase', `${inputs.yearlyIncomeIncrease}%`],
      ['Current Investment Value', formatCurrencyForPDF(inputs.addedCorpusNow)],
      ['Lumpsum at Retirement', formatCurrencyForPDF(inputs.addedCorpusRetirement)],
      ['Annual SIP Increase', `${inputs.sipIncreaseRate}%`],
    ];

    // Mode-specific inputs
    if (inputs.calculationMode === 'calculateSIP') {
      inputData.push(['Calculation Mode', 'Calculate Required Monthly SIP']);
      inputData.push(['Desired Monthly Income', formatCurrencyForPDF(inputs.startingMonthlyIncome)]);
      inputData.push(['Target Corpus at End Age', formatCurrencyForPDF(inputs.targetEndCorpus)]);
    } else if (inputs.calculationMode === 'calculateIncome') {
      inputData.push(['Calculation Mode', 'Calculate Maximum Monthly Income']);
      inputData.push(['Monthly SIP Amount', formatCurrencyForPDF(inputs.startingSipAmount)]);
      inputData.push(['Target Corpus at End Age', formatCurrencyForPDF(inputs.targetEndCorpus)]);
    } else if (inputs.calculationMode === 'calculateEndCorpus') {
      inputData.push(['Calculation Mode', 'Calculate Final Corpus']);
      inputData.push(['Monthly SIP Amount', formatCurrencyForPDF(inputs.startingSipAmount)]);
      inputData.push(['Desired Monthly Income', formatCurrencyForPDF(inputs.startingMonthlyIncome)]);
    }

    // Create table for input parameters
    let x = 20;
    for (let i = 0; i < inputData.length; i++) {
      const [label, value] = inputData[i];
      
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFont('helvetica', 'normal');
      pdf.text(label + ':', x, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.text(value, x + 60, yPosition);
      yPosition += 7;
    }

    yPosition += 10;

    // Add summary section if results are calculated
    if (hasResults) {
      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Summary Results', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');

      const summaryData = [
        ['Total SIP Invested', formatCurrencyForPDF(summary.totalSipInvested)],
        ['Total Amount Withdrawn', formatCurrencyForPDF(summary.totalWithdrawn)],
        ['Final Corpus Remaining', formatCurrencyForPDF(summary.finalCorpus)]
      ];

      if (inputs.calculationMode === 'calculateSIP') {
        summaryData.unshift(['Required Monthly SIP', formatCurrencyForPDF(inputs.startingSipAmount)]);
      } else if (inputs.calculationMode === 'calculateIncome') {
        summaryData.unshift(['Maximum Monthly Income', formatCurrencyForPDF(inputs.startingMonthlyIncome)]);
      }

      for (const [label, value] of summaryData) {
        pdf.setFont('helvetica', 'normal');
        pdf.text(label + ':', 20, yPosition);
        pdf.setFont('helvetica', 'bold');
        pdf.text(value, 80, yPosition);
        yPosition += 8;
      }
    }

    // Add chart capture if results table exists
    if (hasResults) {
      yPosition += 15;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Year-by-Year Projection Table', 20, yPosition);

      // Try to capture the results table with full scroll content
      const resultsTable = document.querySelector('.bg-white.rounded-xl.shadow-lg.overflow-hidden') as HTMLElement;
      
      if (resultsTable) {
        try {
          // Find the scrollable container within the table
          const scrollableContainer = resultsTable.querySelector('.overflow-x-auto.max-h-96') as HTMLElement;
          
          if (scrollableContainer) {
            // Temporarily remove height constraint and scroll to capture full content
            const originalMaxHeight = scrollableContainer.style.maxHeight;
            const originalOverflow = scrollableContainer.style.overflow;
            
            scrollableContainer.style.maxHeight = 'none';
            scrollableContainer.style.overflow = 'visible';
            
            // Wait a moment for the DOM to update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const canvas = await html2canvas(resultsTable, {
              scale: 1.5,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              height: resultsTable.scrollHeight,
              windowWidth: resultsTable.scrollWidth
            });

            // Restore original styles
            scrollableContainer.style.maxHeight = originalMaxHeight;
            scrollableContainer.style.overflow = originalOverflow;

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 170;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Check if image fits on current page, if not add new page
            if (yPosition + imgHeight > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20;
            } else {
              yPosition += 10;
            }

            // If the image is too tall for a single page, we might need to split it
            if (imgHeight > pageHeight - 40) {
              // Calculate how to split the image across pages
              const availableHeight = pageHeight - yPosition - 20;
              const remainingHeight = imgHeight - availableHeight;
              
              // Add first part
              pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, availableHeight, undefined, 'NONE');
              
              // Add remaining parts on new pages
              let remainingImageHeight = remainingHeight;
              let sourceY = availableHeight;
              
              while (remainingImageHeight > 0) {
                pdf.addPage();
                const currentPageHeight = Math.min(remainingImageHeight, pageHeight - 40);
                
                // Create a new canvas with just the portion we need
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                const img = new Image();
                
                await new Promise<void>((resolve) => {
                  img.onload = () => {
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = (currentPageHeight * canvas.width) / imgWidth;
                    tempCtx?.drawImage(
                      canvas, 
                      0, (sourceY * canvas.width) / imgWidth, 
                      canvas.width, tempCanvas.height,
                      0, 0, 
                      canvas.width, tempCanvas.height
                    );
                    resolve();
                  };
                  img.src = imgData;
                });
                
                const tempImgData = tempCanvas.toDataURL('image/png');
                pdf.addImage(tempImgData, 'PNG', 20, 20, imgWidth, currentPageHeight);
                
                remainingImageHeight -= currentPageHeight;
                sourceY += currentPageHeight;
              }
            } else {
              pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
            }
          } else {
            // Fallback: capture the table as is
            const canvas = await html2canvas(resultsTable, {
              scale: 1.5,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 170;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (yPosition + imgHeight > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20;
            } else {
              yPosition += 10;
            }

            pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          }
        } catch (error) {
          console.warn('Failed to capture table image:', error);
          yPosition += 10;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'italic');
          pdf.text('Note: Year-by-year projection table could not be captured in this PDF.', 20, yPosition);
          pdf.text('Please refer to the web application for detailed yearly breakdown.', 20, yPosition + 5);
        }
      }
    }

    // Add footer
    const pageCount = pdf.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      pdf.text(
        'Generated by SWP Calculator',
        pageWidth - 20,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    // Generate filename with current date and calculation mode
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const modeString = inputs.calculationMode.replace('calculate', '');
    const filename = `SWP_Calculator_${modeString}_${dateString}.pdf`;

    // Save the PDF
    pdf.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};
