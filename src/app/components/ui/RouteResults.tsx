import React, { useState } from "react";
import { RouteOption, RouteSegment, TransportType } from "../../types/route";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

interface RoutesResultsProps {
  routes: RouteOption[];
  onClose: () => void;
}

export function RoutesResults({ routes, onClose }: RoutesResultsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const modeIcon = (mode: TransportType) => {
    switch (mode) {
      case "bus":
        return <span className="w-6 h-6 text-blue-600">🚌</span>;
      case "metro":
        return <span className="w-6 h-6 text-purple-600">🚇</span>;
      case "walk":
        return <span className="w-6 h-6 text-gray-500">🚶‍♂️</span>;
      default:
        return null;
    }
  };

  const formatDuration = (mins: number) => {
    if (mins < 60) return t("duration", { minutes: Math.round(mins) });
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return t("hoursMinutes", { hours: h, minutes: m });
  };

  const formatDistance = (km: number) => {
    return km < 1 
      ? t("distanceMeters", { meters: Math.round(km * 1000) })
      : t("distance", { distance: km.toFixed(1) });
  };

  const handleConfirm = (index: number) => {
    alert("route Confirmed");
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl p-6 my-4 text-gray-800"
    >
      <header className="mb-4 border-b pb-3 flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("routeSuggestions")}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 text-lg transition"
        >
          ✕
        </button>
      </header>

      <motion.ul layout className="space-y-4">
        {routes.map((route, i) => (
          <motion.li
            layout
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`p-4 rounded-xl border cursor-pointer shadow-sm ${
              i === selectedIndex
                ? "bg-blue-50 border-blue-400"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedIndex(i === selectedIndex ? null : i)}
          >
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-700">
                {t("routeNumber", { number: i + 1 })}
              </span>
              <span className="text-gray-600">
                {formatDuration(route.total_duration)} &nbsp;|&nbsp;
                {formatDistance(route.total_distance)} &nbsp;|&nbsp;
                {t("transfers", { count: route.transfers })}
              </span>
            </div>

            <AnimatePresence>
              {i === selectedIndex && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden mt-4"
                >
                  <motion.ol layout className="space-y-4">
                    {route.segments.map((seg: RouteSegment, idx: number) => (
                      <motion.li
                        layout
                        key={`${seg.from.station_id}-${seg.to.station_id}-${idx}`}
                        className="p-4 bg-white border shadow rounded-lg flex gap-4 items-start"
                      >
                        <div className="mt-1">{modeIcon(seg.mode)}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {seg.from.name} → {seg.to.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {seg.line && (
                              <span>
                                {t("line", { line: seg.line })} &nbsp;&middot;&nbsp;
                              </span>
                            )}
                            {formatDuration(seg.duration)} &nbsp;&middot;&nbsp;
                            {formatDistance(seg.distance)}
                          </div>
                          <p className="mt-2 text-sm italic text-gray-700">
                            {seg.instructions}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ol>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 flex justify-end"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirm(i);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
                    >
                      {t("confirmRoute")}
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}