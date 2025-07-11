import { api } from '../api/apiSlice';
import { Task } from './types';

export const taskApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTasksByProject: builder.query<Task[], string>({
      query: (projectId) => `/task/${projectId}/tasks`,
      transformResponse: (response: { success: boolean; tasks: Task[] }) => response.tasks,
      providesTags: (result, error, projectId) =>
        result
          ? [
              ...result.map((task) => ({ type: 'Task' as const, id: task._id })),
              { type: 'Task', id: projectId },
            ]
          : [{ type: 'Task', id: projectId }],
    }),

    createTask: builder.mutation<Task, { projectId: string; data: Partial<Task> }>({
      query: ({ projectId, data }) => ({
        url: `/task/${projectId}/tasks`,
        method: 'POST',
        body: {
          title: data.title,
          description: data.description,
          status: data.status,
          dueDate: data.dueDate,
        },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Task', id: projectId },
        { type: 'Task', id: 'LIST' },
      ],
    }),

    updateTask: builder.mutation<Task, { taskId: string; data: Partial<Task> }>({
      query: ({ taskId, data }) => ({
        url: `/task/task/${taskId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { taskId }) => [{ type: 'Task', id: taskId }],
    }),

    deleteTask: builder.mutation<{ success: boolean }, string>({
      query: (taskId) => ({
        url: `/task/task/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, taskId) => [{ type: 'Task', id: taskId }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetTasksByProjectQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi;
