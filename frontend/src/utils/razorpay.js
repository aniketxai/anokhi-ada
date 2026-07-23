/**
 * Dynamically loads the Razorpay Checkout SDK script into the DOM.
 * @returns {Promise<boolean>} True if loaded successfully, false otherwise.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.error('Failed to load Razorpay SDK checkout script.');
      resolve(false);
    };

    document.body.appendChild(script);
  });
}
