import { useState, useCallback, useEffect } from 'react';
import type { Task, TaskType, EventItem } from '@/types/task';

const TASK_STORAGE = 'xingyu-tasks-v3';
const EVENT_STORAGE = 'xingyu-events-v1';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// === Date helpers ===
function getDayStart(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getTodayStart(): number {
  return getDayStart(Date.now());
}

function getTomorrowStart(): number {
  return getTodayStart() + 86400000;
}

function getWeekStart(ts: number = Date.now()): number {
  const d = new Date(ts);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getMonthStart(ts: number = Date.now()): number {
  const d = new Date(ts);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getMonthEnd(ts: number = Date.now()): number {
  const d = new Date(ts);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function getWeekEnd(ts: number = Date.now()): number {
  return getWeekStart(ts) + 7 * 86400000 - 1;
}

function getDefaultDailyDueDate(): number {
  const now = new Date();
  now.setHours(23, 59, 0, 0);
  return now.getTime();
}

function getDefaultWeeklyDueDate(): number {
  const end = getWeekEnd();
  const d = new Date(end);
  d.setHours(23, 59, 0, 0);
  return d.getTime();
}

function getDefaultMonthlyDueDate(): number {
  const end = getMonthEnd();
  const d = new Date(end);
  d.setHours(23, 59, 0, 0);
  return d.getTime();
}

function isSameDay(a: number, b: number): boolean {
  return getDayStart(a) === getDayStart(b);
}

// === Load / Save ===
function loadTasks(): Task[] {
  try {
    const stored = localStorage.getItem(TASK_STORAGE);
    if (stored) {
      const parsed = JSON.parse(stored) as Task[];
      const todayStart = getTodayStart();
      const weekStart = getWeekStart();
      const monthStart = getMonthStart();
      // Archive: daily with dueDate < today, weekly with created week < this week, monthly with created month < this month
      return parsed.filter((t) => {
        if (t.type === 'daily') return t.dueDate >= todayStart;
        if (t.type === 'weekly') return t.createdAt >= weekStart;
        if (t.type === 'monthly') return t.createdAt >= monthStart;
        return true;
      });
    }
  } catch { /* ignore */ }
  return getDefaultTasks();
}

function getDefaultTasks(): Task[] {
  const now = Date.now();
  return [
    { id: generateId(), title: '晨间冥想 15 分钟', type: 'daily', completed: true, dueDate: getDefaultDailyDueDate(), createdAt: now },
    { id: generateId(), title: '阅读技术文档', type: 'daily', completed: false, dueDate: getDefaultDailyDueDate(), createdAt: now },
    { id: generateId(), title: '整理工作笔记', type: 'daily', completed: false, dueDate: getDefaultDailyDueDate(), createdAt: now },
    { id: generateId(), title: '晚间运动 30 分钟', type: 'daily', completed: false, dueDate: getDefaultDailyDueDate(), createdAt: now },
    { id: generateId(), title: '完成项目周报', type: 'weekly', completed: false, dueDate: getDefaultWeeklyDueDate(), createdAt: now },
    { id: generateId(), title: '学习新技术框架', type: 'weekly', completed: false, dueDate: getDefaultWeeklyDueDate(), createdAt: now },
    { id: generateId(), title: '制定下月计划', type: 'monthly', completed: false, dueDate: getDefaultMonthlyDueDate(), createdAt: now },
    { id: generateId(), title: '财务总结与分析', type: 'monthly', completed: false, dueDate: getDefaultMonthlyDueDate(), createdAt: now },
  ];
}

function loadEvents(): EventItem[] {
  try {
    const stored = localStorage.getItem(EVENT_STORAGE);
    if (stored) {
      const parsed = JSON.parse(stored) as EventItem[];
      // Archive events older than 2 days past their date
      const twoDaysAgo = Date.now() - 2 * 86400000;
      return parsed.filter((e) => e.date >= twoDaysAgo);
    }
  } catch { /* ignore */ }
  return getDefaultEvents();
}

function getDefaultEvents(): EventItem[] {
  const now = Date.now();
  return [
    {
      id: generateId(),
      name: '项目周会',
      content: '与团队同步本周进度，讨论下周计划',
      date: now + 86400000,
      endDate: now + 86400000 + 3600000,
      createdAt: now,
    },
    {
      id: generateId(),
      name: '月度复盘',
      content: '回顾本月完成情况，制定改进计划',
      date: now + 3 * 86400000,
      endDate: now + 3 * 86400000 + 7200000,
      createdAt: now,
    },
  ];
}

// === Task Manager Hook ===
export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());

  useEffect(() => {
    localStorage.setItem(TASK_STORAGE, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((title: string, type: TaskType, dueDate?: number) => {
    let finalDueDate: number;
    if (dueDate) {
      finalDueDate = dueDate;
    } else if (type === 'daily') {
      finalDueDate = getDefaultDailyDueDate();
    } else if (type === 'weekly') {
      finalDueDate = getDefaultWeeklyDueDate();
    } else {
      finalDueDate = getDefaultMonthlyDueDate();
    }
    const newTask: Task = {
      id: generateId(),
      title,
      type,
      completed: false,
      dueDate: finalDueDate,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  // Today progress: only daily tasks due today
  const getTodayProgress = useCallback(() => {
    const todayTasks = tasks.filter((t) => t.type === 'daily' && isSameDay(t.dueDate, Date.now()));
    if (todayTasks.length === 0) return 0;
    return Math.round((todayTasks.filter((t) => t.completed).length / todayTasks.length) * 100);
  }, [tasks]);

  // Dashboard categorization
  const getTodayTasks = useCallback(() => {
    const todayStart = getTodayStart();
    const tomorrowStart = getTomorrowStart();
    return tasks.filter((t) => t.type === 'daily' && t.dueDate >= todayStart && t.dueDate < tomorrowStart);
  }, [tasks]);

  const getWeeklyTasks = useCallback(() => {
    const weekStart = getWeekStart();
    const weekEnd = getWeekEnd();
    // weekly type tasks created this week + daily tasks due this week
    return tasks.filter(
      (t) =>
        (t.type === 'weekly' && t.createdAt >= weekStart && t.createdAt <= weekEnd) ||
        (t.type === 'daily' && t.dueDate >= weekStart && t.dueDate <= weekEnd)
    );
  }, [tasks]);

  const getMonthlyTasks = useCallback(() => {
    const monthStart = getMonthStart();
    const monthEnd = getMonthEnd();
    return tasks.filter(
      (t) =>
        (t.type === 'monthly' && t.createdAt >= monthStart && t.createdAt <= monthEnd) ||
        (t.type === 'weekly' && t.dueDate >= monthStart && t.dueDate <= monthEnd) ||
        (t.type === 'daily' && t.dueDate >= monthStart && t.dueDate <= monthEnd)
    );
  }, [tasks]);

  // Tasks page: incomplete today tasks + upcoming (tomorrow) tasks
  const getIncompleteTodayTasks = useCallback(() => {
    const todayStart = getTodayStart();
    const tomorrowStart = getTomorrowStart();
    return tasks.filter(
      (t) => t.type === 'daily' && t.dueDate >= todayStart && t.dueDate < tomorrowStart && !t.completed
    );
  }, [tasks]);

  const getUpcomingTasks = useCallback(() => {
    const tomorrowStart = getTomorrowStart();
    const dayAfterTomorrow = tomorrowStart + 86400000;
    return tasks.filter(
      (t) =>
        t.type === 'daily' &&
        t.dueDate >= tomorrowStart &&
        t.dueDate < dayAfterTomorrow &&
        !t.completed
    );
  }, [tasks]);

  // === Event Manager ===
  const [events, setEvents] = useState<EventItem[]>(() => loadEvents());

  useEffect(() => {
    localStorage.setItem(EVENT_STORAGE, JSON.stringify(events));
  }, [events]);

  const addEvent = useCallback((name: string, content: string, date: number, endDate?: number) => {
    const newEvent: EventItem = {
      id: generateId(),
      name,
      content,
      date,
      endDate,
      createdAt: Date.now(),
    };
    setEvents((prev) => [newEvent, ...prev]);
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }, []);

  const getUpcomingEvents = useCallback(() => {
    const now = Date.now();
    return events
      .filter((e) => e.date >= now)
      .sort((a, b) => a.date - b.date);
  }, [events]);

  const getPastEvents = useCallback(() => {
    const now = Date.now();
    return events
      .filter((e) => e.date < now)
      .sort((a, b) => b.date - a.date);
  }, [events]);

  return {
    tasks,
    events,
    addTask,
    toggleTask,
    deleteTask,
    addEvent,
    deleteEvent,
    getTodayProgress,
    getTodayTasks,
    getWeeklyTasks,
    getMonthlyTasks,
    getIncompleteTodayTasks,
    getUpcomingTasks,
    getUpcomingEvents,
    getPastEvents,
  };
}
