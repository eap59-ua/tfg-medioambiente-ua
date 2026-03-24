import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { MAP_DEFAULTS } from '../../utils/constants';

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) { map.setView(center, zoom || map.getZoom()); }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ children, center, zoom, className = 'map-container' }) {
  const mapCenter = center || [MAP_DEFAULTS.lat, MAP_DEFAULTS.lng];
  const mapZoom = zoom || MAP_DEFAULTS.zoom;

  return (
    <MapContainer center={mapCenter} zoom={mapZoom} className={className} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {center && <ChangeView center={center} zoom={zoom} />}
      {children}
    </MapContainer>
  );
}
