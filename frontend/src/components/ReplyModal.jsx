import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import Button from './Button';

export default function ReplyModal({ isOpen, onClose, onSend, initialSubject = '', initialBody = '', loading = false }) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);

  useEffect(() => {
    setSubject(initialSubject);
    setBody(initialBody);
  }, [initialSubject, initialBody, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-surface-container p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Reply to Enquiry</h3>
          <button onClick={onClose} className="text-secondary-text hover:text-foreground">
            <X />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 rounded-md bg-background border border-white/6" />
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary-text mb-1">Message</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="w-full px-3 py-2 rounded-md bg-background border border-white/6 resize-none" />
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-full bg-white/5 text-secondary-text hover:bg-white/10">Cancel</button>
            <Button icon={Send} size="md" onClick={() => onSend({ subject, body })} disabled={loading || !subject || !body}>
              {loading ? 'Sending...' : 'Send Reply'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
