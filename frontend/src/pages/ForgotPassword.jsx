import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import BlurBlob from '../components/BlurBlob';
import Button from '../components/Button';
import api from '../api';

const STEPS = { EMAIL: 1, OTP: 2, RESET: 3, DONE: 4 };

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.requestPasswordResetOtp(email);
      setInfo(res.message || 'A verification code has been sent to your email.');
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.verifyPasswordResetOtp({ email, otp });
      setResetToken(res.resetToken);
      setInfo('');
      setStep(STEPS.RESET);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.resetCustomerPassword({ email, resetToken, newPassword });
      setStep(STEPS.DONE);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <BlurBlob className="w-[18rem] h-[18rem] sm:w-[25rem] sm:h-[25rem] top-20 right-6 bg-secondary-container" />

      <div className="max-w-md mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeading
          label="Account Recovery"
          title="Reset Your Password"
          description="We'll email you a one-time code to verify it's really you."
        />

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-1.5 rounded-full transition-all ${
                step >= n ? 'w-8 bg-primary' : 'w-4 bg-surface-muted'
              }`}
            />
          ))}
        </div>

        <div className="bg-surface-container rounded-3xl p-6 sm:p-8 border border-border">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl bg-red-500/10 text-red-500 px-4 py-3 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {info && step === STEPS.OTP && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl bg-green-500/10 text-green-600 px-4 py-3 text-sm">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>{info}</span>
            </div>
          )}

          {step === STEPS.EMAIL && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Field icon={Mail} name="email" type="email" label="Your account email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending code…' : 'Send Verification Code'}
              </Button>
            </form>
          )}

          {step === STEPS.OTP && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Field
                icon={KeyRound}
                name="otp"
                label="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                inputMode="numeric"
                required
              />
              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying…' : 'Verify Code'}
              </Button>
              <button
                type="button"
                onClick={handleSendOtp}
                className="w-full text-center text-xs text-primary hover:underline"
              >
                Didn&apos;t get a code? Resend
              </button>
            </form>
          )}

          {step === STEPS.RESET && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Field icon={Lock} name="newPassword" type="password" label="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
              <Field icon={Lock} name="confirmPassword" type="password" label="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving…' : 'Reset Password'}
              </Button>
            </form>
          )}

          {step === STEPS.DONE && (
            <div className="text-center py-4">
              <CheckCircle2 size={40} className="mx-auto text-green-500 mb-3" />
              <p className="font-medium">Password reset successfully!</p>
              <p className="text-sm text-foreground/60 mt-1">Redirecting you to log in…</p>
            </div>
          )}

          {step !== STEPS.DONE && (
            <p className="mt-6 text-center text-sm text-foreground/70">
              Remembered your password?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Log in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, ...props }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-foreground/80 mb-1.5">{label}</span>
      <span className="relative flex items-center">
        <Icon size={16} className="absolute left-4 text-foreground/40" />
        <input
          {...props}
          className="w-full rounded-full bg-surface-muted border border-border pl-11 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-material"
        />
      </span>
    </label>
  );
}
