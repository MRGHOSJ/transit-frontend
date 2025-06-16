// lib/api.ts
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api/v1";

const api = axios.create({
  baseURL, // replace with your backend
  timeout: 10000,
});

export const getRoute = async (
  from: [number, number],
  to: [number, number],
  mode: string,   // e.g. "metro,bus,walk"
  prefs: string   // e.g. "fast", "comfort"
) => {
  const params = {
    from: from.join(","),
    to: to.join(","),
    mode,
    prefs,
  };

  const response = await api.get("/routes", { params });
  return response.data;
};