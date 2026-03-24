import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Camera, X, Upload, MapPin, Loader2 } from 'lucide-react';
import * as incidentService from '../services/incident.service';
import { useGeolocation } from '../hooks/useGeolocation';
import { CATEGORIES, SEVERITY_CONFIG, MAP_DEFAULTS } from '../utils/constants';
import Toast from '../components/common/Toast';

function LocationPicker({ position, onPositionChange }) {
  useMapEvents({
    click(e) { onPositionChange([e.latlng.lat, e.latlng.lng]); },
  });
  return position ? <Marker position={position} /> : null;
}

export default function CreateIncidentPage() {
  const navigate = useNavigate();
  const { latitude, longitude, requestLocation } = useGeolocation();
  const [form, setForm] = useState({
    title: '', description: '', categoryId: '', severity: 'moderate', isAnonymous: false,
  });
  const [position, setPosition] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const handleUseMyLocation = useCallback(() => {
    requestLocation();
    setPosition([latitude, longitude]);
  }, [requestLocation, latitude, longitude]);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - photos.length);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPhotos([...photos, ...files]);
    setPreviews([...previews, ...newPreviews]);
  };

  const removePhoto = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setPhotos(photos.filter((_, i) => i !== idx));
    setPreviews(previews.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const errs = {};
    if (!form.title || form.title.length < 5) errs.title = 'Mínimo 5 caracteres';
    if (!form.description || form.description.length < 10) errs.description = 'Mínimo 10 caracteres';
    if (!form.categoryId) errs.categoryId = 'Selecciona una categoría';
    if (!position) errs.position = 'Selecciona la ubicación en el mapa';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('categoryId', form.categoryId);
      formData.append('severity', form.severity);
      formData.append('latitude', position[0]);
      formData.append('longitude', position[1]);
      formData.append('isAnonymous', form.isAnonymous);
      photos.forEach((p) => formData.append('photos', p));

      const result = await incidentService.createIncident(formData);
      navigate(`/incidents/${result.id}`);
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Error al crear la incidencia', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reportar incidencia</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Ej: Vertido ilegal en el río..." maxLength={200} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 ${errors.description ? 'border-red-500' : ''}`}
              rows={4} placeholder="Describe el problema con detalle..." maxLength={5000} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className={`w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 ${errors.categoryId ? 'border-red-500' : ''}`}>
              <option value="">Selecciona una categoría</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
          </div>

          {/* Severidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severidad *</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
                <button key={key} type="button" onClick={() => setForm({ ...form, severity: key })}
                  className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${form.severity === key ? `${cfg.border} ${cfg.bg} ${cfg.text}` : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <span className="w-2.5 h-2.5 rounded-full inline-block mr-1" style={{ backgroundColor: cfg.color }} />
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación * <span className="text-gray-400 font-normal">— Haz click en el mapa</span></label>
            <div className={`rounded-xl overflow-hidden border-2 ${errors.position ? 'border-red-500' : 'border-gray-200'}`}>
              <div className="h-64">
                <MapContainer center={[MAP_DEFAULTS.lat, MAP_DEFAULTS.lng]} zoom={MAP_DEFAULTS.zoom} className="w-full h-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker position={position} onPositionChange={setPosition} />
                </MapContainer>
              </div>
            </div>
            <button type="button" onClick={handleUseMyLocation} className="mt-2 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
              <MapPin className="w-4 h-4" /> Usar mi ubicación
            </button>
            {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
          </div>

          {/* Fotos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fotos (máx. 5)</label>
            <div className="flex flex-wrap gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                  <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-black/50 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <Camera className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Añadir</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Anónimo */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
              className="rounded text-primary-500 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">Reportar como anónimo</span>
          </label>

          {/* Submit */}
          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</> : <><Upload className="w-5 h-5" /> Enviar reporte</>}
          </button>
        </form>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
