export const formatCurrency = (amount: number) => {
  if (!amount || isNaN(amount)) return '₹0';
  
  // For display in tables/summary
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  
  // For amounts less than 1 lakh, use Indian comma notation
  const parts = amount.toFixed(0).split('.');
  let integerPart = parts[0];
  
  // Handle negative numbers
  const isNegative = integerPart.startsWith('-');
  if (isNegative) {
    integerPart = integerPart.substring(1);
  }
  
  // Indian numbering system
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  
  const result = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  
  return '₹' + (isNegative ? '-' : '') + result;
};

export const formatNumberWithCommas = (number: number) => {
  if (!number || number === 0 || isNaN(number)) return '0';
  
  // Convert to string and split by decimal point
  const parts = number.toString().split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Handle negative numbers
  const isNegative = integerPart.startsWith('-');
  if (isNegative) {
    integerPart = integerPart.substring(1);
  }
  
  // Indian numbering system
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  
  const result = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  
  // Add back negative sign and decimal part
  return (isNegative ? '-' : '') + result + (decimalPart ? '.' + decimalPart : '');
};

export const convertToWords = (amount: number) => {
  if (!amount || amount === 0 || isNaN(amount)) return '';
  if (amount >= 10000000) {
    const crores = (amount / 10000000).toFixed(1);
    return `${crores} Crore${crores !== '1.0' ? 's' : ''}`;
  }
  if (amount >= 100000) {
    const lakhs = (amount / 100000).toFixed(1);
    return `${lakhs} Lakh${lakhs !== '1.0' ? 's' : ''}`;
  }
  if (amount >= 1000) {
    const thousands = (amount / 1000).toFixed(1);
    return `${thousands} Thousand`;
  }
  return amount.toString();
}; 