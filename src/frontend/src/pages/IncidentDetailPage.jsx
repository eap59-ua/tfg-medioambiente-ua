import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { ThumbsUp, Bell, BellOff, Clock, MessageCircle, ArrowLeft, Edit, Trash2, Send } from 'lucide-react';
import * as incidentService from '../services/incident.service';
import SeverityBadge from '../components/incidents/SeverityBadge';
import StatusBadge from '../components/incidents/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Toast from '../components/common/Toast';
import { useAuth } from '../hooks/useAuth';
import { UPLOADS_URL, CATEGORIES } from '../utils/constants';

export default function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [incident, setIncident] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [inc, commentsData, hist] = await Promise.all([
          incidentService.getIncidentById(id),
          incidentService.getComments(id),
          incidentService.getStatusHistory(id),
        ]);
        setIncident(inc);
        setComments(commentsData.comments || []);
        setHistory(hist || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Error cargando la incidencia');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleVote = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      if (incident.has_voted) {
        const result = await incidentService.unvoteIncident(id);
        setIncident({ ...incident, has_voted: false, vote_count: result.voteCount });
      } else {
        const result = await incidentService.voteIncident(id);
        setIncident({ ...incident, has_voted: true, vote_count: result.voteCount });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Error', type: 'error' });
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      if (incident.is_following) {
        await incidentService.unfollowIncident(id);
        setIncident({ ...incident, is_following: false });
      } else {
        await incidentService.followIncident(id);
        setIncident({ ...incident, is_following: true });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Error', type: 'error' });
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const comment = await incidentService.addComment(id, newComment.trim());
      setComments([...comments, comment]);
      setNewComment('');
      setToast({ message: 'Comentario añadido', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Error', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta incidencia?')) return;
    try {
      await incidentService.deleteIncident(id);
      navigate('/my-incidents');
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Error eliminando', type: 'error' });
    }
  };

  if (loading) return <LoadingSpinner message="Cargando incidencia..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!incident) return <ErrorMessage message="Incidencia no encontrada" />;

  const isAuthor = user?.id === incident.reporter_id;
  const position = [parseFloat(incident.latitude), parseFloat(incident.longitude)];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          {isAuthor && incident.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            </div>
          )}
        </div>

        {/* Photos */}
        {incident.photos?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6 rounded-xl overflow-hidden">
            {incident.photos.map((photo, i) => (
              <img key={photo.id} src={`${UPLOADS_URL}${photo.photo_url}`} alt={photo.caption || `Foto ${i+1}`}
                className={`w-full object-cover cursor-pointer hover:opacity-90 transition-opacity ${i === 0 ? 'col-span-2 h-64' : 'h-32'}`}
                onClick={() => setSelectedPhoto(photo)}
              />
            ))}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <SeverityBadge severity={incident.severity} size="lg" />
            <StatusBadge status={incident.status} />
            {incident.category_name && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: incident.category_color }} />
                {incident.category_name}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{incident.title}</h1>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{incident.description}</p>

          {/* Reporter */}
          {incident.reporter_name && !incident.is_anonymous && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
                {incident.reporter_name[0]}
              </div>
              <span>{incident.reporter_name}</span>
              <span>·</span>
              <span>{new Date(incident.created_at).toLocaleDateString('es-ES')}</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex items-center gap-3 border-t pt-4">
            <button onClick={handleVote} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${incident.has_voted ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <ThumbsUp className="w-4 h-4" /> {incident.vote_count || 0}
            </button>
            <button onClick={handleFollow} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${incident.is_following ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {incident.is_following ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              {incident.is_following ? 'Siguiendo' : 'Seguir'}
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="h-48">
            <MapContainer center={position} zoom={15} className="w-full h-full" scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position} />
            </MapContainer>
          </div>
          {incident.address && (
            <p className="px-4 py-2 text-sm text-gray-500">{incident.address}</p>
          )}
        </div>

        {/* Status history */}
        {history.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Historial</h2>
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-700"><StatusBadge status={h.old_status} /> → <StatusBadge status={h.new_status} /></span>
                    {h.note && <p className="text-gray-500 mt-0.5">{h.note}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(h.created_at).toLocaleString('es-ES')} — {h.changed_by_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> Comentarios ({comments.length})
          </h2>
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className={`p-3 rounded-lg ${c.is_official ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{c.user_display_name}</span>
                  {c.is_official && <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">Oficial</span>}
                  <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString('es-ES')}</span>
                </div>
                <p className="text-sm text-gray-700">{c.content}</p>
              </div>
            ))}
            {comments.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No hay comentarios aún</p>}
          </div>

          {isAuthenticated && (
            <form onSubmit={handleComment} className="mt-4 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 rounded-lg border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
              <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <img src={`${UPLOADS_URL}${selectedPhoto.photo_url}`} alt={selectedPhoto.caption} className="max-w-full max-h-[90vh] rounded-lg" />
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
