import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { enUS, id } from 'date-fns/locale';
import { Bell, Check, CheckCheck, Trash2, Info, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useNotifications, Notification } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils/cn';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  // Helper to get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Format relative time with the correct locale
  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: language === 'id' ? id : enUS
    });
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          <h3 className="font-medium">{t('notifications.title')}</h3>
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-white text-indigo-700 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors mr-1"
              title={t('notifications.markAllRead')}
            >
              <CheckCheck className="h-4 w-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">{t('notifications.empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={cn(
                  "p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                  notification.read ? 'bg-white' : 'bg-indigo-50/50'
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={cn(
                        "text-sm font-medium",
                        notification.read ? 'text-gray-800' : 'text-indigo-700'
                      )}>
                        {notification.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600 transition-colors"
                            title={t('notifications.markAsRead')}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                          title={t('notifications.remove')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTime(notification.date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={clearAll}
            className="text-xs text-red-600 hover:text-red-800 transition-colors"
          >
            {t('notifications.clearAll')}
          </button>
          <button
            onClick={onClose}
            className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
          >
            {t('notifications.close')}
          </button>
        </div>
      )}
    </div>
  );
}
