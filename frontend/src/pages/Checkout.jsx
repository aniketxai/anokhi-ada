import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ShieldCheck, CreditCard, QrCode, Banknote, Loader2 } from 'lucide-react';

import { useApp } from '../context/useApp';
import Button from '../components/Button';
import { formatINR } from '../utils/currency';
import { postOrder, createRazorpayOrder, verifyRazorpayPayment } from '../api';
import { loadRazorpayScript } from '../utils/razorpay';

import CouponSelector from '../components/common/CouponSelector';
import CeoDeliveryOption from '../components/common/CeoDeliveryOption';

export default function Checkout() {
  const { cart, cartTotal, clearCart, appliedCoupon, discountAmount, isCeoDelivery } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const [shipping, setShipping] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    landmark: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const baseShippingFee = cartTotal < 399 ? 80 : 0;
  const ceoDeliveryFee = isCeoDelivery ? 5000 : 0;
  const shippingFee = baseShippingFee;

  const isCodAvailable = cartTotal >= 399;
  const effectivePaymentMethod = isCodAvailable ? paymentMethod : (paymentMethod === 'cod' ? 'razorpay' : paymentMethod);

  const codCharge = effectivePaymentMethod === 'cod' ? 100 : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount) + baseShippingFee + ceoDeliveryFee + codCharge;

  const buildOrderPayload = () => ({
    items: cart.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.images?.[0] || '',
    })),
    shipping,
    shippingFee: baseShippingFee + ceoDeliveryFee,
    isCeoDelivery,
    ceoDeliveryFee,
    appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
    discountAmount,
    payment: {
      method: effectivePaymentMethod,
      codCharge,
    },
    subtotal: cartTotal,
    total: finalTotal,
  });

  const handleRazorpayCheckout = async (payload) => {
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded && typeof window.Razorpay === 'undefined') {
        throw new Error('Could not load Razorpay payment gateway. Please check your internet connection.');
      }

      const response = await createRazorpayOrder(payload);
      const rzpData = response?.data;

      if (!rzpData || !rzpData.razorpayOrderId) {
        throw new Error('Failed to create payment order. Please try again.');
      }

      const { razorpayOrderId, amount, currency, keyId, orderId, orderNumber: createdOrderNum } = rzpData;

      // Handle Mock/Test fallback if environment keys are missing
      if (razorpayOrderId.startsWith('rzp_mock_') || typeof window.Razorpay === 'undefined') {
        const verifyRes = await verifyRazorpayPayment({
          orderId,
          razorpayOrderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: `sig_mock_${Date.now()}`,
        });
        setOrderNumber(verifyRes?.data?.orderNumber || createdOrderNum || '');
        clearCart();
        sessionStorage.removeItem('checkoutDraft');
        setOrderPlaced(true);
        setLoading(false);
        return;
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: currency || 'INR',
        name: 'Anokhi Ada',
        description: `Order #${createdOrderNum}`,
        image: 'https://anokhiada.vercel.app/logo.png',
        order_id: razorpayOrderId,
        prefill: {
          name: `${shipping.firstName} ${shipping.lastName}`.trim(),
          email: shipping.email,
          contact: shipping.phone,
        },
        theme: {
          color: '#E11D48',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled. You can complete your order anytime.');
          },
        },
        handler: async (paymentResponse) => {
          try {
            setLoading(true);
            const verifyRes = await verifyRazorpayPayment({
              orderId,
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            });

            setOrderNumber(verifyRes?.data?.orderNumber || createdOrderNum || '');
            clearCart();
            sessionStorage.removeItem('checkoutDraft');
            setOrderPlaced(true);
          } catch (verifyErr) {
            setError(verifyErr.message || 'Payment verification failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (failResponse) => {
        setLoading(false);
        setError(failResponse?.error?.description || 'Payment failed. Please try another payment method.');
      });

      rzp.open();
    } catch (err) {
      setError(err.message || 'Failed to initialize Razorpay checkout.');
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    const form = e.currentTarget;
    if (!form.reportValidity()) {
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    const payload = buildOrderPayload();

    if (effectivePaymentMethod === 'razorpay') {
      await handleRazorpayCheckout(payload);
      return;
    }

    if (effectivePaymentMethod === 'online') {
      sessionStorage.setItem('checkoutDraft', JSON.stringify(payload));
      navigate('/pay/upi', {
        state: {
          amount: finalTotal.toFixed(2),
          note: `Anokhi Ada order payment - ${shipping.firstName || 'Customer'}`,
        },
      });
      return;
    }

    setLoading(true);

    try {
      sessionStorage.removeItem('checkoutDraft');
      const response = await postOrder(payload);
      setOrderNumber(response?.data?.orderNumber || '');
      clearCart();
      setOrderPlaced(true);
    } catch (submitError) {
      setError(
        submitError.message ||
        'Unable to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS
  if (orderPlaced) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Check size={36} />
          </div>

          <h2 className="text-3xl font-bold text-foreground font-display mb-2">
            Order Placed Successfully!
          </h2>

          <p className="text-secondary-text text-sm mb-4">
            Thank you for shopping with Anokhi Ada. Your payment and order details have been securely confirmed.
          </p>

          {orderNumber && (
            <div className="bg-surface-container rounded-2xl p-4 mb-6 border border-white/10">
              <p className="text-xs uppercase tracking-wider text-outline mb-1 font-semibold">Order Number</p>
              <p className="text-lg font-bold text-primary">{orderNumber}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products">
              <Button size="lg" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // EMPTY CART
  if (cart.length === 0) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary-text text-lg mb-4">
            Your cart is empty
          </p>

          <Link to="/products">
            <Button
              variant="outline"
              icon={ArrowLeft}
            >
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TITLE */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground font-display">
            Checkout
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 font-medium">
            <ShieldCheck size={14} />
            <span>Encrypted & Secure</span>
          </div>
        </div>

        {/* STEPS */}
        <div className="flex items-center gap-2 mb-8">
          {['Shipping', 'Payment', 'Review'].map((s, i) => (
            <div
              key={s}
              className="flex items-center gap-2 flex-1"
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > i + 1
                    ? 'bg-success text-white'
                    : step === i + 1
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-surface-muted text-outline'
                }`}
              >
                {step > i + 1 ? (
                  <Check size={14} />
                ) : (
                  i + 1
                )}
              </span>

              <span
                className={`text-sm font-medium hidden sm:inline ${
                  step === i + 1
                    ? 'text-foreground font-semibold'
                    : 'text-outline'
                }`}
              >
                {s}
              </span>

              {i < 2 && (
                <div
                  className={`flex-1 h-0.5 rounded ${
                    step > i + 1
                      ? 'bg-success'
                      : 'bg-surface-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handlePlaceOrder}>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-xs text-red-400 underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* SHIPPING STEP */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-container rounded-3xl p-6 sm:p-8 mb-6"
            >
              <h2 className="font-bold text-foreground text-lg mb-5">
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* FIRST NAME */}
                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-1.5">
                    First Name
                  </label>

                  <input
                    type="text"
                    required
                    value={shipping.firstName}
                    onChange={(e) =>
                      setShipping((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="Aniket"
                    className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                {/* LAST NAME */}
                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-1.5">
                    Last Name
                  </label>

                  <input
                    type="text"
                    required
                    value={shipping.lastName}
                    onChange={(e) =>
                      setShipping((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Singh"
                    className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-1.5">
                    Email Address
                  </label>

                  <input
                    type="email"
                    required
                    value={shipping.email}
                    onChange={(e) =>
                      setShipping((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-1.5">
                    Mobile Number
                  </label>

                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={shipping.phone}
                    onChange={(e) =>
                      setShipping((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                {/* ADDRESS */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-secondary-text mb-1.5">
                    Full Address
                  </label>

                  <textarea
                    required
                    rows="3"
                    value={shipping.address}
                    onChange={(e) =>
                      setShipping((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="House No, Street, Area"
                    className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                {/* APARTMENT */}
                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-1.5">
                    Apartment / Flat / Floor
                  </label>

                  <input
                    type="text"
                    value={shipping.apartment}
                    onChange={(e) =>
                      setShipping((prev) => ({
                        ...prev,
                        apartment: e.target.value,
                      }))
                    }
                    placeholder="Flat 201"
                    className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                {/* LANDMARK */}
                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-1.5">
                    Landmark
                  </label>

                  <input
                    type="text"
                    value={shipping.landmark}
                    onChange={(e) =>
                      setShipping((prev) => ({
                        ...prev,
                        landmark: e.target.value,
                      }))
                    }
                    placeholder="Near Temple"
                    className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                {/* CITY */}
                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-1.5">
                    City
                  </label>

                  <input
                    type="text"
                    required
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    placeholder="Patna"
                    className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                {/* STATE */}
                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-1.5">
                    State
                  </label>

                  <select
                    required
                    value={shipping.state}
                    onChange={(e) =>
                      setShipping((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground border border-surface-muted focus:outline-none focus:border-primary"
                  >
                    <option value="">Select State</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>

                {/* COUNTRY */}
                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-1.5">
                    Country
                  </label>

                  <input
                    type="text"
                    required
                    value={shipping.country}
                    onChange={(e) =>
                      setShipping((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    placeholder="India"
                    className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground"
                  />
                </div>

                {/* ZIP */}
                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-1.5">
                    PIN Code
                  </label>

                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    value={shipping.zipCode}
                    onChange={(e) =>
                      setShipping((prev) => ({
                        ...prev,
                        zipCode: e.target.value,
                      }))
                    }
                    placeholder="800001"
                    className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground"
                  />
                </div>
              </div>

              {/* VIP Delivery Option */}
              <CeoDeliveryOption className="mt-6" />

              <div className="mt-6">
                <Button type="submit" size="lg">
                  Continue to Payment
                </Button>
              </div>
            </motion.div>
          )}

          {/* PAYMENT STEP */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-container rounded-3xl p-6 sm:p-8 mb-6"
            >
              <h2 className="font-bold text-foreground text-lg mb-5">
                Select Payment Method
              </h2>

              <div className="space-y-4">

                {/* RAZORPAY (PRIMARY / RECOMMENDED) */}
                <label
                  className={`block border-2 rounded-2xl p-4.5 cursor-pointer transition-all ${
                    effectivePaymentMethod === 'razorpay'
                      ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                      : 'border-surface-muted hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={effectivePaymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="accent-primary"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <p className="font-semibold text-foreground">
                          Razorpay Secure Checkout
                        </p>
                        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Instant & Secure
                        </span>
                      </div>

                      <p className="text-xs text-secondary-text mt-1">
                        UPI, Credit/Debit Cards, NetBanking, Wallets & PayLater
                      </p>
                    </div>
                  </div>
                </label>

                {/* MANUAL UPI */}
                <label
                  className={`block border rounded-2xl p-4 cursor-pointer transition-all ${
                    effectivePaymentMethod === 'online'
                      ? 'border-primary bg-primary/5'
                      : 'border-surface-muted hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={effectivePaymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="accent-primary"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        <p className="font-medium text-foreground">
                          Manual UPI Transfer (QR Code)
                        </p>
                      </div>

                      <p className="text-xs text-outline mt-0.5">
                        Scan QR code and upload screenshot proof
                      </p>
                    </div>
                  </div>
                </label>

                {/* COD */}
                <label
                  className={`block border rounded-2xl p-4 transition-all ${
                    !isCodAvailable
                      ? 'opacity-60 bg-surface-muted/30 cursor-not-allowed border-surface-muted'
                      : effectivePaymentMethod === 'cod'
                      ? 'border-primary bg-primary/5 cursor-pointer'
                      : 'border-surface-muted cursor-pointer hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      disabled={!isCodAvailable}
                      checked={effectivePaymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-primary"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-amber-400" />
                        <p className="font-medium text-foreground">
                          Cash on Delivery
                        </p>
                        {!isCodAvailable && (
                          <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold uppercase">
                            Unavailable below ₹399
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-outline mt-0.5">
                        {isCodAvailable
                          ? 'Extra ₹100 COD charge applies'
                          : 'Add items worth ₹' + (399 - cartTotal) + ' more to unlock COD.'}
                      </p>
                    </div>

                    {isCodAvailable && (
                      <span className="text-xs font-semibold text-amber-400">
                        +₹100
                      </span>
                    )}
                  </div>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>

                <Button type="submit" size="lg">
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {/* REVIEW STEP */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-container rounded-3xl p-6 sm:p-8 mb-6"
            >
              <h2 className="font-bold text-foreground text-lg mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={item.images?.[0]}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.name}
                      </p>

                      <p className="text-xs text-outline">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-foreground">
                      {formatINR(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <CouponSelector className="mb-6" />

              <div className="border-t border-surface-muted pt-3 mb-6">

                <div className="flex justify-between mb-1">
                  <span className="text-secondary-text text-sm">
                    Subtotal
                  </span>

                  <span className="font-semibold text-foreground">
                    {formatINR(cartTotal)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between mb-1 text-emerald-600 dark:text-emerald-400">
                    <span className="text-sm font-medium">
                      Coupon Discount ({appliedCoupon?.code})
                    </span>

                    <span className="font-bold">
                      -{formatINR(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between mb-1">
                  <span className="text-secondary-text text-sm">
                    Shipping Charge
                  </span>

                  {shippingFee > 0 ? (
                    <span className="font-semibold text-foreground">
                      {formatINR(shippingFee)}
                    </span>
                  ) : (
                    <span className="text-success font-medium">
                      Free
                    </span>
                  )}
                </div>

                {isCeoDelivery && (
                  <div className="flex justify-between mb-1 text-amber-600 dark:text-amber-400">
                    <span className="text-sm font-semibold flex items-center gap-1">
                      👑 VIP Delivery by CEO
                    </span>

                    <span className="font-extrabold">
                      +{formatINR(5000)}
                    </span>
                  </div>
                )}

                {effectivePaymentMethod === 'cod' && (
                  <div className="flex justify-between mb-1">
                    <span className="text-secondary-text text-sm">
                      COD Charges
                    </span>

                    <span className="font-medium text-foreground">
                      {formatINR(100)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between mt-3 pt-2 border-t border-white/10">
                  <span className="font-bold text-lg text-foreground">
                    Total
                  </span>

                  <span className="font-bold text-2xl text-foreground">
                    {formatINR(finalTotal)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={loading}
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : effectivePaymentMethod === 'razorpay' ? (
                    `Pay ${formatINR(finalTotal)} with Razorpay`
                  ) : effectivePaymentMethod === 'online' ? (
                    'Proceed to Manual UPI'
                  ) : (
                    'Place Order (COD)'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
}
