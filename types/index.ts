export type Role = 'manager' | 'employee'
export type Priority = 'high' | 'mid' | 'low'
export type TaskStatus = 'todo' | 'inprogress' | 'done' | 'overdue'
export type LogAction = 'created' | 'status_changed' | 'progress_updated' | 'note_updated' | 'locked'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: Role
  department?: string
  avatar_color: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  note?: string
  deadline?: string
  priority: Priority
  status: TaskStatus
  progress: number
  task_date: string
  locked: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface TaskLog {
  id: string
  task_id: string
  user_id: string
  action: LogAction
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  created_at: string
}

export interface CreateTaskInput {
  title: string
  note?: string
  deadline?: string
  priority: Priority
}

export interface UpdateTaskInput {
  status?: TaskStatus
  progress?: number
  note?: string
  priority?: Priority
}
