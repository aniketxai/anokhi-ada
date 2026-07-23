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

export function loadRazorpayScript(retries = 3, delayMs = 1000) {
  return new Promise((resolve) => {
    function tryLoad(attemptsLeft) {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }

      // Remove any previously failed or interrupted script elements
      const existingScripts = document.querySelectorAll('script[src*="checkout.razorpay.com"]');
      existingScripts.forEach((s) => s.remove());

      const script = document.createElement('script');
      // Cache-buster parameter prevents stale connection error caching
      script.src = `https://checkout.razorpay.com/v1/checkout.js?_t=${Date.now()}`;
      script.async = true;

      script.onload = () => {
        if (typeof window !== 'undefined' && window.Razorpay) {
          resolve(true);
        } else if (attemptsLeft > 1) {
          setTimeout(() => tryLoad(attemptsLeft - 1), delayMs);
        } else {
          resolve(false);
        }
      };

      script.onerror = () => {
        script.remove();
        if (attemptsLeft > 1) {
          setTimeout(() => tryLoad(attemptsLeft - 1), delayMs);
        } else {
          console.error('Failed to load Razorpay SDK checkout script after multiple retries.');
          resolve(false);
        }
      };

      document.head.appendChild(script);
    }

    tryLoad(retries);
  });
}
