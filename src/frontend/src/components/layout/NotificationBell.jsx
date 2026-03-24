import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import notificationService from '../../services/notification.service';
import { useAuth } from '../../hooks/useAuth';

export default function NotificationBell({ isMobile = false }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const data = await notificationService.getNotifications({ isRead: false, limit: 1 });
        setUnreadCount(data.meta.total);
      } catch (err) {
        // Silently fail for polling
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <Link 
      to="/notifications" 
      className={`relative flex items-center justify-center transition-colors \${
        isMobile 
          ? 'w-full px-3 py-2 text-white hover:bg-white/10 rounded-lg justify-start gap-2 text-sm' 
          : 'p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg'
      }`}
      title="Notificaciones"
    >
      <Bell className="w-5 h-5" />
      {isMobile && <span>Notificaciones</span>}
      
      {unreadCount > 0 && (
        <span className={`absolute flex items-center justify-center bg-red-500 text-white font-bold rounded-full text-[10px] \${
          isMobile ? 'static ml-auto px-2 py-0.5' : 'top-1 right-1 w-4 h-4'
        }`}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
