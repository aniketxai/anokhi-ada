import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings2,
  Bell,
  Lock,
  Mail,
  Globe,
  Truck,
  DollarSign,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  Loader,
} from 'lucide-react';

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
          type={type === 'password' && !showPassword ? 'password' : 'text'}
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
    storeName: 'SAMBX',
    storeEmail: 'aniketxai@gmail.com',
    storeCurrency: 'INR',
    adminEmail: 'aniketxai@gmail.com',
    senderName: 'SAMBX Forge',
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
  const [successMessage, setSuccessMessage] = useState('');

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setSuccessMessage('');
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSuccessMessage('Settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successMessage}
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
            <label className="mt-4 flex items-center gap-3">
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
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Lock size={18} />
              </div>
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-xs text-secondary-text mt-1">Update your admin account password</p>
              </div>
            </div>
            <button className="text-sm font-semibold text-primary hover:text-primary-light">
              Change Password
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/8 bg-white/5 px-6 py-3 text-sm font-semibold text-foreground hover:bg-white/10 transition-material">
          <Settings2 size={16} />
          Reset to Defaults
        </button>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary-light transition-material disabled:opacity-60"
        >
          {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
