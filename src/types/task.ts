export type TaskType = 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  completed: boolean;
  dueDate: number; // 到期日期+时间的时间戳（daily必填，weekly默认本周日，monthly默认月底）
  createdAt: number;
}

export interface EventItem {
  id: string;
  name: string;
  content: string;
  date: number; // 事件日期+时间的时间戳
  endDate?: number; // 可选结束时间
  createdAt: number;
}
