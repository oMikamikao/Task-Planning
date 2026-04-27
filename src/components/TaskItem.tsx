import { useRef } from 'react';
import { gsap } from 'gsap';
import type { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
  accentColor?: string;
}

// Audio singleton
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
  audio.play().catch(() => {
    // ignore autoplay restrictions
  });
}

export default function TaskItem({ task, onToggle, onDelete, compact = false, accentColor = '#F59E0B' }: TaskItemProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    onToggle(task.id);
    
    // Play sound when completing (not when un-completing)
    if (!task.completed) {
      playCompleteSound();
    }
    
    // Animate the row
    if (rowRef.current) {
      if (!task.completed) {
        gsap.to(rowRef.current, {
          scale: 0.98,
          duration: 0.15,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        });
      } else {
        gsap.fromTo(rowRef.current, 
          { scale: 0.98 },
          { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.5)' }
        );
      }
    }
  };

  const dueDateStr = new Date(task.dueDate).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
  const dueTimeStr = new Date(task.dueDate).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const isOverdue = task.dueDate < Date.now() && !task.completed;

  return (
    <div
      ref={rowRef}
      className={`group flex items-center gap-3 py-3 px-2 rounded-xl transition-all duration-300 cursor-pointer ${
        compact ? 'py-2' : 'py-3'
      }`}
      style={{ background: 'transparent' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.5)';
        (e.currentTarget as HTMLElement).style.backdropFilter = 'blur(28px) saturate(160%)';
        (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
        (e.currentTarget as HTMLElement).style.backdropFilter = 'none';
        (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
      }}
    >
      {/* Color indicator dot */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: accentColor }}
      />
      
      {/* Checkbox */}
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.completed}
        onChange={handleToggle}
        onClick={(e) => e.stopPropagation()}
      />
      
      {/* Task text */}
      <div className="flex-1 min-w-0">
        <span
          className={`block transition-all duration-500 ${
            task.completed ? 'text-muted-light' : 'text-dark'
          } ${compact ? 'text-sm' : 'text-base'}`}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: task.completed ? 400 : 500,
            textDecoration: task.completed ? 'line-through' : 'none',
            textDecorationColor: 'rgba(30, 41, 59, 0.2)',
            textDecorationThickness: '1px',
          }}
        >
          {task.title}
        </span>
        {!compact && (
          <span 
            className={`text-xs mt-0.5 block ${isOverdue ? 'text-red-400' : 'text-muted-light'}`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {dueDateStr} {dueTimeStr} {isOverdue ? '(已过期)' : ''}
          </span>
        )}
      </div>

      {/* Delete button - visible on hover */}
      <button
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-light hover:text-red-400 p-1 rounded flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 1L13 13M13 1L1 13" />
        </svg>
      </button>
    </div>
  );
}
