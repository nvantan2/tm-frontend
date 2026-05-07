import api from './api';
import type { TaskStatus, TaskPriority, Task, TasksListResponse, User } from '../types';

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;
}

interface TaskApiResponse {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: User | null;
  assigned?: User | null;
  reporter?: User | null;
  createdAt: string;
  updatedAt: string;
}

const normalizeTask = (task: TaskApiResponse): Task => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  assignee: task.assignee ?? task.assigned ?? undefined,
  reporter: task.reporter ?? undefined,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

export const tasksService = {
  async getAll(params?: any): Promise<TasksListResponse> {
    const response = await api.get<TasksListResponse & { data: TaskApiResponse[] }>(
      '/tasks',
      { params },
    );

    return {
      ...response.data,
      data: response.data.data.map(normalizeTask),
    };
  },

  async getById(id: number): Promise<Task> {
    const response = await api.get<TaskApiResponse>(`/tasks/${id}`);
    return normalizeTask(response.data);
  },

  async create(data: CreateTaskData): Promise<Task> {
    const response = await api.post<TaskApiResponse>('/tasks', data);
    return normalizeTask(response.data);
  },

  async update(id: number, data: any): Promise<Task> {
    const response = await api.patch<TaskApiResponse>(`/tasks/${id}`, data);
    return normalizeTask(response.data);
  },

  async delete(id: number) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
};
