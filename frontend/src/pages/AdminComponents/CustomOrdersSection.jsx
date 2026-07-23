import { motion } from 'framer-motion';
import {
  Eye,
  X,
  Loader,
  Reply,
  FileUp,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { SectionCard, StatusPill } from './Helpers';

export function CustomOrdersSection({
  customOrders = [],
  customOrderFilter = 'All',
  setCustomOrderFilter,
  handleViewCustomOrder,
  handleReplyCustomOrder,
  respondingToOrderId,
  replyText,
  setReplyText,
  sendingReply,
}) {
  const statusOptions = ['All', 'new', 'in-review', 'quoted', 'accepted', 'completed', 'rejected'];
  
  const filteredOrders = 
    customOrderFilter === 'All'
      ? customOrders
      : customOrders.filter((order) => order.status === customOrderFilter);

  return (
    <SectionCard
      title="Custom Orders"
      description="Manage custom order requests and send quotes to customers."
      action={
        <div className="flex items-center gap-2 overflow-x-auto">
          {statusOptions.map((option) => (
            <button
              key={option}
              onClick={() => setCustomOrderFilter(option)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-material ${
                customOrderFilter === option
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-secondary-text hover:bg-white/10'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center">
            <FileUp className="w-12 h-12 text-secondary-text/40 mx-auto mb-3" />
            <p className="text-secondary-text text-sm">No custom orders yet</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id || order.id} className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="font-semibold text-foreground text-sm">{order.name || 'Anonymous'}</p>
                    <StatusPill status={order.status} />
                  </div>
                  <p className="text-xs text-secondary-text mb-2">
                    {order.email} • {order.phone}
                  </p>
                  <p className="text-xs text-secondary-text mb-2 line-clamp-2">
                    {order.description}
                  </p>
                  
                  {/* File Info */}
                  {order.fileUrl && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-primary">
                      <FileUp className="w-3 h-3" />
                      <a href={order.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        View file
                      </a>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    {order.quantity && (
                      <div>
                        <span className="text-secondary-text">Qty:</span> {order.quantity}
                      </div>
                    )}
                    {order.budget && (
                      <div>
                        <span className="text-secondary-text">Budget:</span> {order.budget}
                      </div>
                    )}
                    {order.deadline && (
                      <div className="col-span-2 flex items-center gap-1 text-secondary-text">
                        <Clock className="w-3 h-3" />
                        By: {new Date(order.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 md:pt-0 md:flex-col md:gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewCustomOrder(order)}
                    className="flex-1 md:flex-none px-3 py-2 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReplyCustomOrder(order)}
                    className="flex-1 md:flex-none px-3 py-2 rounded-lg bg-secondary/15 hover:bg-secondary/25 text-secondary text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Reply
                  </motion.button>
                </div>
              </div>

              {/* Reply Modal */}
              {respondingToOrderId === (order._id || order.id) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-white/8 space-y-3"
                >
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Send a quote or message to the customer..."
                    rows="3"
                    className="w-full px-3 py-2 rounded-lg bg-surface/60 border border-outline/20 focus:border-primary focus:bg-surface focus:outline-none text-xs text-foreground placeholder:text-secondary-text resize-none"
                  />
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleReplyCustomOrder(null)}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-secondary-text text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={sendingReply || !replyText.trim()}
                      onClick={() => handleReplyCustomOrder(order, replyText)}
                      className="flex-1 px-3 py-2 rounded-lg bg-primary hover:bg-primary-light text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {sendingReply ? (
                        <>
                          <Loader className="w-3 h-3 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Reply className="w-3 h-3" />
                          Send
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}

export default CustomOrdersSection;
