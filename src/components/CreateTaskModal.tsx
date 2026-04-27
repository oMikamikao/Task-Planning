import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import type { TaskType } from '@/types/task';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, type: TaskType, dueDate?: number) => void;
}

function getDefaultDateTimeLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const TYPE_OPTIONS: { value: TaskType; label: string; color: string; desc: string }[] = [
  { value: 'daily', label: '每日', color: '#F59E0B', desc: '具体到某一天' },
  { value: 'weekly', label: '每周', color: '#8B5CF6', desc: '本周内完成' },
  { value: 'monthly', label: '每月', color: '#06B6D4', desc: '本月内完成' },
];

export default function CreateTaskModal({ isOpen, onClose, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<TaskType>('daily');
  const [dateTime, setDateTime] = useState(getDefaultDateTimeLocal);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setSelectedType('daily');
      setDateTime(getDefaultDateTimeLocal());
      setIsSubmitting(false);

      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(modalRef.current, { x: 50, y: 50, opacity: 0, scale: 0.9 }, { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.7)', delay: 0.1 });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(modalRef.current, { x: 50, y: 50, opacity: 0, scale: 0.9, duration: 0.3, ease: 'power2.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, delay: 0.1, onComplete: onClose });
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    let dueDate: number | undefined;
    if (selectedType === 'daily' && dateTime) {
      dueDate = new Date(dateTime).getTime();
    }
    // weekly/monthly will use default dueDate from hook

    setIsSubmitting(true);
    gsap.to(modalRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        onSubmit(title.trim(), selectedType, dueDate);
        handleClose();
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    else if (e.key === 'Escape') handleClose();
  };

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(30, 41, 59, 0.4)' }} onClick={handleClose}>
      <div ref={modalRef} className="brutalist-modal w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>新建任务</h2>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1E293B" strokeWidth="2"><path d="M1 1L15 15M15 1L1 15" /></svg>
          </button>
        </div>

        {/* Type selector */}
        <div className="flex gap-2 mb-4">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedType(opt.value)}
              className={`flex-1 py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedType === opt.value ? 'ring-2 ring-offset-2' : 'opacity-50 hover:opacity-100'}`}
              style={{ background: selectedType === opt.value ? opt.color : '#E8E5E0', color: selectedType === opt.value ? '#FFFFFF' : '#1E293B', fontFamily: "'Inter', sans-serif", '--tw-ring-color': opt.color } as React.CSSProperties}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-light mb-4 -mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
          {TYPE_OPTIONS.find(o => o.value === selectedType)?.desc}
        </p>

        {/* Title input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>任务内容 *</label>
          <input
            ref={inputRef}
            type="text" value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入任务..."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#1E293B] focus:outline-none transition-colors"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', background: '#FAFAF8' }}
          />
        </div>

        {/* Date/time - only for daily */}
        {selectedType === 'daily' && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: "'Inter', sans-serif", color: '#1E293B' }}>到期时间（可选，默认今天 23:59）</label>
            <input
              type="datetime-local" value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#1E293B] focus:outline-none transition-colors"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', background: '#FAFAF8' }}
            />
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || isSubmitting}
          className="brutalist-button w-full py-3 text-lg"
          style={{ opacity: title.trim() ? 1 : 0.5, cursor: title.trim() ? 'pointer' : 'not-allowed', background: isSubmitting ? '#10B981' : '#1E293B' }}
        >
          {isSubmitting ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mx-auto"><path d="M3 10L8 15L17 5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> : '创建任务'}
        </button>
      </div>
    </div>
  );
}
