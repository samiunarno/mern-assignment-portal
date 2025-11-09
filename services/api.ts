
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// FIX: Corrected import path for types.
import { UserRole } from '../types';
import type { User, Assignment, Submission, AdminStats, MonitorStats, StudentStats } from '../types';

// Helper to transform responses by mapping _id to id recursively, as the backend uses _id.
const transformIdInResponse = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => transformIdInResponse(item));
  }
  if (data && typeof data === 'object' && data !== null) {
    const { _id, ...rest } = data;
    if (_id !== undefined) {
      rest.id = _id;
    }
    // Recursively transform nested objects
    for (const key in rest) {
      if (Object.prototype.hasOwnProperty.call(rest, key)) {
          rest[key] = transformIdInResponse(rest[key]);
      }
    }
    return rest;
  }
  return data;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Assignment', 'Submission', 'Stats'],
  endpoints: (builder) => ({
    // --- AUTH ---
    login: builder.mutation<{ token: string; user: User }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: { token: string, data: { user: any } }) => ({
        token: response.token,
        user: transformIdInResponse(response.data.user),
      }),
       invalidatesTags: ['User', 'Assignment', 'Submission', 'Stats'],
    }),
    register: builder.mutation<User, { name: string; email: string; password: string }>({
      query: (userInfo) => ({
        url: '/auth/register',
        method: 'POST',
        body: userInfo,
      }),
      transformResponse: (response: { data: { user: any } }) => transformIdInResponse(response.data.user),
    }),
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (response: { data: { user: any } }) => transformIdInResponse(response.data.user),
      providesTags: (result) => result ? [{ type: 'User', id: result.id }] : [],
    }),

    // --- USERS (ADMIN) ---
    getAllUsers: builder.query<User[], void>({
      query: () => '/users',
      transformResponse: (response: { data: { users: any[] } }) => transformIdInResponse(response.data.users),
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'User' as const, id })),
        { type: 'User', id: 'LIST' },
      ],
    }),
    approveUser: builder.mutation<User, string>({
      query: (userId) => ({
        url: `/users/${userId}/approve`,
        method: 'PATCH',
      }),
      transformResponse: (response: { data: { user: any } }) => transformIdInResponse(response.data.user),
      invalidatesTags: (result, error, userId) => [{ type: 'User', id: 'LIST' }, { type: 'Stats', id: 'ADMIN' }],
    }),
    updateUserRole: builder.mutation<User, { userId: string; role: UserRole }>({
      query: ({ userId, role }) => ({
        url: `/users/${userId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      transformResponse: (response: { data: { user: any } }) => transformIdInResponse(response.data.user),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'DELETE',
        responseHandler: (response) => response.text(), // Handle 204 No Content
      }),
      invalidatesTags: ['User', { type: 'Stats', id: 'ADMIN' }],
    }),
    updatePassword: builder.mutation<{ message: string }, any>({
      query: (data) => ({
        url: '/users/update-password',
        method: 'PATCH',
        body: data,
      }),
    }),
    resetPortal: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/users/reset-portal',
        method: 'POST',
      }),
      invalidatesTags: ['Assignment', 'Submission', 'Stats'],
    }),

    // --- ASSIGNMENTS ---
    getAssignments: builder.query<Assignment[], void>({
      query: () => '/assignments',
      transformResponse: (response: { data: { assignments: any[] } }) => transformIdInResponse(response.data.assignments),
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'Assignment' as const, id })),
        { type: 'Assignment', id: 'LIST' },
      ],
    }),
    createAssignment: builder.mutation<Assignment, FormData>({
      query: (formData) => ({
        url: '/assignments',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: { data: { assignment: any } }) => transformIdInResponse(response.data.assignment),
      invalidatesTags: [{ type: 'Assignment', id: 'LIST' }, 'Stats'],
    }),
    updateAssignment: builder.mutation<Assignment, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/assignments/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      transformResponse: (response: { data: { assignment: any } }) => transformIdInResponse(response.data.assignment),
      invalidatesTags: (result, error, { id }) => [{ type: 'Assignment', id }],
    }),
    deleteAssignment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/assignments/${id}`,
        method: 'DELETE',
        responseHandler: (response) => response.text(),
      }),
      invalidatesTags: ['Assignment', 'Submission', 'Stats'],
    }),
    deleteAssignments: builder.mutation<void, string[]>({
      query: (ids) => ({
        url: '/assignments/bulk-delete',
        method: 'POST',
        body: { ids },
        responseHandler: (response) => response.text(),
      }),
      invalidatesTags: ['Assignment', 'Submission', 'Stats'],
    }),
    downloadAssignmentAttachment: builder.mutation<Blob, string>({
      query: (id) => ({
        url: `/assignments/${id}/attachment`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // --- SUBMISSIONS ---
    submitAssignment: builder.mutation<Submission, { assignmentId: string; file: File }>({
      query: ({ assignmentId, file }) => {
        const formData = new FormData();
        formData.append('submission', file);
        return {
          url: `/assignments/${assignmentId}/submit`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: { data: { submission: any } }) => transformIdInResponse(response.data.submission),
      invalidatesTags: ['Submission', 'Stats'],
    }),
    getSubmissionsForAssignment: builder.query<Submission[], string>({
      query: (assignmentId) => `/assignments/${assignmentId}/submissions`,
      transformResponse: (response: { data: { submissions: any[] } }) => transformIdInResponse(response.data.submissions),
      providesTags: (result, error, assignmentId) => [{ type: 'Submission', id: `LIST-${assignmentId}` }],
    }),
    getStudentSubmissions: builder.query<Submission[], void>({
      query: () => '/assignments/submissions/me',
      transformResponse: (response: { data: { submissions: any[] } }) => transformIdInResponse(response.data.submissions),
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'Submission' as const, id })),
        { type: 'Submission', id: 'LIST' },
      ],
    }),
    downloadSubmission: builder.mutation<Blob, string>({
      query: (submissionId) => ({
        url: `/assignments/submissions/${submissionId}/download`,
        responseHandler: (response) => response.blob(),
      }),
    }),
    sendDeadlineReminder: builder.mutation<{ message: string }, string>({
      query: (assignmentId) => ({
        url: `/assignments/${assignmentId}/reminders`,
        method: 'POST',
      }),
    }),
    emailAndPurgeAssignment: builder.mutation<{ message: string }, { assignmentId: string; email: string }>({
      query: ({ assignmentId, email }) => ({
        url: `/assignments/${assignmentId}/email-and-purge`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: ['Assignment', 'Submission', 'Stats'],
    }),

    // --- STATS ---
    getAdminStats: builder.query<AdminStats, void>({
      query: () => '/stats/admin',
      transformResponse: (response: { data: AdminStats }) => response.data,
      providesTags: [{ type: 'Stats', id: 'ADMIN' }],
    }),
    getMonitorStats: builder.query<MonitorStats, void>({
      query: () => '/stats/monitor',
      transformResponse: (response: { data: MonitorStats }) => response.data,
      providesTags: [{ type: 'Stats', id: 'MONITOR' }],
    }),
    getStudentStats: builder.query<StudentStats, void>({
      query: () => '/stats/student',
      transformResponse: (response: { data: StudentStats }) => response.data,
      providesTags: [{ type: 'Stats', id: 'STUDENT' }],
    }),
  }),
});

// Export hooks for use in components
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useGetAllUsersQuery,
  useApproveUserMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useUpdatePasswordMutation,
  useResetPortalMutation,
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useDeleteAssignmentsMutation,
  useDownloadAssignmentAttachmentMutation,
  useSubmitAssignmentMutation,
  useGetSubmissionsForAssignmentQuery,
  useGetStudentSubmissionsQuery,
  useDownloadSubmissionMutation,
  useSendDeadlineReminderMutation,
  useEmailAndPurgeAssignmentMutation,
  useGetAdminStatsQuery,
  useGetMonitorStatsQuery,
  useGetStudentStatsQuery,
} = api;
