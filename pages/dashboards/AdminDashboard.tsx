
import React, { useState, useEffect, useMemo } from 'react';
// FIX: Import RTK Query hooks for data fetching and mutations.
import { 
  useGetAllUsersQuery, 
  useGetAdminStatsQuery,
  useApproveUserMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useResetPortalMutation
} from '../../services/api';
import type { User } from '../../types';
import { UserRole } from '../../types';
import { ROLES_CONFIG } from '../../constants';
import { useNotification } from '../../hooks/useNotification';
import ConfirmationModal from '../../components/ConfirmationModal';
import { TrashIcon, UsersIcon, UserPlusIcon, ClipboardDocumentListIcon, DocumentArrowUpIcon, ExclamationTriangleIcon } from '../../components/icons/Icons';
import TableSkeleton from '../../components/TableSkeleton';
import StatCard from '../../components/StatCard';

const AdminDashboard: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending'>('all');
  const { addNotification } = useNotification();
  
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  // FIX: Use RTK Query hooks for data fetching.
  const { data: usersData, isLoading: usersLoading, error: usersError } = useGetAllUsersQuery();
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetAdminStatsQuery();

  // FIX: Use RTK Query mutation hooks.
  const [approveUser] = useApproveUserMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [resetPortal] = useResetPortalMutation();

  const handleApprove = async (userId: string) => {
    try {
      await approveUser(userId).unwrap();
      addNotification('User approved successfully', 'success');
    } catch (err) {
      addNotification((err as Error).message, 'error');
    }
  };

  const handleChangeRole = async (userId: string, role: UserRole) => {
    try {
      await updateUserRole({ userId, role }).unwrap();
      addNotification('User role updated successfully', 'success');
    } catch (err) {
      addNotification((err as Error).message, 'error');
    }
  };
  
  const openConfirmDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsConfirmDeleteOpen(true);
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id).unwrap();
      addNotification(`User ${userToDelete.name} deleted successfully.`, 'success');
    } catch (err) {
      addNotification((err as Error).message, 'error');
    } finally {
      setIsConfirmDeleteOpen(false);
      setUserToDelete(null);
    }
  };
  
  const handleResetPortal = async () => {
    try {
      const response = await resetPortal().unwrap();
      addNotification(response.message, 'success');
    } catch (err) {
      addNotification((err as Error).message, 'error');
    } finally {
      setIsConfirmResetOpen(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!usersData) return [];
    return usersData.filter(user => filter === 'pending' ? !user.approved : true)
  }, [usersData, filter]);
  
  const StatSkeleton = () => <div className="bg-card border rounded-lg p-5 shadow-sm animate-pulse h-[108px]"></div>;
  
  const loading = usersLoading || statsLoading;
  const error = usersError ? 'Failed to load users' : statsError ? 'Failed to load stats' : '';

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">Platform Overview</h2>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsLoading || !stats ? (
              <><StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
            ) : (
              <>
                <StatCard icon={<UsersIcon className="w-6 h-6"/>} title="Total Users" value={stats.totalUsers} />
                <StatCard icon={<UserPlusIcon className="w-6 h-6"/>} title="Pending Approvals" value={stats.pendingUsers} />
                <StatCard icon={<ClipboardDocumentListIcon className="w-6 h-6"/>} title="Total Assignments" value={stats.assignmentsCount} />
                <StatCard icon={<DocumentArrowUpIcon className="w-6 h-6"/>} title="Total Submissions" value={stats.submissionsCount} />
              </>
            )}
          </div>
        </section>

        <div className="bg-card border rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">User Management</h2>
          
          <div className="flex space-x-2 mb-4 border-b">
              <button 
                  onClick={() => setFilter('all')}
                  className={`py-2 px-4 font-semibold rounded-t-md transition-colors duration-300 ${filter === 'all' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                  All Users
              </button>
              <button 
                  onClick={() => setFilter('pending')}
                  className={`py-2 px-4 font-semibold rounded-t-md transition-colors duration-300 ${filter === 'pending' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                  Pending Approval
              </button>
          </div>

          {usersLoading ? (
            <TableSkeleton cols={5} />
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th scope="col" className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                    <th scope="col" className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                    <th scope="col" className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                    <th scope="col" className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th scope="col" className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium text-foreground">{user.name}</td>
                      <td className="p-4 align-middle text-muted-foreground">{user.email}</td>
                      <td className="p-4 align-middle">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.id, e.target.value as UserRole)}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={user.role === UserRole.Admin}
                        >
                          {Object.values(UserRole).map(role => (
                            <option key={role} value={role}>{ROLES_CONFIG[role].label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 align-middle">
                          {user.approved ? (
                              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/20 text-green-400">Approved</span>
                          ) : (
                              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-yellow-500/20 text-yellow-400">Pending</span>
                          )}
                      </td>
                      <td className="p-4 align-middle space-x-4">
                        {!user.approved && (
                          <button onClick={() => handleApprove(user.id)} className="text-sm font-medium text-primary hover:underline">Approve</button>
                        )}
                        {user.role !== UserRole.Admin && (
                           <button onClick={() => openConfirmDeleteModal(user)} className="text-destructive hover:text-destructive/80">
                               <TrashIcon className="w-5 h-5"/>
                           </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Danger Zone */}
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2 text-destructive">Danger Zone</h2>
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div>
              <p className="font-medium text-foreground">Reset Portal Data</p>
              <p className="text-sm text-muted-foreground">This will permanently delete all assignments and submissions. This action cannot be undone.</p>
            </div>
            <button
              onClick={() => setIsConfirmResetOpen(true)}
              className="mt-4 sm:mt-0 inline-flex items-center justify-center space-x-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 rounded-md text-sm font-medium"
            >
              <ExclamationTriangleIcon className="w-5 h-5"/>
              <span>Reset Portal</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <ConfirmationModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${userToDelete?.name}? This action cannot be undone.`}
      />
      <ConfirmationModal
        isOpen={isConfirmResetOpen}
        onClose={() => setIsConfirmResetOpen(false)}
        onConfirm={handleResetPortal}
        title="Reset Portal Data"
        message="Are you absolutely sure? This will permanently delete ALL assignments and submissions. User accounts will NOT be deleted. This action is irreversible."
      />
    </>
  );
};

export default AdminDashboard;
