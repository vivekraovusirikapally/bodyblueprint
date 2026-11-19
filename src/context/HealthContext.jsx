import { createContext, useContext, useEffect, useState } from "react";
import sample from "../data/sample.json";
import { dateKey, todayKey } from "../lib/health";

const HealthContext = createContext(null);
const STORAGE_KEY = "bodyblueprint:v1";

const emptyDay = { waterMl: 0, sleepHours: 0, rating: 0, bed: "", wake: "" };

// First launch: fill in the last 14 days with the sample student data
function buildSeed() {
  const logs = {};
  sample.forEach((row) => {
    const d = new Date();
    d.setDate(d.getDate() - row.daysAgo);
    logs[dateKey(d)] = {
      waterMl: row.waterMl,
      sleepHours: row.sleepHours,
      rating: row.rating,
      weightKg: row.weightKg,
    };
  });
  return {
    profile: { heightCm: 175, weightKg: 72, age: 27, sex: "male", unit: "metric", goal: "maintain" },
    logs,
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn("Could not read saved data, starting fresh", err);
  }
  return buildSeed();
}

export function HealthProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const today = { ...emptyDay, ...(state.logs[todayKey()] || {}) };

  const updateToday = (patch) =>
    setState((prev) => ({
      ...prev,
      logs: {
        ...prev.logs,
        [todayKey()]: { ...emptyDay, ...(prev.logs[todayKey()] || {}), ...patch },
      },
    }));

  const saveProfile = (profile) =>
    setState((prev) => {
      const next = { ...prev, profile: { ...prev.profile, ...profile } };
      // only touch today's weight when the weight itself changed
      if (profile.weightKg !== undefined) {
        next.logs = {
          ...prev.logs,
          [todayKey()]: { ...emptyDay, ...(prev.logs[todayKey()] || {}), weightKg: profile.weightKg },
        };
      }
      return next;
    });

  const addWater = (ml) => updateToday({ waterMl: Math.max(0, today.waterMl + ml) });
  const saveSleep = (data) => updateToday(data);
  const resetAll = () => setState(buildSeed());

  const value = {
    profile: state.profile,
    logs: state.logs,
    today,
    saveProfile,
    addWater,
    saveSleep,
    setUnit: (unit) => saveProfile({ unit }),
    resetAll,
  };
  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export const useHealth = () => useContext(HealthContext);
