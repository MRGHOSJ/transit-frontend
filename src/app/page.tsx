'use client';

import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import MapView (avoids SSR issues with Leaflet)
const MapView = dynamic(() => import('./pages/MapView'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_20px] items-center justify-items-center min-h-screen p-0 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full h-[400px] sm:h-[600px]">
        <MapView />
      </div>
    </div>
  );
}
