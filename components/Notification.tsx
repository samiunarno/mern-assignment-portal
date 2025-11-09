import React from 'react';
import { useNotification } from '../hooks/useNotification';
import type { Notification } from '../context/NotificationContext';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from './icons/Icons';

const NOTIFICATION_STYLES = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
  },
  error: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    text: 'text-destructive',
    icon: <ExclamationTriangleIcon className="w-6 h-6 text-destructive" />,
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
  },
};

const NotificationItem: React.FC<{ notification: Notification; onRemove: (id: number) => void }> = ({ notification, onRemove }) => {
  const styles = NOTIFICATION_STYLES[notification.type];

  return (
    <div className={`relative w-full max-w-sm p-4 mb-4 rounded-lg shadow-lg bg-card border ${styles.border} transform transition-all duration-300 animate-fade-in-right`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{styles.icon}</div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className={`text-sm font-medium text-foreground`}>{notification.message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button onClick={() => onRemove(notification.id)} className={`inline-flex rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-ring text-muted-foreground hover:text-foreground`}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed inset-0 flex items-end justify-end px-4 py-6 pointer-events-none sm:p-6 z-50">
      <div className="w-full max-w-sm">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onRemove={removeNotification} />
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;