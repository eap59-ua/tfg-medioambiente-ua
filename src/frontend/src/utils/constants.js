/**
 * Constantes de la aplicación EcoAlerta
 */

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
export const UPLOADS_URL = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000';

export const MAP_DEFAULTS = {
  lat: parseFloat(process.env.REACT_APP_MAP_DEFAULT_LAT) || 38.3452,
  lng: parseFloat(process.env.REACT_APP_MAP_DEFAULT_LNG) || -0.4815,
  zoom: parseInt(process.env.REACT_APP_MAP_DEFAULT_ZOOM) || 13,
};

export const SEVERITY_CONFIG = {
  low:      { label: 'Leve',     color: '#27AE60', bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-500' },
  moderate: { label: 'Moderado', color: '#F39C12', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
  high:     { label: 'Grave',    color: '#E67E22', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500' },
  critical: { label: 'Crítico',  color: '#E74C3C', bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-500' },
};

export const STATUS_CONFIG = {
  pending:     { label: 'Pendiente',   bg: 'bg-gray-100',   text: 'text-gray-800' },
  validated:   { label: 'Validada',    bg: 'bg-blue-100',   text: 'text-blue-800' },
  assigned:    { label: 'Asignada',    bg: 'bg-indigo-100', text: 'text-indigo-800' },
  in_progress: { label: 'En progreso', bg: 'bg-purple-100', text: 'text-purple-800' },
  resolved:    { label: 'Resuelta',    bg: 'bg-green-100',  text: 'text-green-800' },
  rejected:    { label: 'Rechazada',   bg: 'bg-red-100',    text: 'text-red-800' },
  duplicate:   { label: 'Duplicada',   bg: 'bg-yellow-100', text: 'text-yellow-800' },
};

export const CATEGORIES = [
  { id: 1,  name: 'Vertido ilegal',               icon: 'Trash2',        color: '#E74C3C' },
  { id: 2,  name: 'Contaminación de agua',         icon: 'Droplet',       color: '#3498DB' },
  { id: 3,  name: 'Contaminación del aire',        icon: 'Wind',          color: '#95A5A6' },
  { id: 4,  name: 'Incendio forestal / quema',     icon: 'Flame',         color: '#FF6B35' },
  { id: 5,  name: 'Daño forestal (tala ilegal)',    icon: 'TreePine',      color: '#27AE60' },
  { id: 6,  name: 'Residuos abandonados',          icon: 'Package',       color: '#F39C12' },
  { id: 7,  name: 'Animales abandonados/maltratados', icon: 'PawPrint',   color: '#E67E22' },
  { id: 8,  name: 'Ruido excesivo',                icon: 'Volume2',       color: '#9B59B6' },
  { id: 9,  name: 'Infraestructura dañada',        icon: 'Construction',  color: '#E67E22' },
  { id: 10, name: 'Residuos peligrosos',           icon: 'AlertTriangle', color: '#C0392B' },
  { id: 11, name: 'Fauna en peligro (hábitat)',     icon: 'Bird',          color: '#1ABC9C' },
  { id: 12, name: 'Otro',                          icon: 'HelpCircle',    color: '#34495E' },
];
