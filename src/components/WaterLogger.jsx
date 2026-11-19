import { useHealth } from "../context/HealthContext.jsx";
import { waterGoal } from "../lib/health.js";

export default function WaterLogger() {
  const { profile, today, addWater } = useHealth();
  const goal = waterGoal(profile.weightKg);
  const pct = Math.min(100, Math.round((today.waterMl / goal) * 100));

  return (
    <section className="card">
      <h2>Water intake</h2>
      <div className="row">
        <div className="glass" aria-label={`${pct}% of daily goal`}>
          <div className="water" style={{ height: `${pct}%` }} />
        </div>
        <div>
          <p className="big">{today.waterMl} <span className="muted">/ {goal} ml</span></p>
          <p className="muted">{pct}% of your goal (about 35 ml per kg)</p>
        </div>
      </div>
      <div className="row wrap">
        <button className="primary" onClick={() => addWater(250)}>+250 ml</button>
        <button className="primary" onClick={() => addWater(500)}>+500 ml</button>
        <button className="ghost" onClick={() => addWater(-250)}>Undo 250</button>
      </div>
    </section>
  );
}
