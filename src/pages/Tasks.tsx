import { useState, useEffect } from 'react';
import FluidBackground from '@/components/FluidBackground';
import TaskPanel from '@/components/TaskPanel';
import CreateTaskModal from '@/components/CreateTaskModal';
import FloatingButton from '@/components/FloatingButton';
import { useTaskManager } from '@/hooks/useTaskManager';

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    addTask,
    toggleTask,
    deleteTask,
    getIncompleteTodayTasks,
    getUpcomingTasks,
  } = useTaskManager();

  const handleAddTask = (title: string, type: 'daily' | 'weekly' | 'monthly', dueDate?: number) => {
    addTask(title, type, dueDate);
  };

  const incompleteToday = getIncompleteTodayTasks();
  const upcoming = getUpcomingTasks();

  useEffect(() => {
    const audio = new Audio('/sounds/complete.mp3');
    audio.volume = 0.4;
    audio.load();
  }, []);

  return (
    <div className="h-screen overflow-hidden relative">
      <FluidBackground />
      <div className="relative z-10 h-full max-w-5xl mx-auto px-4 py-5 md:px-6 md:py-6 flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <h2 className="text-2xl font-bold text-dark" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Tasks</h2>
          <p className="text-sm text-muted-light mt-1">管理你的待办任务</p>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          <div className="min-h-0">
            <TaskPanel
              title="今日待办"
              subtitle="尚未完成的今日任务"
              tasks={incompleteToday}
              onToggle={toggleTask}
              onDelete={deleteTask}
              accentColor="#F59E0B"
              delay={0.3}
              compact={false}
              maxHeight="calc(100vh - 200px)"
            />
          </div>
          <div className="min-h-0">
            <TaskPanel
              title="即将到来"
              subtitle="明日到期的任务"
              tasks={upcoming}
              onToggle={toggleTask}
              onDelete={deleteTask}
              accentColor="#8B5CF6"
              delay={0.5}
              compact={false}
              maxHeight="calc(100vh - 200px)"
            />
          </div>
        </div>
      </div>

      <FloatingButton onClick={() => setIsModalOpen(true)} />
      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddTask} />
    </div>
  );
}
