import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import FluidBackground from '@/components/FluidBackground';
import FloatingButton from '@/components/FloatingButton';
import { useTaskManager } from '@/hooks/useTaskManager';
import type { EventItem } from '@/types/task';

function formatEventDate(date: number): string {
  return new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' });
}

function formatEventTime(date: number): string {
  return new Date(date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

interface EventCardProps {
  event: EventItem;
  onDelete: (id: string) => void;
  isPast?: boolean;
}

function EventCard({ event, onDelete, isPast = false }: EventCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="group glass-panel p-4 cursor-pointer"
      style={{ opacity: isPast ? 0.7 : 1 }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgba(255, 255, 255, 0.6)';
        el.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = '';
        el.style.transform = 'translateX(0)';
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-semibold text-dark ${isPast ? 'line-through text-muted-light' : ''}`} style={{ fontFamily: "'Inter', sans-serif" }}>
            {event.name}
          </h3>
          <p className="text-sm text-muted-light mt-1 line-clamp-2">{event.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: isPast ? '#94A3B822' : '#F59E0B22', color: isPast ? '#94A3B8' : '#F59E0B', fontFamily: "'JetBrains Mono', monospace" }}>
              {formatEventDate(event.date)}
            </span>
            <span className="text-xs text-muted-light" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatEventTime(event.date)}
              {event.endDate && ` - ${formatEventTime(event.endDate)}`}
            </span>
          </div>
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-light hover:text-red-400 p-1 rounded flex-shrink-0"
          onClick={() => onDelete(event.id)}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L13 13M13 1L1 13" /></svg>
        </button>
      </div>
    </div>
  );
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, content: string, date: number, endDate?: number) => void;
}

function CreateEventModal({ isOpen, onClose, onSubmit }: CreateEventModalProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours() + 1).padStart(2, '0');
    const min = '00';
    return `${y}-${m}-${d}T${h}:${min}`;
  });
  const [endDate, setEndDate] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(''); setContent(''); setEndDate('');
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(modalRef.current, { x: 50, y: 50, opacity: 0, scale: 0.9 }, { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.7)', delay: 0.1 });
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(modalRef.current, { x: 50, y: 50, opacity: 0, scale: 0.9, duration: 0.3, ease: 'power2.in' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, delay: 0.1, onComplete: onClose });
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const eventDate = new Date(date).getTime();
    const eventEndDate = endDate ? new Date(endDate).getTime() : undefined;
    onSubmit(name.trim(), content.trim(), eventDate, eventEndDate);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(30, 41, 59, 0.4)' }} onClick={handleClose}>
      <div ref={modalRef} className="brutalist-modal w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>新建事件</h2>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1E293B" strokeWidth="2"><path d="M1 1L15 15M15 1L1 15" /></svg>
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: '#1E293B' }}>事件名称 *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：项目周会" className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#1E293B] focus:outline-none" style={{ fontSize: '14px', background: '#FAFAF8' }} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: '#1E293B' }}>事件内容</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="描述事件详情..." rows={3} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#1E293B] focus:outline-none resize-none" style={{ fontSize: '14px', background: '#FAFAF8' }} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: '#1E293B' }}>开始时间 *</label>
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#1E293B] focus:outline-none" style={{ fontSize: '14px', background: '#FAFAF8' }} />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: '#1E293B' }}>结束时间（可选）</label>
          <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#1E293B] focus:outline-none" style={{ fontSize: '14px', background: '#FAFAF8' }} />
        </div>
        <button onClick={handleSubmit} disabled={!name.trim()} className="brutalist-button w-full py-3 text-lg" style={{ opacity: name.trim() ? 1 : 0.5, cursor: name.trim() ? 'pointer' : 'not-allowed' }}>
          创建事件
        </button>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addEvent, deleteEvent, getUpcomingEvents, getPastEvents } = useTaskManager();

  const upcoming = getUpcomingEvents();
  const past = getPastEvents();

  return (
    <div className="h-screen overflow-hidden relative">
      <FluidBackground />
      <div className="relative z-10 h-full max-w-5xl mx-auto px-4 py-5 md:px-6 md:py-6 flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <h2 className="text-2xl font-bold text-dark" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Events</h2>
          <p className="text-sm text-muted-light mt-1">管理你的日程与事件</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 space-y-4 pb-24">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-light uppercase tracking-wider mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>即将到来</h3>
              <div className="space-y-3">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} onDelete={deleteEvent} />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-light uppercase tracking-wider mb-3 mt-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>已结束</h3>
              <div className="space-y-3">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} onDelete={deleteEvent} isPast={true} />
                ))}
              </div>
            </div>
          )}

          {upcoming.length === 0 && past.length === 0 && (
            <div className="text-center py-16 text-muted-light text-sm">暂无事件，点击下方按钮创建</div>
          )}
        </div>
      </div>

      <FloatingButton onClick={() => setIsModalOpen(true)} />
      <CreateEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={addEvent} />
    </div>
  );
}
