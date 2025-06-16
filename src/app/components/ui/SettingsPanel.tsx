"use client";

import { motion } from "framer-motion";
import Flag from "react-world-flags";
import { useState } from "react";
import { TileLayer } from "react-leaflet";
import ThemeTilePreview from "./ThemeTilePreview";
import { useLanguage } from "../../context/LanguageContext";

export default function SettingsPanel({
  isOpen,
  onClose,
  onThemeChange,
  onLangChange,
  onTransportChange,
}: any) {
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const [selectedTransports, setSelectedTransports] = useState<string[]>([
    "metro",
    "bus",
  ]);
  const { t } = useLanguage();

  const TILE_STYLES = {
    default: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    stadiaLight:
      "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
    stadiaOutdoors:
      "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png",
  };

  const themes = [
    { value: "default", label: t("default") },
    { value: "dark", label: t("dark") },
    { value: "light", label: t("light") },
    { value: "stadiaLight", label: t("stadiaLight") },
    { value: "stadiaOutdoors", label: t("stadiaOutdoors") },
  ];

  const languages = [
    { code: "US", label: "English", value: "en" },
    { code: "FR", label: "Français", value: "fr" },
    { code: "TN", label: "العربية", value: "ar" },
  ];

  const transports = [
    { value: "bus", label: t("bus"), icon: "🚌" },
    { value: "metro", label: t("metro"), icon: "🚇" },
    { value: "taxiCollectif", label: t("taxiCollectif"), icon: "🚕" },
  ];

  function handleThemeSelect(themeValue: string) {
    setSelectedTheme(themeValue);
    onThemeChange(themeValue);
  }

  function toggleTransport(value: string) {
    let newSelected: string[];
    if (selectedTransports.includes(value)) {
      newSelected = selectedTransports.filter((v) => v !== value);
    } else {
      newSelected = [...selectedTransports, value];
    }
    setSelectedTransports(newSelected);
    onTransportChange && onTransportChange(newSelected);
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 right-0 w-72 h-full text-black bg-white shadow-xl z-30 p-6 flex flex-col gap-6 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t("settings")}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          ✕
        </button>
      </div>

      {/* Transport Mode Multi-Select */}
      <div>
        <label className="block mb-2 font-medium">{t("transportMode")}</label>
        <div className="grid grid-cols-3 gap-3">
          {transports.map(({ value, label, icon }) => {
            const selected = selectedTransports.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleTransport(value)}
                className={`p-4 rounded shadow cursor-pointer flex flex-col items-center justify-center
                  border-2 ${
                    selected
                      ? "border-blue-500 ring-2 ring-blue-300 bg-blue-50"
                      : "border-transparent hover:border-gray-400"
                  }`}
              >
                <div className="text-3xl mb-2">{icon}</div>
                <div className="text-sm font-semibold">{label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Theme */}
      <div>
        <label className="block mb-2 font-medium">{t("mapTheme")}</label>
        <div className="grid grid-cols-2 gap-3">
          {themes.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleThemeSelect(value)}
              className={`p-4 rounded shadow cursor-pointer flex flex-col items-center justify-center
                border-2 ${
                  selectedTheme === value
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : "border-transparent hover:border-gray-400"
                }`}
              style={{
                backgroundColor:
                  value === "default"
                    ? "#e2e8f0"
                    : value === "dark"
                    ? "#2d3748"
                    : value === "light"
                    ? "#f7fafc"
                    : value === "stadiaLight"
                    ? "#f5f7fa"
                    : value === "stadiaOutdoors"
                    ? "#d4f1f9"
                    : "#eee",
                color: value === "dark" ? "white" : "black",
              }}
            >
              <div className="mb-2 text-sm font-semibold">{label}</div>
              <ThemeTilePreview theme={value as keyof typeof TILE_STYLES} />
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block mb-1 font-medium">{t("language")}</label>
        <div className="flex gap-4">
          {languages.map(({ code, label, value }) => (
            <button
              key={code}
              onClick={() => onLangChange(value)}
              title={label}
              className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-500 focus:outline-none flex items-center justify-center p-0"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Flag code={code} style={{ width: "100%", height: "100%" }} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}