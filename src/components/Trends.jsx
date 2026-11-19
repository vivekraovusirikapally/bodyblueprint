import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { useHealth } from "../context/HealthContext.jsx";
import { dateKey } from "../lib/health.js";

Chart.register(...registerables);

export default function Trends() {
  const { logs } = useHealth();
  const canvas = useRef(null);

  useEffect(() => {
    // last 7 days, oldest first
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(dateKey(d));
    }
    const pick = (field, fn = (x) => x) => days.map((k) => (logs[k]?.[field] ? fn(logs[k][field]) : null));

    const chart = new Chart(canvas.current, {
      type: "line",
      data: {
        labels: days.map((k) => k.slice(5)),
        datasets: [
          { label: "Sleep (h)", data: pick("sleepHours"), borderColor: "#6366f1", yAxisID: "y", tension: 0.3, spanGaps: true },
          { label: "Water (L)", data: pick("waterMl", (ml) => ml / 1000), borderColor: "#0ea5e9", yAxisID: "y1", tension: 0.3, spanGaps: true },
          { label: "Weight (kg)", data: pick("weightKg"), borderColor: "#f97316", yAxisID: "y2", tension: 0.3, spanGaps: true },
        ],
      },
      options: {
        responsive: true,
        interaction: { mode: "index", intersect: false },
        scales: {
          y: { position: "left", title: { display: true, text: "Sleep (h)" }, min: 0, max: 10 },
          y1: { position: "right", title: { display: true, text: "Water (L)" }, min: 0, max: 4, grid: { drawOnChartArea: false } },
          y2: { position: "right", title: { display: true, text: "Weight (kg)" }, grid: { drawOnChartArea: false } },
        },
      },
    });
    return () => chart.destroy();
  }, [logs]);

  return (
    <section className="card wide">
      <h2>7-day trends</h2>
      <canvas ref={canvas} />
      <p className="muted small">Gaps mean nothing was logged that day.</p>
    </section>
  );
}
