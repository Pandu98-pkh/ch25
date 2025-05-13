import React from 'react';
import { Bell, X, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';

interface Notification {
  id: string;
  type: 'upcoming' | 'reminder' | 'alert';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onClose 
}) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'upcoming':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'reminder':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getDateText = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 flex justify-between items-center">
        <h3 className="font-medium text-gray-900 flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id}
              className={`p-4 flex ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
            >
              <div className="flex-shrink-0 mr-4">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                  <span className="text-xs text-gray-500">{getDateText(notification.date)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                {!notification.read && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="mt-2 text-xs text-brand-600 hover:text-brand-800"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-3 bg-gray-50 flex justify-between">
        <button className="text-sm text-gray-600 hover:text-gray-800">
          Mark all as read
        </button>
        <button className="text-sm text-brand-600 hover:text-brand-800">
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationCenter;
