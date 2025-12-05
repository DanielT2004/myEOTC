
import React, { useEffect, useRef, useState } from 'react';
import { Church } from '../types';
import { Loader2 } from 'lucide-react';

interface ChurchMapProps {
  churches: Church[];
  onViewDetails: (church: Church) => void;
  center?: { lat: number; lng: number };
}

declare global {
  interface Window {
    L: any;
  }
}

export const ChurchMap: React.FC<ChurchMapProps> = ({ churches, onViewDetails, center }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default center (Los Angeles) since we updated mock data to LA
  const defaultCenter = [34.0522, -118.2437];

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Check if Leaflet is loaded
    if (!window.L) {
      console.error("Leaflet not loaded");
      return;
    }

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapRef.current).setView(
        center ? [center.lat, center.lng] : defaultCenter, 
        10
      );

      // Add OpenStreetMap tiles
      const tileLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });

      // Hide loader when tiles finish loading
      tileLayer.on('load', () => {
        setIsLoading(false);
      });

      tileLayer.addTo(mapInstanceRef.current);

      // Fallback: If tiles load very quickly or event misses, ensure loader clears
      setTimeout(() => setIsLoading(false), 1500);

    } else if (center) {
        // Update center if prop changes
        mapInstanceRef.current.setView([center.lat, center.lng], 12);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Custom Icon (Simple implementation without external images to avoid broken links)
    const createCustomIcon = () => {
        return window.L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #0f172a; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">✝</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });
    };

    // Add markers for each church
    churches.forEach(church => {
      const marker = window.L.marker([church.coordinates.lat, church.coordinates.lng], {
        icon: createCustomIcon()
      })
      .addTo(mapInstanceRef.current)
      .bindPopup(`
        <div class="p-2 min-w-[200px]">
          <h3 class="font-bold text-base mb-1">${church.name}</h3>
          <p class="text-sm text-gray-600 mb-2">${church.address}</p>
          <button 
            id="popup-btn-${church.id}"
            class="w-full bg-slate-900 text-white text-xs py-1.5 px-3 rounded hover:bg-slate-800 transition-colors"
          >
            View Details
          </button>
        </div>
      `);

      // Add event listener for the button inside the popup
      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${church.id}`);
        if (btn) {
          btn.onclick = () => onViewDetails(church);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if there are churches
    if (churches.length > 0 && !center) {
       const group = window.L.featureGroup(markersRef.current);
       try {
           mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
       } catch(e) {
           console.log("Could not fit bounds", e);
       }
    }

    // Cleanup
    return () => {
      // We don't destroy the map here to preserve state if simple re-renders happen, 
      // but strictly we should if the component unmounts. 
      // For this simplified app, we'll keep the instance unless the ref node changes.
    };
  }, [churches, center, onViewDetails]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 relative z-0 bg-gray-100">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-50">
          {/* Background Image Placeholder */}
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center filter blur-sm"
            style={{ backgroundImage: 'url("https://www.openstreetmap.org/assets/about/osm-a754247551062b325244304859a8c17b.png")' }}
          ></div>
          
          <div className="relative z-10 flex flex-col items-center p-6 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200">
             <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
             <p className="text-slate-900 font-semibold text-sm">Loading Map...</p>
          </div>
        </div>
      )}

      <div ref={mapRef} className="h-full w-full" style={{ minHeight: '500px' }}></div>
    </div>
  );
};
