import { Counter } from '../models/Counter.js';
import { Order } from '../models/Order.js';

/**
 * Generates an atomic sequential order / invoice number formatted as AA-SALES-22.
 * Increments sequentially and persists atomically in MongoDB.
 *
 * @param {string} prefix - The invoice prefix, defaults to 'AA-SALES-'
 * @returns {Promise<string>} Sequential invoice number e.g. "AA-SALES-22"
 */
export async function getNextOrderNumber(prefix = 'AA-SALES-') {
  try {
    let counter = await Counter.findById(prefix);

    if (!counter) {
      // Check existing orders count so sequential sequence continues naturally
      const count = await Order.countDocuments();
      counter = await Counter.create({ _id: prefix, seq: count });
    }

    const updated = await Counter.findByIdAndUpdate(
      prefix,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    return `${prefix}${updated.seq}`;
  } catch (error) {
    console.error('Error generating sequence invoice number, using timestamp fallback:', error);
    return `${prefix}${Date.now().toString().slice(-6)}`;
  }
}
