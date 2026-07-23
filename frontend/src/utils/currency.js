// Simple currency helper to format raw INR prices from the API/JSON data

export function formatINR(inrValue, { withSymbol = true } = {}) {
  const inr = Number(inrValue);
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(inr);
  } catch {
    const symbol = withSymbol ? '₹' : '';
    return `${symbol}${inr.toFixed(2)}`;
  }
}

export default formatINR;
