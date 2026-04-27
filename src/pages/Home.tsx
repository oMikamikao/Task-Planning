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
    getProgress, 
    getTodayTasks, 
    getWeeklyTasks, 
    getMonthlyTasks 
  } = useTaskManager();

  const handleAddTask = (title: string, dueDate: number) => {
    addTask(title, dueDate);
  };

  const progress = getProgress();
  
  const todayTasks = getTodayTasks();
  const weeklyTasks = getWeeklyTasks();
  const monthlyTasks = getMonthlyTasks();

  // Preload audio on mount
  useEffect(() => {
    const audio = new Audio('/sounds/complete.mp3');
    audio.volume = 0.4;
    audio.load();
  }, []);

  return (
    <div className="min-h-[100dvh] h-auto md:h-screen md:overflow-hidden relative">
      {/* Soft Background */}
      <FluidBackground />

      {/* Main Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 py-5 md:px-6 md:py-6 flex flex-col">
        {/* Header with progress */}
        <div className="flex-shrink-0">
          <Header progress={progress} />
        </div>

        {/* Main grid layout - fills remaining height on desktop */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0 pb-24 md:pb-0">
          {/* Left: Today tasks - takes 3 columns */}
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

          {/* Right: Weekly + Monthly - takes 2 columns */}
          <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
            {/* Weekly panel */}
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

            {/* Monthly panel */}
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

      {/* Floating Action Button */}
      <FloatingButton onClick={() => setIsModalOpen(true)} />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </div>
  );
}
