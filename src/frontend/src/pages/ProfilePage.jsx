import React from 'react';
import { User, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-green-500 h-32" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.display_name} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary-600">{user.display_name?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-xl font-bold text-gray-900">{user.display_name}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            {user.bio && (
              <p className="mt-4 text-gray-600">{user.bio}</p>
            )}

            <div className="mt-6 flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Desde {new Date(user.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
