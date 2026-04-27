import { useRef } from 'react';
import { gsap } from 'gsap';
import type { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
  showType?: boolean;
}

let completeAudio: HTMLAudioElement | null = null;
function getCompleteAudio(): HTMLAudioElement {
  if (!completeAudio) {
    completeAudio = new Audio('/sounds/complete.mp3');
    completeAudio.volume = 0.4;
  }
  return completeAudio;
}
function playCompleteSound() {
  const audio = getCompleteAudio();
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

const TYPE_COLORS: Record<string, string> = {
  daily: '#F59E0B',
  weekly: '#8B5CF6',
  monthly: '#06B6D4',
};

const TYPE_LABELS: Record<string, string> = {
  daily: '今日',
  weekly: '本周',
  monthly: '本月',
};

export default function TaskItem({ task, onToggle, onDelete, compact = false, showType = true }: TaskItemProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    onToggle(task.id);
    if (!task.completed) playCompleteSound();
    if (rowRef.current) {
      if (!task.completed) {
        gsap.to(rowRef.current, { scale: 0.98, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 1 });
      } else {
        gsap.fromTo(rowRef.current, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' });
      }
    }
  };

  const dueDateStr = new Date(task.dueDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  const dueTimeStr = new Date(task.dueDate).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const isOverdue = task.dueDate < Date.now() && !task.completed;

  return (
    <div
      ref={rowRef}
      className={`group flex items-center gap-3 py-3 px-2 rounded-xl transition-all duration-300 cursor-pointer ${compact ? 'py-2' : 'py-3'}`}
      style={{ background: 'transparent' }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgba(255, 255, 255, 0.5)';
        el.style.backdropFilter = 'blur(28px) saturate(160%)';
        el.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'transparent';
        el.style.backdropFilter = 'none';
        el.style.transform = 'translateX(0)';
      }}
    >
      {/* Type badge */}
      {showType && (
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
          style={{ background: TYPE_COLORS[task.type] + '22', color: TYPE_COLORS[task.type], fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {TYPE_LABELS[task.type]}
        </span>
      )}

      <input type="checkbox" className="task-checkbox" checked={task.completed} onChange={handleToggle} onClick={(e) => e.stopPropagation()} />

      <div className="flex-1 min-w-0">
        <span className={`block transition-all duration-500 ${task.completed ? 'text-muted-light' : 'text-dark'} ${compact ? 'text-sm' : 'text-base'}`}
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: task.completed ? 400 : 500, textDecoration: task.completed ? 'line-through' : 'none', textDecorationColor: 'rgba(30, 41, 59, 0.2)', textDecorationThickness: '1px' }}>
          {task.title}
        </span>
        {!compact && (
          <span className={`text-xs mt-0.5 block ${isOverdue ? 'text-red-400' : 'text-muted-light'}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {dueDateStr} {dueTimeStr} {isOverdue ? '(已过期)' : ''}
          </span>
        )}
      </div>

      <button
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-light hover:text-red-400 p-1 rounded flex-shrink-0"
        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L13 13M13 1L1 13" /></svg>
      </button>
    </div>
  );
}
