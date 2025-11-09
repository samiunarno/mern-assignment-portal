
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import AdminDashboard from './dashboards/AdminDashboard';
import MonitorDashboard from './dashboards/MonitorDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import Layout from '../components/Layout';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case UserRole.Admin:
        return <AdminDashboard />;
      case UserRole.Monitor:
        return <MonitorDashboard />;
      case UserRole.Student:
        return <StudentDashboard />;
      default:
        return <div>Invalid user role.</div>;
    }
  };

  return (
    <Layout>
      {user ? renderDashboard() : <div>Loading...</div>}
    </Layout>
  );
};

export default DashboardPage;
