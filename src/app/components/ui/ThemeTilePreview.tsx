"use client";

import { MapContainer, TileLayer } from "react-leaflet";

const TILE_STYLES = {
  default: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  stadiaLight: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
  stadiaOutdoors: "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png",
};

interface ThemeTilePreviewProps {
  theme: keyof typeof TILE_STYLES;
}

export default function ThemeTilePreview({ theme }: ThemeTilePreviewProps) {
  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      zoomControl={false}
      style={{ width: 100, height: 100, borderRadius: 8 }}
      attributionControl={false}
      touchZoom={false}
    >
      <TileLayer url={TILE_STYLES[theme]} />
    </MapContainer>
  );
}