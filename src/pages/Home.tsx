import { useState, useEffect } from 'react';
import FluidBackground from '@/components/FluidBackground';
import Header from '@/components/Header';
import TaskPanel from '@/components/TaskPanel';
import CreateTaskModal from '@/components/CreateTaskModal';
import FloatingButton from '@/components/FloatingButton';
import { useTaskManager } from '@/hooks/useTaskManager';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    addTask,
    toggleTask,
    deleteTask,
    getTodayProgress,
    getTodayTasks,
    getWeeklyTasks,
    getMonthlyTasks,
  } = useTaskManager();

  const handleAddTask = (title: string, type: 'daily' | 'weekly' | 'monthly', dueDate?: number) => {
    addTask(title, type, dueDate);
  };

  const progress = getTodayProgress();
  const todayTasks = getTodayTasks();
  const weeklyTasks = getWeeklyTasks();
  const monthlyTasks = getMonthlyTasks();

  useEffect(() => {
    const audio = new Audio('/sounds/complete.mp3');
    audio.volume = 0.4;
    audio.load();
  }, []);

  return (
    <div className="h-screen overflow-hidden relative">
      <FluidBackground />
      <div className="relative z-10 h-full max-w-6xl mx-auto px-4 py-5 md:px-6 md:py-6 flex flex-col">
        <div className="flex-shrink-0">
          <Header progress={progress} />
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0 pb-24 md:pb-0">
          <div className="lg:col-span-3 min-h-0">
            <TaskPanel
              title="今日任务"
              subtitle="今日到期，专注当下"
              tasks={todayTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              accentColor="#F59E0B"
              delay={0.3}
              compact={false}
              maxHeight="calc(100vh - 200px)"
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
            <div className="flex-1 min-h-0">
              <TaskPanel
                title="本周目标"
                subtitle="本周核心任务"
                tasks={weeklyTasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
                accentColor="#8B5CF6"
                delay={0.5}
                compact={true}
                maxHeight="calc(50vh - 130px)"
              />
            </div>
            <div className="flex-1 min-h-0">
              <TaskPanel
                title="月度愿景"
                subtitle="本月大方向"
                tasks={monthlyTasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
                accentColor="#06B6D4"
                delay={0.7}
                compact={true}
                maxHeight="calc(50vh - 130px)"
              />
            </div>
          </div>
        </div>
      </div>

      <FloatingButton onClick={() => setIsModalOpen(true)} />
      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddTask} />
    </div>
  );
}
