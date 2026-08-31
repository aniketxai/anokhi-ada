import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { changeAdminPassword, fetchAdminSettings, updateAdminSettings } from '../api';

function SettingsSection({ title, description, icon: Icon, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="rounded-[28px] border border-white/8 bg-white/3 p-5 sm:p-6 shadow-soft"
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shrink-0">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-1 text-sm text-secondary-text">{description}</p>}
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
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-outline">{label}</span>
      <div className="relative">
        <input
          type={type === 'password' && !showPassword ? 'password' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-foreground"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-material ${
        enabled ? 'bg-primary' : 'bg-white/10'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-material ${
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

  // Password Modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
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

  const handleOpenPasswordModal = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setPasswordSuccess('');
    setIsPasswordModalOpen(true);
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

      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <CheckCircle size={18} className="shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <AlertCircle size={18} className="shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

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
            <h3 className="text-sm font-semibold mb-4">General Email Settings</h3>
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

          <div className="border-t border-white/8 pt-6">
            <h3 className="text-sm font-semibold mb-4">SMTP Configuration</h3>
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
              <span className="text-sm text-secondary-text">Use secure connection (TLS/SSL)</span>
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
          <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
            <div>
              <p className="font-medium text-foreground">Order Notifications</p>
              <p className="text-xs text-secondary-text mt-1">Get alerted when new orders arrive</p>
            </div>
            <ToggleSwitch
              enabled={settings.orderNotifications}
              onChange={(value) => handleSettingChange('orderNotifications', value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
            <div>
              <p className="font-medium text-foreground">Quote Request Emails</p>
              <p className="text-xs text-secondary-text mt-1">Send confirmations for quote requests</p>
            </div>
            <ToggleSwitch
              enabled={settings.quoteEmails}
              onChange={(value) => handleSettingChange('quoteEmails', value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
            <div>
              <p className="font-medium text-foreground">Inventory Alerts</p>
              <p className="text-xs text-secondary-text mt-1">Alert when products are low in stock</p>
            </div>
            <ToggleSwitch
              enabled={settings.inventoryAlerts}
              onChange={(value) => handleSettingChange('inventoryAlerts', value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
            <div>
              <p className="font-medium text-foreground">Auto Status Updates</p>
              <p className="text-xs text-secondary-text mt-1">Automatically send order status update emails</p>
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
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3 mb-4">
              <div>
                <p className="font-medium text-foreground">Payment Gateway</p>
                <p className="text-xs text-secondary-text mt-1">Enable online payments (Razorpay, Stripe, etc)</p>
              </div>
              <ToggleSwitch
                enabled={settings.enablePaymentGateway}
                onChange={(value) => handleSettingChange('enablePaymentGateway', value)}
              />
            </div>
          </div>

          <div className="border-t border-white/8 pt-6">
            <h3 className="text-sm font-semibold mb-4">Shipping Settings</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingField
                label="Default Shipping Cost (₹)"
                type="number"
                value={settings.defaultShippingCost}
                onChange={(e) => handleSettingChange('defaultShippingCost', e.target.value)}
              />
            </div>
            <p className="text-xs text-secondary-text mt-4">Additional shipping providers can be configured through integrations</p>
          </div>
        </div>
      </SettingsSection>

      {/* Security */}
      <SettingsSection
        title="Security & Access"
        description="Manage security settings and access control"
        icon={Lock}
      >
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-secondary-text mt-1">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button className="text-sm font-semibold text-primary hover:text-primary-light">
              Enable 2FA
            </button>
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-xs text-secondary-text mt-1">Update your admin account password</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenPasswordModal}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-primary-light transition-material"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/8 bg-white/5 px-6 py-3 text-sm font-semibold text-foreground hover:bg-white/10 transition-material"
        >
          <Settings2 size={16} />
          Reset to Defaults
        </button>
        <button
          onClick={handleSaveSettings}
          disabled={saving || loadingSettings}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-light transition-material disabled:opacity-60"
        >
          {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900 p-6 shadow-2xl space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Change Password</h3>
                    <p className="text-xs text-secondary-text">Update your admin account credentials</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="rounded-full p-2 text-secondary-text hover:bg-white/10 hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Alert Messages */}
              {passwordError && (
                <div className="flex items-center gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <AlertCircle size={16} className="shrink-0 text-rose-400" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <CheckCircle size={16} className="shrink-0 text-emerald-400" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-outline font-medium">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-foreground"
                    >
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-outline font-medium">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password (min. 6 characters)"
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-foreground"
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-outline font-medium">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-foreground"
                    >
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-soft hover:bg-primary-light disabled:opacity-60"
                  >
                    {passwordSaving ? <Loader size={14} className="animate-spin" /> : null}
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
