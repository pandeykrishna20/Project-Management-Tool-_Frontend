// File: src/features/types.ts
export interface Project {
  _id?: string;
  title: string;
  description?: string;
  status: 'active' | 'completed';
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string;
  projectId: string;
}

// export interface TaskFormData {
//   title: string;
//   description?: string;
//   status: 'todo' | 'in_progress' | 'done';
// }

export type TaskFormData = {
  _id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
};
