import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Project } from './types';

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Projects'],
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/project/projects',
      transformResponse: (response: { success: boolean; projects: Project[] }) => response.projects,
      providesTags: (result) =>
        result
          ? [
              ...result.map((project) => ({ type: 'Projects' as const, id: project._id })),
              { type: 'Projects', id: 'LIST' },
            ]
          : [{ type: 'Projects', id: 'LIST' }],
    }),

    createProject: builder.mutation<Project, Partial<Project>>({
      query: (body) => ({ url: '/project/projects', method: 'POST', body }),
      invalidatesTags: [{ type: 'Projects', id: 'LIST' }],
    }),

    updateProject: builder.mutation<Project, { id: string; data: Partial<Project> }>({
      query: ({ id, data }) => ({
        url: `/project/projects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Projects', id }],
    }),

    deleteProject: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/project/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'Projects', id }],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
