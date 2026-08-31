import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings2,
  Bell,
  Lock,
  Mail,
  Globe,
  DollarSign,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  Loader,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { changeAdminPassword, fetchAdminSettings, updateAdminSettings } from '../api';

function SettingsSection({ title, description, icon: Icon, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="rounded-[24px] border border-border bg-card p-5 sm:p-6 shadow-sm"
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
          <Icon size={22} />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function SettingField({ label, type = 'text', value, onChange, placeholder = '' }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-outline">{label}</span>
      <div className="relative">
        <input
          type={type === 'password' && !showPassword ? 'password' : type}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </label>
  );
}

function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
        enabled ? 'bg-primary' : 'bg-secondary'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: 'Anokhi Ada',
    storeEmail: 'anokhiada9@gmail.com',
    storeCurrency: 'INR',
    adminEmail: 'anokhiada9@gmail.com',
    senderName: 'Anokhi Ada',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true,
    orderNotifications: true,
    quoteEmails: true,
    inventoryAlerts: true,
    autoStatusUpdates: true,
    enablePaymentGateway: true,
    defaultShippingCost: '50',
    taxRate: '18',
  });

  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Password inline form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoadingSettings(true);
        const data = await fetchAdminSettings();
        if (data && Object.keys(data).length > 0) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn('Could not load settings from server, using defaults:', err);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');

      await updateAdminSettings(settings);

      setSuccessMessage('Settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setErrorMessage(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      storeName: 'Anokhi Ada',
      storeEmail: 'anokhiada9@gmail.com',
      storeCurrency: 'INR',
      adminEmail: 'anokhiada9@gmail.com',
      senderName: 'Anokhi Ada',
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUser: '',
      smtpPassword: '',
      smtpSecure: true,
      orderNotifications: true,
      quoteEmails: true,
      inventoryAlerts: true,
      autoStatusUpdates: true,
      enablePaymentGateway: true,
      defaultShippingCost: '50',
      taxRate: '18',
    });
    setSuccessMessage('Settings reset to defaults (click Save Settings to persist)');
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (!passwordForm.newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    try {
      setPasswordSaving(true);
      const res = await changeAdminPassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess(res.message || 'Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner Notifications */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50 p-4 text-sm font-medium text-emerald-900 shadow-xs">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-50 p-4 text-sm font-medium text-rose-900 shadow-xs">
          <AlertCircle size={20} className="shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Change Password Section (High Visibility) */}
      <SettingsSection
        title="Change Admin Password"
        description="Update your admin account login password"
        icon={KeyRound}
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          {passwordSuccess && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50 p-3.5 text-sm font-medium text-emerald-800">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-50 p-3.5 text-sm font-medium text-rose-800">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Current Password */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-outline">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-outline">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="New password (min 6 chars)"
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-outline">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
            >
              {passwordSaving ? <Loader size={16} className="animate-spin" /> : <Lock size={16} />}
              {passwordSaving ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </SettingsSection>

      {/* Store Information */}
      <SettingsSection
        title="Store Information"
        description="Update your basic store details"
        icon={Globe}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingField
            label="Store Name"
            value={settings.storeName}
            onChange={(e) => handleSettingChange('storeName', e.target.value)}
          />
          <SettingField
            label="Store Email"
            type="email"
            value={settings.storeEmail}
            onChange={(e) => handleSettingChange('storeEmail', e.target.value)}
          />
          <SettingField
            label="Default Currency"
            value={settings.storeCurrency}
            onChange={(e) => handleSettingChange('storeCurrency', e.target.value)}
          />
          <SettingField
            label="Tax Rate (%)"
            type="number"
            value={settings.taxRate}
            onChange={(e) => handleSettingChange('taxRate', e.target.value)}
          />
        </div>
      </SettingsSection>

      {/* Email Configuration */}
      <SettingsSection
        title="Email Configuration"
        description="Configure email notifications and SMTP settings"
        icon={Mail}
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">General Email Settings</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingField
                label="Admin Email"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
              />
              <SettingField
                label="Sender Name"
                value={settings.senderName}
                onChange={(e) => handleSettingChange('senderName', e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-bold text-foreground mb-4">SMTP Configuration</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingField
                label="SMTP Host"
                value={settings.smtpHost}
                onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
              />
              <SettingField
                label="SMTP Port"
                type="number"
                value={settings.smtpPort}
                onChange={(e) => handleSettingChange('smtpPort', e.target.value)}
              />
              <SettingField
                label="SMTP Username"
                value={settings.smtpUser}
                onChange={(e) => handleSettingChange('smtpUser', e.target.value)}
              />
              <SettingField
                label="SMTP Password"
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
              />
            </div>
            <label className="mt-4 flex items-center gap-3 cursor-pointer">
              <ToggleSwitch
                enabled={settings.smtpSecure}
                onChange={(value) => handleSettingChange('smtpSecure', value)}
              />
              <span className="text-sm font-medium text-muted-foreground">Use secure connection (TLS/SSL)</span>
            </label>
          </div>
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection
        title="Notifications"
        description="Control what notifications you receive"
        icon={Bell}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3.5 shadow-xs">
            <div>
              <p className="font-semibold text-foreground">Order Notifications</p>
              <p className="text-xs text-muted-foreground mt-0.5">Get alerted when new orders arrive</p>
            </div>
            <ToggleSwitch
              enabled={settings.orderNotifications}
              onChange={(value) => handleSettingChange('orderNotifications', value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3.5 shadow-xs">
            <div>
              <p className="font-semibold text-foreground">Quote Request Emails</p>
              <p className="text-xs text-muted-foreground mt-0.5">Send confirmations for quote requests</p>
            </div>
            <ToggleSwitch
              enabled={settings.quoteEmails}
              onChange={(value) => handleSettingChange('quoteEmails', value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3.5 shadow-xs">
            <div>
              <p className="font-semibold text-foreground">Inventory Alerts</p>
              <p className="text-xs text-muted-foreground mt-0.5">Alert when products are low in stock</p>
            </div>
            <ToggleSwitch
              enabled={settings.inventoryAlerts}
              onChange={(value) => handleSettingChange('inventoryAlerts', value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3.5 shadow-xs">
            <div>
              <p className="font-semibold text-foreground">Auto Status Updates</p>
              <p className="text-xs text-muted-foreground mt-0.5">Automatically send order status update emails</p>
            </div>
            <ToggleSwitch
              enabled={settings.autoStatusUpdates}
              onChange={(value) => handleSettingChange('autoStatusUpdates', value)}
            />
          </div>
        </div>
      </SettingsSection>

      {/* Payment & Shipping */}
      <SettingsSection
        title="Payment & Shipping"
        description="Configure payment gateways and shipping options"
        icon={DollarSign}
      >
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3.5 mb-4 shadow-xs">
              <div>
                <p className="font-semibold text-foreground">Payment Gateway</p>
                <p className="text-xs text-muted-foreground mt-0.5">Enable online payments (Razorpay, Stripe, etc)</p>
              </div>
              <ToggleSwitch
                enabled={settings.enablePaymentGateway}
                onChange={(value) => handleSettingChange('enablePaymentGateway', value)}
              />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-bold text-foreground mb-4">Shipping Settings</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingField
                label="Default Shipping Cost (₹)"
                type="number"
                value={settings.defaultShippingCost}
                onChange={(e) => handleSettingChange('defaultShippingCost', e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-4">Additional shipping providers can be configured through integrations</p>
          </div>
        </div>
      </SettingsSection>

      {/* Security */}
      <SettingsSection
        title="Security & Access"
        description="Manage additional security settings and access control"
        icon={ShieldCheck}
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button type="button" className="text-sm font-bold text-primary hover:underline cursor-pointer">
              Enable 2FA
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-4">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
        >
          <Settings2 size={16} />
          Reset to Defaults
        </button>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving || loadingSettings}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
