import React, { useEffect, useRef } from 'react';
import { GeoKPI } from '../types';
import { Wifi, Layers } from 'lucide-react';

interface NetworkMapProps {
  data: GeoKPI[];
}

// Leaflet is loaded via CDN in index.html, so we define it here to avoid TypeScript errors
declare global {
  interface Window {
    L: any;
  }
}

export const NetworkMap: React.FC<NetworkMapProps> = ({ data }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    // Initialize Map only once
    if (!mapInstanceRef.current) {
      const L = window.L;
      // Default view center (Taipei 101 approx)
      const map = L.map(mapContainerRef.current).setView([25.033964, 121.564468], 13);

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    // Update markers when data changes
    if (mapInstanceRef.current && layerGroupRef.current) {
      const L = window.L;
      const layerGroup = layerGroupRef.current;
      
      // Clear existing markers
      layerGroup.clearLayers();

      // Determine color based on RSRP value
      const getColor = (rsrp: number) => {
        if (rsrp >= -80) return '#10b981'; // Green (Excellent)
        if (rsrp >= -95) return '#f59e0b'; // Amber (Good/Fair)
        if (rsrp >= -110) return '#f97316'; // Orange (Poor)
        return '#ef4444'; // Red (Bad)
      };

      // Add Circle Markers
      data.forEach(point => {
        const color = getColor(point.value);
        
        const marker = L.circleMarker([point.lat, point.lng], {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.7
        });

        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-sm mb-1">Cell ID: ${point.cellId || 'N/A'}</h3>
            <p class="text-xs">RSRP: <span style="color:${color}; font-weight:bold">${point.value} dBm</span></p>
            <p class="text-xs text-gray-500">Lat: ${point.lat.toFixed(5)}</p>
            <p class="text-xs text-gray-500">Lng: ${point.lng.toFixed(5)}</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(layerGroup);
      });

      // Fit bounds if data exists
      if (data.length > 0) {
        const bounds = L.latLngBounds(data.map(p => [p.lat, p.lng]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    // Cleanup on unmount (optional, but good practice if component is destroyed)
    return () => {
      // We generally don't destroy the map instance in React strict mode to avoid flash re-renders, 
      // but we could mapInstanceRef.current.remove() if needed. 
      // For now, we leave it to persist or let garbage collector handle it if the node is removed.
    };
  }, [data]);

  return (
    <div className="p-6 h-full flex flex-col max-w-[1600px] mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
             <Layers className="w-6 h-6 text-telco-600" />
             Coverage Heatmap
          </h1>
          <p className="text-slate-500 dark:text-slate-400">RSRP Signal Strength Visualization</p>
        </div>
        <div className="flex items-center gap-4 text-sm bg-white dark:bg-carddark p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
           <span className="font-semibold text-slate-700 dark:text-slate-300">Legend:</span>
           <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Excellent (&gt;-80)</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Good (-80 to -95)</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Poor (-95 to -110)</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Bad (&lt;-110)</div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-carddark rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative z-0">
        <div id="map-container" ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0"></div>
        
        {/* Loading Overlay if no data */}
        {data.length === 0 && (
          <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-center z-[1000]">
             <div className="flex flex-col items-center">
                <Wifi className="w-8 h-8 text-slate-400 mb-2 animate-pulse" />
                <p className="text-slate-500 font-medium">No Geo Data Available</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};