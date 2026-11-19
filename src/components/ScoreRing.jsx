import { useHealth } from "../context/HealthContext.jsx";
import { calcBmi, scoreLabel, waterGoal, wellnessScore } from "../lib/health.js";

export function useTodayScore() {
  const { profile, today } = useHealth();
  const bmi = calcBmi(profile.weightKg, profile.heightCm);
  const goalMl = waterGoal(profile.weightKg);
  const result = wellnessScore({ bmi, waterMl: today.waterMl, goalMl, sleepHours: today.sleepHours });
  return { ...result, bmi, goalMl, waterMl: today.waterMl, sleepHours: today.sleepHours };
}

export default function ScoreRing() {
  const { total, parts } = useTodayScore();
  const r = 60;
  const circ = 2 * Math.PI * r;
  const color = total >= 85 ? "#22c55e" : total >= 70 ? "#84cc16" : total >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <section className="card center">
      <h2>Wellness index</h2>
      <svg viewBox="0 0 150 150" className="ring">
        <circle cx="75" cy="75" r={r} stroke="#e5e7eb" strokeWidth="12" fill="none" />
        <circle cx="75" cy="75" r={r} stroke={color} strokeWidth="12" fill="none" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - total / 100)}
          transform="rotate(-90 75 75)" style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.8s" }} />
        <text x="75" y="85" textAnchor="middle" fontSize="30" fontWeight="700">{total}</text>
      </svg>
      <p className="bold">{total}/100 - {scoreLabel(total)}</p>
      <div className="bars">
        <Bar label="BMI (30%)" value={parts.bmi} />
        <Bar label="Hydration (35%)" value={parts.water} />
        <Bar label="Sleep (35%)" value={parts.sleep} />
      </div>
    </section>
  );
}

function Bar({ label, value }) {
  return (
    <div className="bar">
      <span className="small">{label}</span>
      <div className="track"><div className="fill" style={{ width: `${Math.round(value)}%` }} /></div>
    </div>
  );
}
