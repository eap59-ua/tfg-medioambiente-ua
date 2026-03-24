import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, MessageSquare, AlertTriangle, ArrowRight } from 'lucide-react';
import notificationService from '../services/notification.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Toast from '../components/common/Toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [filters, setFilters] = useState({ page: 1, limit: 20 });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(filters);
      setNotifications(data.notifications);
      setMeta(data.meta);
      setError(null);
    } catch (err) {
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      setToast({ message: 'Error al marcar como leída', type: 'error' });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setToast({ message: 'Todas marcadas como leídas', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al actualizar notificaciones', type: 'error' });
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'status_change': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'resolution': return <Check className="w-5 h-5 text-green-500" />;
      case 'assignment': return <Bell className="w-5 h-5 text-blue-500" />;
      case 'new_comment': return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case 'vote_milestone': return <CheckCheck className="w-5 h-5 text-red-500" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading && notifications.length === 0) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary-600" />
            Notificaciones
          </h1>
          <p className="text-gray-600 mt-2">Mantente al día con las actualizaciones de tus incidencias.</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button onClick={handleMarkAllAsRead} className="btn-secondary text-sm flex items-center gap-2">
            <CheckCheck className="w-4 h-4" /> Marcar todas como leídas
          </button>
        )}
      </div>

      {error ? (
        <ErrorMessage message={error} />
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300 opacity-50" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Sin notificaciones</h3>
          <p>No tienes notificaciones por el momento.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`p-4 hover:bg-gray-50 transition-colors flex gap-4 ${notif.is_read ? 'opacity-70 bg-gray-50/50' : 'bg-white'}`}
            >
              <div className="mt-1 flex-shrink-0">
                {getIconForType(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm font-semibold ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-sm mb-2 ${notif.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                  {notif.message}
                </p>
                
                <div className="flex items-center gap-4 mt-2">
                  {notif.reference_type === 'incident' && notif.reference_id && (
                    <Link 
                      to={`/incidents/${notif.reference_id}`}
                      className="text-xs font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1"
                    >
                      Ver Incidencia <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                  {!notif.is_read && (
                    <button 
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Marcar como leída
                    </button>
                  )}
                </div>
              </div>
              {!notif.is_read && (
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {meta.pages > 1 && (
            <div className="px-6 py-4 flex justify-between items-center bg-gray-50">
              <button 
                disabled={filters.page === 1}
                onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                className="btn-secondary py-1 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">Página {filters.page} de {meta.pages}</span>
              <button 
                disabled={filters.page >= meta.pages}
                onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                className="btn-secondary py-1 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
