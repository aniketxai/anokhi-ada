/**
 * Dynamically loads the Razorpay Checkout SDK script into the DOM.
 * @returns {Promise<boolean>} True if loaded successfully, false otherwise.
 */
if (typeof window !== 'undefined' && !window.__rzpIframePatched) {
  window.__rzpIframePatched = true;
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = function (tagName, options) {
    const element = originalCreateElement(tagName, options);
    if (element && String(tagName).toLowerCase() === 'iframe') {
      element.setAttribute(
        'allow',
        'accelerometer *; gyroscope *; magnetometer *; payment *; camera *'
      );
    }
    return element;
  };
}

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
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

    document.head.appendChild(script);
  });
}
