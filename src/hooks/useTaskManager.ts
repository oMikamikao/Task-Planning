import { useState, useCallback, useEffect } from 'react';
import type { Task } from '@/types/task';

const STORAGE_KEY = 'xingyu-tasks-v2';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Get start of today (midnight)
function getTodayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Get start of this week (Sunday midnight)
function getWeekStart(): number {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Get start of this month (1st day midnight)
function getMonthStart(): number {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Get start of next month
function getNextMonthStart(): number {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + 1);
  return d.getTime();
}

// Get end of this week (Saturday 23:59:59)
function getWeekEnd(): number {
  const start = getWeekStart();
  return start + 7 * 86400000;
}

// Check if two timestamps are on the same day
function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
}

function loadTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Task[];
      const todayStart = getTodayStart();
      // Filter out tasks whose dueDate is before today (archived)
      return parsed.filter(t => t.dueDate >= todayStart || !t.completed);
    }
  } catch {
    // ignore
  }
  return getDefaultTasks();
}

function getDefaultTasks(): Task[] {
  const now = Date.now();
  const todayStart = getTodayStart();
  return [
    { id: generateId(), title: '晨间冥想 15 分钟', completed: true, dueDate: now, createdAt: now },
    { id: generateId(), title: '阅读技术文档', completed: false, dueDate: now + 3600000, createdAt: now },
    { id: generateId(), title: '整理工作笔记', completed: false, dueDate: todayStart + 50400000, createdAt: now },
    { id: generateId(), title: '晚间运动 30 分钟', completed: false, dueDate: todayStart + 64800000, createdAt: now },
    { id: generateId(), title: '完成项目周报', completed: false, dueDate: todayStart + 172800000, createdAt: now },
    { id: generateId(), title: '学习新技术框架', completed: false, dueDate: todayStart + 259200000, createdAt: now },
    { id: generateId(), title: '制定下月计划', completed: false, dueDate: todayStart + 518400000, createdAt: now },
    { id: generateId(), title: '财务总结与分析', completed: false, dueDate: todayStart + 604800000, createdAt: now },
  ];
}

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((title: string, dueDate: number) => {
    const newTask: Task = {
      id: generateId(),
      title,
      completed: false,
      dueDate,
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const getProgress = useCallback(() => {
    const active = getActiveTasks(tasks);
    if (active.length === 0) return 0;
    return Math.round((active.filter(t => t.completed).length / active.length) * 100);
  }, [tasks]);

  // Dynamic categorization based on dueDate
  const getTodayTasks = useCallback(() => {
    const todayStart = getTodayStart();
    const todayEnd = todayStart + 86400000;
    return tasks.filter(t => t.dueDate >= todayStart && t.dueDate < todayEnd);
  }, [tasks]);

  const getWeeklyTasks = useCallback(() => {
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();
    return tasks.filter(t => t.dueDate >= weekStart && t.dueDate < weekEnd);
  }, [tasks]);

  const getMonthlyTasks = useCallback(() => {
    const monthStart = getMonthStart();
    const monthEnd = getNextMonthStart();
    return tasks.filter(t => t.dueDate >= monthStart && t.dueDate < monthEnd);
  }, [tasks]);

  const getActiveTasks = useCallback((taskList: Task[]) => {
    const todayStart = getTodayStart();
    return taskList.filter(t => t.dueDate >= todayStart);
  }, []);

  return {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    getProgress,
    getTodayTasks,
    getWeeklyTasks,
    getMonthlyTasks,
    getActiveTasks,
    isSameDay,
  };
}
