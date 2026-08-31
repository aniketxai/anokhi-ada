import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'admin_settings', unique: true },
    storeName: { type: String, default: 'Anokhi Ada' },
    storeEmail: { type: String, default: 'anokhiada9@gmail.com' },
    storeCurrency: { type: String, default: 'INR' },
    taxRate: { type: String, default: '18' },
    adminEmail: { type: String, default: 'anokhiada9@gmail.com' },
    senderName: { type: String, default: 'Anokhi Ada' },
    smtpHost: { type: String, default: 'smtp.gmail.com' },
    smtpPort: { type: String, default: '587' },
    smtpUser: { type: String, default: '' },
    smtpPassword: { type: String, default: '' },
    smtpSecure: { type: Boolean, default: true },
    orderNotifications: { type: Boolean, default: true },
    quoteEmails: { type: Boolean, default: true },
    inventoryAlerts: { type: Boolean, default: true },
    autoStatusUpdates: { type: Boolean, default: true },
    enablePaymentGateway: { type: Boolean, default: true },
    defaultShippingCost: { type: String, default: '50' },
  },
  { timestamps: true }
);

export const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);
