import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, AlertCircle } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import BlurBlob from '../components/BlurBlob';
import Button from '../components/Button';
import { useAuth } from '../context/useAuth';
import { useApp } from '../context/useApp';

export default function SignUp() {
  const { register, loading } = useAuth();
  const { notify } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await register(form);
    if (result.success) {
      notify({ title: 'Welcome!', message: 'Your account has been created.', type: 'success' });
      navigate('/');
    } else {
      setError(result.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <BlurBlob className="w-[18rem] h-[18rem] sm:w-[25rem] sm:h-[25rem] top-20 right-6 bg-secondary-container" />

      <div className="max-w-md mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeading label="Join Us" title="Create Your Account" description="Sign up to track orders and check out faster." />

        <div className="bg-surface-container rounded-3xl p-6 sm:p-8 border border-border">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl bg-red-500/10 text-red-500 px-4 py-3 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field icon={User} name="name" label="Full name" value={form.name} onChange={handleChange} required />
            <Field icon={Mail} name="email" type="email" label="Email address" value={form.email} onChange={handleChange} required />
            <Field icon={Phone} name="phone" type="tel" label="Phone number (optional)" value={form.phone} onChange={handleChange} />
            <Field icon={Lock} name="password" type="password" label="Password (min 6 characters)" value={form.password} onChange={handleChange} required minLength={6} />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground/70">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
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
