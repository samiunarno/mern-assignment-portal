
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
// FIX: Import the RTK Query mutation hook for updating the password.
import { useUpdatePasswordMutation } from '../services/api';
import { ROLES_CONFIG } from '../constants';
import { UserRole } from '../types';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    // FIX: Use the RTK Query mutation hook.
    const [updatePassword, { isLoading: loading }] = useUpdatePasswordMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            setError('New password must be at least 8 characters long.');
            return;
        }

        try {
            // FIX: Call the mutation trigger function.
            const response = await updatePassword({ currentPassword, newPassword, confirmPassword }).unwrap();
            addNotification(response.message, 'success');
            // Clear fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            const errorMessage = (err as any)?.data?.message || (err as Error).message;
            setError(errorMessage);
            addNotification(errorMessage, 'error');
        }
    };

    if (!user) {
        return <Layout><div>Loading user profile...</div></Layout>;
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeInUp">
                <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>

                {/* User Information Section */}
                <div className="bg-card border rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4 text-card-foreground">My Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Full Name</label>
                            <p className="mt-1 text-lg text-foreground">{user.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Email Address</label>
                            <p className="mt-1 text-lg text-foreground">{user.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Role</label>
                            <p className="mt-1">
                                <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full text-white inline-block ${ROLES_CONFIG[user.role as UserRole].color}`}>
                                    {ROLES_CONFIG[user.role as UserRole].label}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Change Password Section */}
                <div className="bg-card border rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4 text-card-foreground">Change Password</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                        <div>
                            <label htmlFor="current-password" className="block text-sm font-medium leading-6 text-muted-foreground">Current Password</label>
                            <input
                                id="current-password"
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium leading-6 text-muted-foreground">New Password</label>
                            <input
                                id="new-password"
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium leading-6 text-muted-foreground">Confirm New Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center rounded-md text-sm font-semibold h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default ProfilePage;
