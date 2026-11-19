import { buildAdvice } from "../lib/health.js";
import { useTodayScore } from "./ScoreRing.jsx";

export default function Advice() {
  const { bmi, waterMl, goalMl, sleepHours } = useTodayScore();
  const tips = buildAdvice({ bmi, waterMl, goalMl, sleepHours });
  return (
    <section className="card">
      <h2>Advice for today</h2>
      {tips.map((t, i) => (
        <div key={i} className={`tip ${t.tone}`}>{t.text}</div>
      ))}
      <p className="muted small">General educational wellness tips only, not medical advice.</p>
    </section>
  );
}
