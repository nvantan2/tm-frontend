import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, User, LogOut, LayoutDashboard,
  CheckCircle2, Clock, PlayCircle, MoreVertical, GripVertical,
  X, AlertCircle, Loader2, FileText
} from 'lucide-react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { authService } from '../services/auth.service';
import { tasksService } from '../services/tasks.service';
import type { Task, TaskStatus, TaskPriority } from '../types';

// --- Create Task Modal Component ---
const CreateTaskModal = ({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [users, setUsers] = useState<Array<{ id: number; fullName: string; email: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    authService
      .getUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await tasksService.create({
        title,
        description,
        priority,
        assigneeId: assigneeId ? Number(assigneeId) : undefined,
      });
      onSuccess();
      onClose();
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setAssigneeId('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-card w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
            <h3 className="text-xl font-bold text-text">Create New Task</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-surface-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                <AlertCircle className="w-5 h-5" />
                {Array.isArray(error) ? error[0] : error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-surface-400 ml-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="What needs to be done?"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-surface-400 ml-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[120px] py-3 resize-none"
                placeholder="Add more details about this task..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-surface-400 ml-1">Priority</label>
              <div className="grid grid-cols-4 gap-3">
                {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`text-[10px] font-bold py-2 rounded-lg border transition-all ${priority === p
                        ? 'bg-accent/20 border-accent text-accent shadow-lg shadow-accent/10'
                        : 'bg-surface-900 border-white/5 text-surface-500 hover:border-white/10'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-surface-400 ml-1">Assigned</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="input-field py-3"
              >
                <option value="">Unassigned</option>
                {users.map((availableUser) => (
                  <option key={availableUser.id} value={availableUser.id}>
                    {availableUser.fullName} ({availableUser.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl bg-surface-900 border border-white/10 text-sm font-bold text-surface-400 hover:bg-surface-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] btn-primary py-3 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Create Task</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const TaskDetailModal = ({
  taskId,
  onClose,
  onUpdated,
}: {
  taskId: number | null;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [assigneeId, setAssigneeId] = useState('');
  const [users, setUsers] = useState<Array<{ id: number; fullName: string; email: string }>>([]);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!taskId) {
      setTask(null);
      setError('');
      setSaveError('');
      return;
    }

    const loadTask = async () => {
      setLoading(true);
      setError('');

      try {
        const [response, availableUsers] = await Promise.all([
          tasksService.getById(taskId),
          authService.getUsers(),
        ]);
        setTask(response);
        setUsers(availableUsers);
        setTitle(response.title);
        setDescription(response.description || '');
        setPriority(response.priority);
        setStatus(response.status);
        setAssigneeId(response.assignee?.id ? String(response.assignee.id) : '');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load task detail');
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId]);

  useEffect(() => {
    if (!loading && task) {
      titleInputRef.current?.focus();
    }
  }, [loading, task]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!taskId) return;

    setSaving(true);
    setSaveError('');

    try {
      const updatedTask = await tasksService.update(taskId, {
        title,
        description,
        priority,
        status,
        assigneeId: assigneeId ? Number(assigneeId) : undefined,
      });

      setTask(updatedTask);
      await onUpdated();
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  if (!taskId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto p-4 sm:items-center bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card my-6 flex max-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col overflow-hidden border border-white/10 shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-text">Edit Task</h3>
                <p className="text-xs uppercase tracking-[0.24em] text-surface-400">
                  Update task information
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-surface-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
            {loading ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  {Array.isArray(error) ? error[0] : error}
                </div>
              </div>
            ) : task ? (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {saveError && (
                      <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        {Array.isArray(saveError) ? saveError[0] : saveError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                        <div>
                          <p className="section-label">Task Snapshot</p>
                          <p className="mt-1 text-sm text-surface-300">
                            Refine core information and assignment without leaving the board.
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                          <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                            {status}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300">
                            {priority}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor="task-status" className="section-label">Status</label>
                          <select
                            id="task-status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as TaskStatus)}
                            className="input-field py-2"
                          >
                            {(['TODO', 'DOING', 'RESOLVED', 'READY_TO_TEST', 'READY_TO_STAGING', 'CLOSE'] as TaskStatus[]).map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="task-priority" className="section-label">Priority</label>
                          <select
                            id="task-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as TaskPriority)}
                            className="input-field py-2"
                          >
                            {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TaskPriority[]).map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="task-title" className="section-label">Title</label>
                        <input
                          id="task-title"
                          ref={titleInputRef}
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="input-field"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="task-description" className="section-label">Description</label>
                        <textarea
                          id="task-description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="input-field min-h-[140px] py-3 resize-y"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/5 bg-surface-900/40 p-4">
                        <p className="section-label">Reporter</p>
                        <p className="mt-2 text-sm font-semibold text-text">{task.reporter?.fullName || 'Unknown'}</p>
                        <p className="text-xs text-surface-400 break-all">{task.reporter?.email || 'No email'}</p>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-surface-900/40 p-4">
                        <p className="section-label">Assigned</p>
                        <p className="mt-2 text-sm font-semibold text-text">{task.assignee?.fullName || 'Unassigned'}</p>
                        <p className="text-xs text-surface-400 break-all">{task.assignee?.email || 'No assignee email'}</p>
                        <div className="mt-4 space-y-2">
                          <label htmlFor="task-assignee" className="section-label">Assigned User</label>
                          <select
                            id="task-assignee"
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className="input-field py-3"
                          >
                            <option value="">Unassigned</option>
                            {users.map((availableUser) => (
                              <option key={availableUser.id} value={availableUser.id}>
                                {availableUser.fullName} ({availableUser.email})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/5 bg-surface-900/20 p-4">
                        <p className="section-label">Created At</p>
                        <p className="mt-2 text-sm text-text">{new Date(task.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-surface-900/20 p-4">
                        <p className="section-label">Updated At</p>
                        <p className="mt-2 text-sm text-text">{new Date(task.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 justify-end gap-3 border-t border-white/5 bg-background/60 px-6 py-4 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-3 rounded-xl bg-surface-900 border border-white/10 text-sm font-bold text-surface-400 hover:bg-surface-800 transition-all"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary min-w-[140px] flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Changes
                  </button>
                </div>
              </>
            ) : null}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- Droppable Column Component ---
const KanbanColumn = ({
  id,
  label,
  icon: Icon,
  color,
  tasks
}: {
  id: TaskStatus;
  label: string;
  icon: any;
  color: string;
  tasks: Task[]
}) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="min-w-[350px] max-w-[400px] flex-1 flex flex-col bg-surface-900/20 rounded-2xl p-4 border border-white/5"
    >
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${color}`} />
          <h3 className="font-bold text-text text-sm uppercase tracking-widest">{label}</h3>
          <span className="bg-surface-800 text-surface-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/5">
            {tasks.length}
          </span>
        </div>
        <button className="p-1 hover:bg-white/5 rounded-md text-surface-400 cursor-pointer transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
        <SortableContext
          items={tasks.map(t => t.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            {tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl p-8 text-center bg-white/[0.02]">
            <Plus className="w-8 h-8 text-surface-600 mb-2 opacity-20" />
            <p className="text-surface-500 text-xs">Drop task here</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Sortable Task Card Component ---
const SortableTaskCard = ({ task }: { task: Task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id.toString(),
    data: {
      type: 'Task',
      task,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleCardClick = () => {
    window.dispatchEvent(
      new CustomEvent('task:open-detail', {
        detail: { taskId: task.id },
      }),
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleCardClick}
      className={`glass-card p-4 group relative border border-white/5 hover:border-accent/30 cursor-pointer transition-all duration-300 ${isDragging ? 'z-50 ring-2 ring-accent/50 shadow-2xl scale-105' : ''
        }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${task.priority === 'URGENT' ? 'bg-red-500/20 text-red-500' :
            task.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
              task.priority === 'MEDIUM' ? 'bg-blue-500/20 text-blue-500' :
                'bg-surface-500/20 text-surface-400'
          }`}>
          {task.priority}
        </span>
        <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/5 rounded text-surface-400">
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      <h4 className="text-text font-medium mb-2 group-hover:text-accent transition-colors">{task.title}</h4>
      <p className="text-surface-400 text-xs line-clamp-2 mb-4">
        {task.description || 'No description provided.'}
      </p>

      <div className="mb-4 grid gap-2 text-[11px] text-surface-400">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
          <span className="uppercase tracking-widest text-surface-500">Reporter</span>
          <span className="truncate font-medium text-surface-300">
            {task.reporter?.fullName || 'Unknown'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
          <span className="uppercase tracking-widest text-surface-500">Assigned</span>
          <span className="truncate font-medium text-surface-300">
            {task.assignee?.fullName || 'Unassigned'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-primary border border-background flex items-center justify-center text-[10px] text-text font-bold">
            {task.reporter?.fullName.charAt(0) || 'R'}
          </div>
          <div className="w-6 h-6 rounded-full bg-surface-800 border border-background flex items-center justify-center text-[10px] text-text font-bold">
            {task.assignee?.fullName.charAt(0) || 'A'}
          </div>
        </div>
        <div className="flex items-center gap-2 text-surface-400 text-[10px]">
          <Clock className="w-3 h-3" /> {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Just now'}
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard Page ---
const DashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [originalStatus, setOriginalStatus] = useState<TaskStatus | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'assigned' | 'reported'>('all');

  const fetchTasks = async (searchValue = searchTerm) => {
    try {
      const response = await tasksService.getAll({
        search: searchValue.trim() || undefined,
        limit: 100,
      });
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    authService.getMe().then(setUser).catch(() => setUser({ fullName: 'Developer', role: 'ADMIN' }));
    fetchTasks();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchTasks(searchTerm);
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  useEffect(() => {
    const openTaskDetail = (event: Event) => {
      const customEvent = event as CustomEvent<{ taskId: number }>;
      setSelectedTaskId(customEvent.detail.taskId);
    };

    window.addEventListener('task:open-detail', openTaskDetail);

    return () => {
      window.removeEventListener('task:open-detail', openTaskDetail);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns: { id: TaskStatus; label: string; icon: any; color: string }[] = [
    { id: 'TODO', label: 'To Do', icon: Clock, color: 'text-surface-400' },
    { id: 'DOING', label: 'In Progress', icon: PlayCircle, color: 'text-accent' },
    { id: 'RESOLVED', label: 'Resolved', icon: CheckCircle2, color: 'text-green-500' },
    { id: 'READY_TO_TEST', label: 'Ready To Test', icon: CheckCircle2, color: 'text-cyan-400' },
    { id: 'READY_TO_STAGING', label: 'Ready To Staging', icon: CheckCircle2, color: 'text-violet-400' },
    { id: 'CLOSE', label: 'Closed', icon: CheckCircle2, color: 'text-surface-500' },
  ];

  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveId(active.id);

    const task = tasks.find(t => t.id.toString() === active.id.toString());
    if (task) {
      setOriginalStatus(task.status);
    }
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverColumn = columns.some(col => col.id === overId);

    // Dynamic move during drag for UI feedback
    if (isActiveTask && isOverColumn) {
      setTasks((prev) => {
        const activeTaskIndex = prev.findIndex(t => t.id.toString() === activeId);
        if (activeTaskIndex !== -1 && prev[activeTaskIndex].status !== overId) {
          const newTasks = [...prev];
          newTasks[activeTaskIndex] = { ...newTasks[activeTaskIndex], status: overId as TaskStatus };
          return newTasks;
        }
        return prev;
      });
    } else if (isActiveTask) {
      // Dragging over another task
      const overTask = tasks.find(t => t.id.toString() === overId);
      if (overTask && tasks.find(t => t.id.toString() === activeId)?.status !== overTask.status) {
        setTasks((prev) => {
          const activeTaskIndex = prev.findIndex(t => t.id.toString() === activeId);
          const newTasks = [...prev];
          newTasks[activeTaskIndex] = { ...newTasks[activeTaskIndex], status: overTask.status };
          return newTasks;
        });
      }
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setOriginalStatus(null);
      return;
    }

    const activeIdStr = active.id.toString();
    const overIdStr = over.id.toString();

    const activeTask = tasks.find(t => t.id.toString() === activeIdStr);

    // Call API if status changed
    if (activeTask && originalStatus && activeTask.status !== originalStatus) {
      try {
        console.log(`Updating task ${activeTask.id} status to ${activeTask.status}`);
        await tasksService.update(activeTask.id, { status: activeTask.status });
      } catch (err) {
        console.error('Failed to update task status in backend', err);
        fetchTasks(searchTerm); // Rollback from server
      }
    }

    if (activeIdStr !== overIdStr) {
      const activeIndex = tasks.findIndex(t => t.id.toString() === activeIdStr);
      const overIndex = tasks.findIndex(t => t.id.toString() === overIdStr);

      if (activeIndex !== -1 && overIndex !== -1) {
        setTasks((prev) => arrayMove(prev, activeIndex, overIndex));
      }
    }

    setActiveId(null);
    setOriginalStatus(null);
  };

  const activeTask = tasks.find(t => t.id.toString() === activeId);
  const filteredTasks = tasks.filter((task) => {
    if (viewMode === 'assigned') {
      return task.assignee?.id === user?.id;
    }

    if (viewMode === 'reported') {
      return task.reporter?.id === user?.id;
    }

    return true;
  });

  const boardStats = {
    visible: filteredTasks.length,
    assigned: tasks.filter((task) => task.assignee?.id === user?.id).length,
    reported: tasks.filter((task) => task.reporter?.id === user?.id).length,
    closed: tasks.filter((task) => task.status === 'CLOSE').length,
  };

  return (
    <div className="dashboard-shell flex flex-col font-sans">
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTasks}
      />
      <TaskDetailModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdated={fetchTasks}
      />

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/5 px-6 py-4">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-3 transition-transform cursor-pointer">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-surface-400">
                TaskControl
              </span>
              <p className="text-xs uppercase tracking-[0.24em] text-surface-500">Execution board</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks, reporter, assignee..."
                className="input-field w-80 rounded-full py-2 pl-10"
              />
            </div>

            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-text">{user?.fullName}</p>
                <p className="text-xs text-surface-400 uppercase tracking-[0.2em]">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-800 border-2 border-accent/20 flex items-center justify-center overflow-hidden cursor-pointer hover:border-accent transition-colors">
                <User className="w-6 h-6 text-surface-400" />
              </div>
              <button
                onClick={() => authService.logout()}
                className="p-2 hover:bg-red-500/10 rounded-lg text-surface-400 hover:text-red-500 transition-all cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden flex flex-col max-w-[1600px] mx-auto w-full">
        <section className="panel-muted relative overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-accent/10 to-transparent" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <span className="stat-chip">Workspace Overview</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Move visible work with tighter ownership and cleaner handoffs.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-surface-300 sm:text-base">
                Search what matters, switch between assigned and reported work, and update tasks inline without losing context.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="panel-muted min-w-[10rem] p-4">
                <p className="section-label">Visible</p>
                <p className="mt-3 text-3xl font-bold text-white">{boardStats.visible}</p>
                <p className="mt-2 text-xs text-surface-400">Tasks in current view</p>
              </div>
              <div className="panel-muted min-w-[10rem] p-4">
                <p className="section-label">Assigned</p>
                <p className="mt-3 text-3xl font-bold text-white">{boardStats.assigned}</p>
                <p className="mt-2 text-xs text-surface-400">Assigned to you</p>
              </div>
              <div className="panel-muted min-w-[10rem] p-4">
                <p className="section-label">Reported</p>
                <p className="mt-3 text-3xl font-bold text-white">{boardStats.reported}</p>
                <p className="mt-2 text-xs text-surface-400">Created by you</p>
              </div>
              <div className="panel-muted min-w-[10rem] p-4">
                <p className="section-label">Closed</p>
                <p className="mt-3 text-3xl font-bold text-white">{boardStats.closed}</p>
                <p className="mt-2 text-xs text-surface-400">Completed work</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">Project Board</h3>
            <p className="mt-1 text-sm text-surface-400">Interactive workflow by status, assignment, and reporting context.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full min-w-[18rem] lg:hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks, reporter, assignee..."
                className="input-field w-full rounded-full py-2 pl-10"
              />
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-surface-900/70 p-1">
              {[
                { id: 'all', label: 'All Visible' },
                { id: 'assigned', label: 'Assigned To Me' },
                { id: 'reported', label: 'Reported By Me' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setViewMode(option.id as 'all' | 'assigned' | 'reported')}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all ${
                    viewMode === option.id
                      ? 'bg-accent text-white shadow-lg shadow-accent/20'
                      : 'text-surface-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2 py-2.5"
            >
              <Plus className="w-5 h-5" /> Create Task
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="mt-6 flex-1 flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  label={column.label}
                  icon={column.icon}
                  color={column.color}
                  tasks={filteredTasks.filter(t => t.status === column.id)}
                />
              ))}
            </div>

            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: {
                    opacity: '0.5',
                  },
                },
              }),
            }}>
              {activeId && activeTask ? (
                <div className="glass-card p-4 ring-2 ring-accent border-accent/30 shadow-2xl scale-105 pointer-events-none">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${activeTask.priority === 'URGENT' ? 'bg-red-500/20 text-red-500' :
                        activeTask.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                          activeTask.priority === 'MEDIUM' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-surface-500/20 text-surface-400'
                      }`}>
                      {activeTask.priority}
                    </span>
                    <GripVertical className="w-4 h-4 text-surface-400" />
                  </div>
                  <h4 className="text-text font-medium mb-2">{activeTask.title}</h4>
                  <p className="text-surface-400 text-xs line-clamp-2">{activeTask.description}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
