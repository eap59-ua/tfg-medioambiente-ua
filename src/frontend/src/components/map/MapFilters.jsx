import React from 'react';
import { CATEGORIES, SEVERITY_CONFIG, STATUS_CONFIG } from '../../utils/constants';
import { Filter, X, RotateCcw } from 'lucide-react';

export default function MapFilters({ filters, onChange, onClear, resultCount, isOpen, onToggle }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <>
      {/* Toggle button (mobile & desktop) */}
      <button
        onClick={onToggle}
        className="absolute top-4 left-4 z-[1001] bg-white shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Filter className="w-4 h-4" />
        Filtros
        {resultCount !== undefined && (
          <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">{resultCount}</span>
        )}
      </button>

      {/* Filter panel */}
      {isOpen && (
        <div className="absolute top-4 left-4 z-[1002] bg-white rounded-xl shadow-2xl w-72 max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between rounded-t-xl">
            <h3 className="font-semibold text-gray-900">Filtros</h3>
            <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
          </div>

          <div className="p-4 space-y-4">
            {/* Severidad */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Severidad</label>
              <div className="mt-2 space-y-1">
                {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
                  <label key={key} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="radio"
                      name="severity"
                      checked={filters.severity === key}
                      onChange={() => handleChange('severity', filters.severity === key ? '' : key)}
                      className="text-primary-500 focus:ring-primary-500"
                    />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="text-sm text-gray-700">{cfg.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
                className="mt-2 w-full rounded-lg border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</label>
              <select
                value={filters.categoryId || ''}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                className="mt-2 w-full rounded-lg border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Ordenar */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ordenar por</label>
              <select
                value={filters.sortBy || 'created_at'}
                onChange={(e) => handleChange('sortBy', e.target.value)}
                className="mt-2 w-full rounded-lg border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="created_at">Más recientes</option>
                <option value="priority_score">Prioridad</option>
                <option value="vote_count">Más votadas</option>
              </select>
            </div>

            {/* Clear */}
            <button
              onClick={onClear}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </>
  );
}
