import mongoose from 'mongoose';

const statusEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    statusDescription: { type: String, default: '' },
    location: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    raw: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const shipmentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    orderNumber: { type: String, required: true, index: true },

    courier: { type: String, default: 'Delhivery' },
    waybill: { type: String, index: true, default: '' },
    referenceNumber: { type: String, index: true, default: '' },
    trackingUrl: { type: String, default: '' },
    currentLocation: { type: String, default: '' },

    securityKey: { type: String, default: '' },
    labelUrl: { type: String, default: '' },

    shipmentType: { type: String, enum: ['F', 'R'], default: 'F' },
    payMode: { type: String, enum: ['C', 'P'], default: 'P' },

    pickupPincode: { type: String, default: '' },
    deliveryPincode: { type: String, default: '' },

    weightGrams: { type: Number, default: 500 },
    dimensionsCm: {
      length: { type: Number, default: 10 },
      width: { type: Number, default: 10 },
      height: { type: Number, default: 10 },
    },

    status: {
      type: String,
      enum: [
        'created',
        'pickup_scheduled',
        'picked_up',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'ndr',
        'rto',
        'cancelled',
        'failed',
      ],
      default: 'created',
    },
    statusDescription: { type: String, default: 'Shipment created' },
    statusHistory: { type: [statusEventSchema], default: [] },

    estimatedDeliveryDate: { type: Date },
    deliveredAt: { type: Date },

    lastSyncedAt: { type: Date },
    createRequestPayload: { type: mongoose.Schema.Types.Mixed },
    createResponsePayload: { type: mongoose.Schema.Types.Mixed },

    cancelled: { type: Boolean, default: false },
    cancelReason: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Shipment = mongoose.model('Shipment', shipmentSchema);
