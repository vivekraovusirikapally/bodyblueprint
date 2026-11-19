import { useState } from "react";
import { useHealth } from "../context/HealthContext.jsx";
import { sleepHoursBetween } from "../lib/health.js";

export default function SleepLogger() {
  const { today, saveSleep } = useHealth();
  const [bed, setBed] = useState(today.bed || "23:00");
  const [wake, setWake] = useState(today.wake || "06:30");
  const [rating, setRating] = useState(today.rating || 0);

  const hours = sleepHoursBetween(bed, wake);

  const save = () => saveSleep({ bed, wake, rating, sleepHours: hours });

  return (
    <section className="card">
      <h2>Sleep</h2>
      <div className="form">
        <label>Bedtime
          <input type="time" value={bed} onChange={(e) => setBed(e.target.value)} />
        </label>
        <label>Wake time
          <input type="time" value={wake} onChange={(e) => setWake(e.target.value)} />
        </label>
      </div>
      <p className="big">{hours} <span className="muted">hours</span></p>
      <div className="stars" role="radiogroup" aria-label="Restfulness">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} className={n <= rating ? "star on" : "star"} onClick={() => setRating(n)} aria-label={`${n} stars`}>
            ★
          </button>
        ))}
      </div>
      <button className="primary" onClick={save}>Save sleep</button>
      {today.sleepHours > 0 && <p className="muted small">Logged today: {today.sleepHours} h</p>}
    </section>
  );
}
