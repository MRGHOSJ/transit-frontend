"use client";

import { useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import debounce from "lodash.debounce";
import { motion, AnimatePresence } from "framer-motion";
import { MapPinIcon } from "@heroicons/react/24/solid";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import SettingsButton from "../components/ui/SettingsButton";
import SettingsPanel from "../components/ui/SettingsPanel";
import { getRoute } from "../lib/api";
import { RoutesResults } from "../components/ui/RouteResults";
import { useLanguage } from "../context/LanguageContext";
import { RouteOption } from "../types/route";

delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

const TILE_STYLES: Record<string, string> = {
  default: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  stadiaLight:
    "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
  stadiaOutdoors:
    "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png",
};

type LatLng = [number, number];
type Place = { display_name: string; lat: string; lon: string };

function ClickToSelect({ onSelect }: { onSelect: (pos: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function MapUI() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  const [from, setFrom] = useState<LatLng | null>(null);
  const [to, setTo] = useState<LatLng | null>(null);

  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");

  const [toSuggestions, setToSuggestions] = useState<Place[]>([]);
  const [fromSuggestions, setFromSuggestions] = useState<Place[]>([]);

  const [selecting, setSelecting] = useState<"from" | "to" | null>(null);

  const [showModeSelect, setShowModeSelect] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<{ routes: RouteOption[] } | null>(
    null
  );
  const [transportModes, setTransportModes] = useState<string[]>([]);

  const { t, isRTL, setLang } = useLanguage();

  const debouncedFetch = useCallback(
    (q: string, type: "from" | "to") => {
      if (!q) return;

      const fetchData = async () => {
        try {
          const res = await axios.get<Place[]>(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              q
            )}&limit=5`
          );
          if (type === "from") {
            setFromSuggestions(res.data);
          } else {
            setToSuggestions(res.data);
          }
        } catch (error) {
          console.error("Error fetching location suggestions:", error);
        }
      };

      // Debounce the fetch function
      const debounced = debounce(fetchData, 300);
      debounced();

      // Cleanup function to cancel any pending debounced calls
      return () => debounced.cancel();
    },
    [] // Add dependencies if needed (e.g., setFromSuggestions, setToSuggestions if they're not stable)
  );

  const handleSubmit = () => {
    if (!from || !to) return alert(t("selectBothLocations"));
    setShowModeSelect(true);
  };

  const handleConfirmMode = async () => {
    if (!from || !to || !selectedMode) return;
    try {
      const route = await getRoute(
        from,
        to,
        transportModes.join(","),
        selectedMode
      );
      setRouteData(route);
      setShowModeSelect(false);
    } catch (error) {
      console.error("❌ Failed to get route:", error);
      alert(t("routeFetchError"));
      setShowModeSelect(false);
    }
  };

  const handleMapPick = (latlng: LatLng) => {
    if (selecting === "from") {
      setFrom(latlng);
      setFromName(`📍 ${latlng[0].toFixed(5)}, ${latlng[1].toFixed(5)}`);
    } else if (selecting === "to") {
      setTo(latlng);
      setToName(`📍 ${latlng[0].toFixed(5)}, ${latlng[1].toFixed(5)}`);
    }
    setSelecting(null);
  };

  const setTransportChange = (modes: string[]) => {
    const newModes = modes.includes("walk") ? modes : [...modes, "walk"];
    setTransportModes(newModes);
  };

  return (
    <div
      className={`relative w-full h-screen bg-gray-100 ${isRTL ? "rtl" : ""}`}
    >
      <SettingsButton onClick={() => setSettingsOpen(true)} />

      {settingsOpen && (
        <SettingsPanel
          onClose={() => setSettingsOpen(false)}
          onThemeChange={setTheme}
          onLangChange={setLang}
          onTransportChange={setTransportChange}
        />
      )}

      <MapContainer
        center={[36.8, 10.18]}
        zoom={13}
        className="absolute top-0 left-0 w-full h-full z-0"
      >
        <TileLayer url={TILE_STYLES[theme]} />
        {from && (
          <Marker position={from}>
            <Popup>{t("start")}</Popup>
          </Marker>
        )}
        {to && (
          <Marker position={to}>
            <Popup>{t("destination")}</Popup>
          </Marker>
        )}
        {selecting && <ClickToSelect onSelect={handleMapPick} />}
      </MapContainer>

      <AnimatePresence>
        {!selecting && !showModeSelect && !routeData && (
          <motion.div
            key="form-overlay"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 bg-white p-6 rounded-xl shadow-xl w-[90%] sm:w-[400px] flex flex-col gap-4"
          >
            <h2 className="text-lg font-semibold text-center text-black">
              {t("planYourTrip")}
            </h2>

            {/* FROM */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("from")}
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => {
                  setFromName(e.target.value);
                  debouncedFetch(e.target.value, "from");
                }}
                placeholder={t("enterStartLocation")}
                className="w-full px-4 py-2 border rounded-lg text-black"
              />
              <MapPinIcon
                onClick={() => setSelecting("from")}
                className="w-5 h-5 absolute right-3 top-9 cursor-pointer text-blue-500"
              />
              {fromSuggestions.length > 0 && (
                <ul className="mt-2 border rounded-md bg-white shadow text-black text-sm max-h-40 overflow-y-auto">
                  {fromSuggestions.map((place) => (
                    <li
                      key={`${place.lat}-${place.lon}`}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={() => {
                        setFrom([+place.lat, +place.lon]);
                        setFromName(place.display_name);
                        setFromSuggestions([]);
                      }}
                    >
                      {place.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* TO */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("to")}
              </label>
              <input
                type="text"
                value={toName}
                onChange={(e) => {
                  setToName(e.target.value);
                  debouncedFetch(e.target.value, "to");
                }}
                placeholder={t("enterDestination")}
                className="w-full px-4 py-2 border rounded-lg text-black"
              />
              <MapPinIcon
                onClick={() => setSelecting("to")}
                className="w-5 h-5 absolute right-3 top-9 cursor-pointer text-red-500"
              />
              {toSuggestions.length > 0 && (
                <ul className="mt-2 border rounded-md bg-white shadow text-black text-sm max-h-40 overflow-y-auto">
                  {toSuggestions.map((place) => (
                    <li
                      key={`${place.lat}-${place.lon}`}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={() => {
                        setTo([+place.lat, +place.lon]);
                        setToName(place.display_name);
                        setToSuggestions([]);
                      }}
                    >
                      {place.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              {t("go")}
            </button>

            <p className="text-xs text-gray-500 text-center">
              {t("pickFromMap")}
            </p>
          </motion.div>
        )}
        {showModeSelect && (
          <motion.div
            key="mode-select-overlay"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md p-6 rounded-t-3xl shadow-2xl flex flex-col gap-5 border-t border-gray-200"
          >
            <h2 className="text-xl font-bold text-center text-gray-800">
              {t("routePreference")}
            </h2>

            <div className="flex justify-center gap-6">
              {[
                { mode: "fast", icon: "⚡", label: t("fastest") },
                { mode: "comfort", icon: "🛋️", label: t("mostComfortable") },
              ].map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`flex flex-col items-center px-5 py-3 rounded-xl shadow-md transition-all text-sm font-medium w-32 
            ${
              selectedMode === mode
                ? "bg-blue-600 text-white scale-105"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="mt-2">{label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleConfirmMode}
              disabled={!selectedMode}
              className={`w-full py-3 mt-4 rounded-xl font-semibold text-lg transition-all 
        ${
          selectedMode
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-102"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
            >
              {t("confirmSelection")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {routeData && (
        <div className="absolute bottom-0 left-0 w-full max-h-[100vh] overflow-y-auto z-30">
          <RoutesResults
            routes={routeData.routes}
            onClose={() => setRouteData(null)}
          />
        </div>
      )}
    </div>
  );
}
