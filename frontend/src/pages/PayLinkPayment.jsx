/**
 * PayLinkPayment.jsx
 * Route: /pay/link/:token
 *
 * Completely separate from checkout flow.
 * Used when admin sends a customer a custom payment link.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  ShieldCheck,
  Smartphone,
  UploadCloud,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { getPayLink, postPayLinkOrder } from '../api';

const CLOUDINARY_CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const DEFAULT_VPA              = import.meta.env.VITE_UPI_VPA  || '8210993912-2@ybl';
const DEFAULT_NAME             = import.meta.env.VITE_UPI_NAME || 'Anokhi Ada';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function uploadScreenshot(file) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Screenshot upload is not configured.');
  }
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: fd }
  );
  if (!res.ok) {
    let msg = 'Screenshot upload failed.';
    try { const d = await res.json(); msg = d?.error?.message || msg; } catch { /**/ }
    throw new Error(msg);
  }
  return res.json();
}

function formatExpiry(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', {
    timeZone:    'Asia/Kolkata',
    day:         'numeric',
    month:       'short',
    year:        'numeric',
    hour:        '2-digit',
    minute:      '2-digit',
  });
}

// ── States ────────────────────────────────────────────────────────────────────
const STATUS = {
  LOADING:  'loading',   // verifying token with backend
  INVALID:  'invalid',   // token not found / expired / already used
  READY:    'ready',     // valid, show payment UI
  SUCCESS:  'success',   // order placed
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function PayLinkPayment() {
  const { token } = useParams();

  // Page status
  const [status,      setStatus]      = useState(STATUS.LOADING);
  const [statusError, setStatusError] = useState('');

  // Pay link data from backend
  const [amount,    setAmount]    = useState('');
  const [note,      setNote]      = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Payment form
  const [screenshotFile,    setScreenshotFile]    = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotName,    setScreenshotName]    = useState('');
  const [reference,         setReference]         = useState('');
  const [proofSubmitted,    setProofSubmitted]     = useState(false);
  const [placingOrder,      setPlacingOrder]      = useState(false);
  const [orderError,        setOrderError]        = useState('');
  const [orderNumber,       setOrderNumber]       = useState('');
  const [copied,            setCopied]            = useState(false);

  // ── Verify token on mount ───────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setStatusError('No payment token found in URL.');
      setStatus(STATUS.INVALID);
      return;
    }

    getPayLink(token)
      .then((data) => {
        setAmount(Number(data.amount).toFixed(2));
        setNote(data.note || '');
        setExpiresAt(data.expiresAt || '');
        setStatus(STATUS.READY);
      })
      .catch((err) => {
        setStatusError(err.message || 'Invalid or expired payment link.');
        setStatus(STATUS.INVALID);
      });
  }, [token]);

  // ── UPI URI + QR ────────────────────────────────────────────────────────────
  const upiUri = useMemo(() => {
    const p = new URLSearchParams();
    if (DEFAULT_VPA)  p.set('pa', DEFAULT_VPA);
    if (DEFAULT_NAME) p.set('pn', DEFAULT_NAME);
    if (amount)       p.set('am', amount);
    if (note)         p.set('tn', note);
    p.set('cu', 'INR');
    return `upi://pay?${p.toString()}`;
  }, [amount, note]);

  const qrSrc = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(upiUri)}`,
    [upiUri]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upiUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /**/ }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
    setScreenshotName(file.name || 'payment-proof');
    setProofSubmitted(false);
  };

  const handleClear = () => {
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setScreenshotName('');
    setReference('');
    setProofSubmitted(false);
  };

  const handlePlaceOrder = async () => {
    setOrderError('');

    if (!proofSubmitted) {
      setOrderError('Please click "Submit proof" first.');
      return;
    }
    if (!screenshotFile) {
      setOrderError('Please upload a payment screenshot.');
      return;
    }

    setPlacingOrder(true);
    try {
      const uploadResult  = await uploadScreenshot(screenshotFile);
      const screenshotUrl = uploadResult?.secure_url || uploadResult?.url || '';

      const response = await postPayLinkOrder(token, {
        screenshotUrl,
        screenshotName,
        paymentReference: reference.trim(),
      });

      setOrderNumber(response?.data?.orderNumber || '');
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      setOrderError(err.message || 'Unable to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // ── Render: Loading ──────────────────────────────────────────────────────────
  if (status === STATUS.LOADING) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-secondary-text">Verifying payment link…</p>
        </div>
      </div>
    );
  }

  // ── Render: Invalid / expired ────────────────────────────────────────────────
  if (status === STATUS.INVALID) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 pt-24 pb-10">
        <div className="mx-auto max-w-md rounded-3xl border border-red-500/20 bg-surface-container/80 p-8 text-center shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Invalid payment link</h2>
          <p className="mt-2 text-sm text-secondary-text">
            {statusError || 'This payment link is invalid or has expired.'}
          </p>
          <p className="mt-3 text-xs text-secondary-text/60">
            Contact Anokhi Ada to get a new payment link.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-full border border-white/8 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white/10"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  // ── Render: Success ──────────────────────────────────────────────────────────
  if (status === STATUS.SUCCESS) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 pt-24 pb-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/8 bg-surface-container/80 p-6 text-center shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Payment submitted!</h2>
          <p className="mt-2 text-sm text-secondary-text">
            Your payment proof has been received. We'll verify and confirm shortly.
          </p>
          {orderNumber && (
            <p className="mt-3 text-sm text-foreground/80">Reference: <span className="font-semibold">{orderNumber}</span></p>
          )}
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  // ── Render: Main payment UI ──────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-5rem)] px-4 pt-24 pb-8 sm:pt-28 sm:pb-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 sm:gap-6">

        {/* Header */}
        <div className="mx-auto max-w-2xl px-1 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure UPI payment
          </p>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Pay safely with UPI</h1>
          {note && (
            <p className="mt-3 text-sm text-secondary-text">
              {note}
            </p>
          )}
          {expiresAt && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-secondary-text/70">
              <Clock className="h-3 w-3" />
              Link valid until {formatExpiry(expiresAt)}
            </p>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] sm:gap-6">

          {/* QR Panel */}
          <section className="rounded-3xl border border-white/8 bg-surface-container/80 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-3xl bg-white p-3 shadow-lg shadow-black/20 sm:p-4">
                <img
                  src={qrSrc}
                  alt="UPI QR code"
                  className="h-56 w-56 rounded-2xl object-contain sm:h-72 sm:w-72"
                />
              </div>

              <a
                href={upiUri}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/8 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white/10 sm:w-auto"
              >
                <Smartphone className="h-4 w-4" />
                Open in UPI app
              </a>

              <div className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center sm:mt-6 sm:px-5 sm:py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-outline">
                  Amount to pay
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  ₹{amount}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/8 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white/10 sm:mt-6 sm:w-auto"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy UPI link'}
              </button>

              <p className="mt-5 text-sm text-secondary-text sm:mt-6">
                Safe and secure UPI payment.
              </p>
            </div>
          </section>

          {/* Upload Proof Panel */}
          <aside className="rounded-3xl border border-white/8 bg-surface-container/80 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
            <div className="flex flex-col gap-3 text-center sm:flex-row sm:text-left">
              <div className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">Upload payment proof</h2>
                <p className="mt-1 text-sm text-secondary-text">
                  After paying, upload the screenshot to confirm your payment.
                </p>

                <div className="mt-4 space-y-4 sm:mt-5">

                  {/* Screenshot upload */}
                  <div>
                    <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-outline">
                      Payment screenshot
                    </span>
                    <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/5 px-3 py-3 text-sm font-semibold text-foreground transition hover:bg-white/10 sm:px-4">
                      <UploadCloud className="h-4 w-4" />
                      Upload screenshot
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>

                  {/* Reference */}
                  <div>
                    <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-outline">
                      Reference number
                    </span>
                    <input
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="UTR / Ref No."
                      className="w-full rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Screenshot preview */}
                  {screenshotPreview && (
                    <div className="overflow-hidden rounded-2xl border border-white/8 bg-black/20">
                      <img src={screenshotPreview} alt="Screenshot preview" className="h-56 w-full object-contain" />
                    </div>
                  )}

                  {/* Submit / Clear */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setProofSubmitted(true)}
                      className="inline-flex w-full flex-1 items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                    >
                      Submit proof
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="inline-flex w-full flex-1 items-center justify-center rounded-full border border-white/8 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-white/10"
                    >
                      Clear
                    </button>
                  </div>

                  <p className="text-xs leading-5 text-secondary-text">
                    Your proof is only used for verification. No OTP, PIN, or card details are ever requested.
                  </p>

                  {proofSubmitted && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                      Payment proof submitted. You can now place the order.
                    </div>
                  )}

                  {orderError && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                      {orderError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {placingOrder
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing order…</>
                      : 'Confirm Payment'
                    }
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