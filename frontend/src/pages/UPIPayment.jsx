import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Copy, ShieldCheck, Smartphone, UploadCloud } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { postOrder } from '../api';
import { useApp } from '../context/useApp';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function readCheckoutDraft() {
  try {
    const raw = sessionStorage.getItem('checkoutDraft');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function UPIPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useApp();

  const DEFAULT_VPA = import.meta.env.VITE_UPI_VPA || '8210993912-2@ybl';
  const DEFAULT_NAME = import.meta.env.VITE_UPI_NAME || 'SAMBX';
  const DEFAULT_NOTE = import.meta.env.VITE_UPI_NOTE || 'SAMBX order payment';

  const checkoutState = location.state || {};
  const storedDraft = readCheckoutDraft();

  const [vpa, setVpa] = useState(DEFAULT_VPA);
  const [name, setName] = useState(DEFAULT_NAME);
  const [amount, setAmount] = useState(
    // Only use checkout state or stored draft total. If neither exists, leave empty to avoid showing a default amount.
    checkoutState.amount ?? (storedDraft?.total != null ? (Number(storedDraft.total).toFixed?.(2) ?? String(storedDraft.total)) : '')
  );
  const [note, setNote] = useState(
    checkoutState.note ||
    (storedDraft?.shipping
      ? `SAMBX order payment - ${[storedDraft.shipping.firstName, storedDraft.shipping.lastName].filter(Boolean).join(' ').trim() || 'Customer'}`
      : '')
  );
  const [copied, setCopied] = useState(false);
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentScreenshotName, setPaymentScreenshotName] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const upiUri = useMemo(() => {
    const params = new URLSearchParams();

    if (vpa) params.set('pa', vpa);
    if (name) params.set('pn', name);
    if (amount) params.set('am', String(amount));
    if (note) params.set('tn', note);

    params.set('cu', 'INR');

    return `upi://pay?${params.toString()}`;
  }, [vpa, name, amount, note]);

  const qrSrc = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(upiUri)}`;
  }, [upiUri]);

  const checkoutDraft = useMemo(() => storedDraft, [storedDraft]);

  const hasValidCheckoutDraft = Boolean(
    checkoutDraft &&
    Array.isArray(checkoutDraft.items) &&
    checkoutDraft.items.length > 0 &&
    checkoutDraft.shipping &&
    typeof checkoutDraft.total !== 'undefined'
  );

  useEffect(() => {
    // Remove query string if present and preserve state navigation
    if (window.location.search) {
      navigate('/pay/upi', { replace: true, state: checkoutState });
    }

    // If there is a valid checkout draft, populate amount and note
    if (hasValidCheckoutDraft) {
      const nextAmount = Number(checkoutDraft.total || 0);
      if (!Number.isNaN(nextAmount) && nextAmount > 0) {
        setAmount(nextAmount.toFixed(2));
      }

      const customerName = [checkoutDraft.shipping?.firstName, checkoutDraft.shipping?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

      if (customerName) {
        setNote(`SAMBX order payment - ${customerName}`);
      }
    } else {
      // No valid draft or amount provided — redirect back to checkout to prevent accidental payment page access
      if (!checkoutState.amount) {
        navigate('/checkout', { replace: true });
      }
    }
  }, [checkoutDraft, hasValidCheckoutDraft, navigate, checkoutState]);

  useEffect(() => {
    if (!hasValidCheckoutDraft && !orderPlaced) {
      setPlaceOrderError('Checkout details are missing. Please return to checkout first.');
    }
  }, [hasValidCheckoutDraft, orderPlaced]);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // No-op
    }
  };

  const handleScreenshotChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (paymentScreenshot) {
        URL.revokeObjectURL(paymentScreenshot);
      }

      setPaymentScreenshotFile(file);
      setPaymentScreenshot(URL.createObjectURL(file));
      setPaymentScreenshotName(file.name || 'payment-proof');
      setPaymentSubmitted(false);
    }
  };

  const uploadPaymentScreenshot = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Payment screenshot upload is not configured.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      let message = 'Screenshot upload failed';
      try {
        const data = await response.json();
        message = data?.error?.message || message;
      } catch {
        message = response.statusText || message;
      }
      throw new Error(message);
    }

    return response.json();
  };

  const handleMarkPaid = () => {
    setPaymentSubmitted(true);
  };

  const handlePlaceOrder = async () => {
    setPlaceOrderError('');

    if (!paymentSubmitted) {
      setPlaceOrderError('Please submit payment proof before placing the order.');
      return;
    }

    if (!paymentScreenshot) {
      setPlaceOrderError('Please upload a payment screenshot before placing the order.');
      return;
    }

    if (!paymentScreenshotFile) {
      setPlaceOrderError('Please re-upload the payment screenshot and try again.');
      return;
    }

    if (!hasValidCheckoutDraft) {
      setPlaceOrderError('Checkout details are missing. Please return to checkout first.');
      return;
    }

    setPlacingOrder(true);

    try {
      const uploadResult = await uploadPaymentScreenshot(paymentScreenshotFile);
      const screenshotUrl = uploadResult?.secure_url || uploadResult?.url || '';

      const payload = {
        ...checkoutDraft,
        payment: {
          ...(checkoutDraft.payment || {}),
          method: checkoutDraft.payment?.method || 'online',
          reference: paymentReference.trim(),
          screenshotUrl,
          screenshotName: paymentScreenshotName,
          verified: false,
        },
        notes: [checkoutDraft.notes, paymentReference.trim() ? `UPI Ref: ${paymentReference.trim()}` : '']
          .filter(Boolean)
          .join('\n'),
      };

      const response = await postOrder(payload);
      
      setOrderNumber(response?.data?.orderNumber || '');
      clearCart();
      sessionStorage.removeItem('checkoutDraft');
      setOrderPlaced(true);
    } catch (err) {
      console.error('Order error:', err);
      setPlaceOrderError(err?.message || 'Unable to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-[calc(100vh-5rem)] px-4 pt-24 pb-10 sm:pt-28 sm:pb-12">
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/8 bg-surface-container/80 p-6 text-center shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Order placed</h2>
          <p className="mt-2 text-sm text-secondary-text">Your payment proof has been submitted and the order was placed successfully.</p>
          {orderNumber && <p className="mt-3 text-sm text-foreground/80">Order number: {orderNumber}</p>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/products" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110">
              Continue shopping
            </Link>
            <Link to="/checkout" className="inline-flex items-center justify-center rounded-full border border-white/8 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white/10">
              Back to checkout
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] px-4 pt-24 pb-8 sm:pt-28 sm:pb-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 sm:gap-6">
        <div className="mx-auto max-w-2xl px-1 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure UPI payment
          </p>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Pay safely with UPI</h1>
          <p className="mt-3 text-sm leading-6 text-secondary-text sm:text-base">
            Scan the QR code, verify the payee, and complete payment from your UPI app.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] sm:gap-6">
          <section className="rounded-3xl border border-white/8 bg-surface-container/80 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-3xl bg-white p-3 shadow-lg shadow-black/20 sm:p-4">
                <img src={qrSrc} alt="UPI QR code" className="h-56 w-56 rounded-2xl object-contain sm:h-72 sm:w-72" />
              </div>

              <a
                href={upiUri}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/8 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white/10 sm:w-auto"
              >
                <Smartphone className="h-4 w-4" />
                Open in UPI app
              </a>

              <div className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center shadow-sm shadow-black/10 backdrop-blur sm:mt-6 sm:px-5 sm:py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-outline">
                  Amount to pay
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  ₹{amount || '0.00'}
                </p>
              </div>

              <div className="mt-5 flex w-full flex-col gap-3 sm:mt-6 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => handleCopy(upiUri)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/8 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white/10 sm:w-auto"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied' : 'Copy UPI link'}
                </button>
              </div>

              <p className="mt-5 text-sm text-secondary-text sm:mt-6">
                Safe and secure UPI payment.
              </p>
            </div>
          </section>

          <aside className="rounded-3xl border border-white/8 bg-surface-container/80 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
            <div className="flex flex-col gap-3 text-center sm:flex-row sm:text-left">
              <div className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">Upload payment proof</h2>
                <p className="mt-1 text-sm text-secondary-text">
                  Add the screenshot here so we can verify the payment faster.
                </p>

                <div className="mt-4 space-y-4 sm:mt-5">
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-outline">
                      Payment screenshot
                    </span>
                    <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/5 px-3 py-3 text-center text-sm font-semibold leading-5 text-foreground transition hover:bg-white/10 sm:px-4">
                      <UploadCloud className="h-4 w-4" />
                      <span className="min-w-0 wrap-break-word">Upload screenshot</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
                    </label>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-outline">
                      Reference number
                    </span>
                    <input
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="UTR / Ref No."
                      className="w-full rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  {paymentScreenshot && (
                    <div className="overflow-hidden rounded-2xl border border-white/8 bg-black/20">
                      <img src={paymentScreenshot} alt="Payment screenshot preview" className="h-56 w-full object-contain" />
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleMarkPaid}
                      className="inline-flex w-full flex-1 items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                    >
                      Submit proof
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (paymentScreenshot) {
                          URL.revokeObjectURL(paymentScreenshot);
                        }
                        setPaymentScreenshotFile(null);
                        setPaymentScreenshot(null);
                        setPaymentScreenshotName('');
                        setPaymentReference('');
                        setPaymentSubmitted(false);
                      }}
                      className="inline-flex w-full flex-1 items-center justify-center rounded-full border border-white/8 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white/10"
                    >
                      Clear
                    </button>
                  </div>

                  <p className="text-xs leading-5 text-secondary-text">
                    Your proof is only used for verification. No OTP, PIN, or card details are ever requested.
                  </p>

                  {paymentSubmitted && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                      Payment proof submitted. You can now place the order.
                    </div>
                  )}

                  {placeOrderError && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                      {placeOrderError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {placingOrder ? 'Placing order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
