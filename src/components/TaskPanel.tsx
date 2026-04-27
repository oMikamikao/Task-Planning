import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import TaskItem from './TaskItem';
import type { Task } from '@/types/task';

interface TaskPanelProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  accentColor: string;
  delay?: number;
  compact?: boolean;
  maxHeight?: string;
}

export default function TaskPanel({ title, subtitle, tasks, onToggle, onDelete, accentColor, delay = 0, compact = false, maxHeight = 'calc(100vh - 200px)' }: TaskPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(panelRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay });
    }
  }, [delay]);

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div ref={panelRef} className="glass-panel opacity-0 flex flex-col h-full">
      <div className="p-5 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}66` }} />
            <h2 className="text-lg font-bold text-dark" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
          </div>
          <span className="mono text-xs text-muted-light" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{completedCount}/{tasks.length}</span>
        </div>
        <p className="text-sm text-muted-light">{subtitle}</p>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-5" style={{ maxHeight: compact ? undefined : maxHeight }}>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-light text-sm">暂无任务</div>
        ) : (
          <div className="space-y-0.5">
            {tasks.map((task) => (
              <div key={`${title}-${task.id}`}>
                <TaskItem task={task} onToggle={onToggle} onDelete={onDelete} compact={compact} showType={true} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
