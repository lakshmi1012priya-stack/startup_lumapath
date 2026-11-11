'use client';
import { useRef } from 'react';

interface Submission {
  transactionId: string;
  name: string;
  address: string;
  phone: string;
  amount: number;
  allocation: string;
  paymentMode: string;
  timestamp: string;
  event: string;
}

interface Props {
  submission: Submission;
  onClose: () => void;
}

export default function ReceiptModal({ submission, onClose }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(receiptRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `receipt-${submission.transactionId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-600 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 to-violet-900 p-5 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full px-3 py-1 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-300 text-xs font-semibold">PAYMENT VERIFIED</span>
          </div>
          <h2 className="text-white font-bold text-xl">Transaction Receipt</h2>
          <p className="text-violet-200 text-sm mt-1">Digital Moi Express</p>
        </div>

        {/* Receipt content */}
        <div ref={receiptRef} className="bg-slate-800 p-5">
          <div className="text-center mb-4">
            <span className="font-mono text-2xl font-bold text-emerald-400">{submission.transactionId}</span>
          </div>
          <div className="space-y-3">
            {([
              ['Event', submission.event],
              ['Guest Name', submission.name],
              ['Address', submission.address],
              ['Phone', submission.phone],
              ['Moi Amount', `₹${submission.amount.toLocaleString('en-IN')}`],
              ['Gift For', submission.allocation],
              ['Payment Mode', submission.paymentMode],
              ['Date & Time', new Date(submission.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm border-b border-slate-700 pb-2">
                <span className="text-slate-400">{label}</span>
                <span className="text-white font-medium text-right max-w-[55%] break-words">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
            <p className="text-emerald-400 text-xs font-semibold">✓ Digitally verified by LumaPath — Digital Moi Express</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 flex gap-3 border-t border-slate-700">
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
          >
            ⬇ Download Receipt
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
