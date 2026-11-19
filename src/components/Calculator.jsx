import { useState } from "react";
import { useHealth } from "../context/HealthContext.jsx";
import { calcBmi, calcBmr, calorieTarget, cmToIn, inToCm, kgToLbs, lbsToKg, whoCategory } from "../lib/health.js";

// BMI 10..40 mapped onto a half circle
function Gauge({ bmi, color }) {
  const clamped = Math.max(10, Math.min(40, bmi || 10));
  const toRad = (v) => ((((v - 10) / 30) * 180 - 180) * Math.PI) / 180;
  const cx = 110, cy = 110;
  const needleX = cx + 80 * Math.cos(toRad(clamped));
  const needleY = cy + 80 * Math.sin(toRad(clamped));

  const arc = (a, b, stroke) => {
    const x1 = cx + 95 * Math.cos(toRad(a)), y1 = cy + 95 * Math.sin(toRad(a));
    const x2 = cx + 95 * Math.cos(toRad(b)), y2 = cy + 95 * Math.sin(toRad(b));
    return <path d={`M ${x1} ${y1} A 95 95 0 0 1 ${x2} ${y2}`} stroke={stroke} strokeWidth="14" fill="none" />;
  };

  return (
    <svg viewBox="0 0 220 130" className="gauge">
      {arc(10, 18.5, "#3b82f6")}
      {arc(18.5, 25, "#22c55e")}
      {arc(25, 30, "#f59e0b")}
      {arc(30, 40, "#ef4444")}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#111827" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#111827" />
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="14" fill={color} fontWeight="700">
        {bmi ? bmi.toFixed(1) : "--"}
      </text>
    </svg>
  );
}

export default function Calculator() {
  const { profile, saveProfile, setUnit } = useHealth();
  const imperial = profile.unit === "imperial";

  // The form edits display values. We convert to metric when saving.
  const [form, setForm] = useState({
    height: imperial ? cmToIn(profile.heightCm).toFixed(1) : profile.heightCm,
    weight: imperial ? kgToLbs(profile.weightKg).toFixed(1) : profile.weightKg,
    age: profile.age,
    sex: profile.sex,
  });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Switching units converts what is currently typed, using the old unit
  const toggleUnit = (unit) => {
    if (unit === profile.unit) return;
    const heightCm = imperial ? inToCm(form.height) : Number(form.height);
    const weightKg = imperial ? lbsToKg(form.weight) : Number(form.weight);
    setUnit(unit);
    setForm({
      ...form,
      height: unit === "imperial" ? cmToIn(heightCm).toFixed(1) : Math.round(heightCm),
      weight: unit === "imperial" ? kgToLbs(weightKg).toFixed(1) : weightKg.toFixed(1),
    });
  };

  const submit = (e) => {
    e.preventDefault();
    const heightCm = imperial ? inToCm(form.height) : Number(form.height);
    const weightKg = imperial ? lbsToKg(form.weight) : Number(form.weight);
    if (!heightCm || !weightKg || !form.age) return;
    saveProfile({ heightCm, weightKg, age: Number(form.age), sex: form.sex });
  };

  const bmi = calcBmi(profile.weightKg, profile.heightCm);
  const bmr = Math.round(calcBmr(profile));
  const cat = whoCategory(bmi);

  return (
    <>
      <section className="card">
        <div className="row between">
          <h2>BMI &amp; BMR calculator</h2>
          <div className="seg">
            <button className={!imperial ? "on" : ""} onClick={() => toggleUnit("metric")}>kg / cm</button>
            <button className={imperial ? "on" : ""} onClick={() => toggleUnit("imperial")}>lbs / in</button>
          </div>
        </div>
        <form onSubmit={submit} className="form">
          <label>Height ({imperial ? "in" : "cm"})
            <input name="height" type="number" step="0.1" min="1" value={form.height} onChange={change} />
          </label>
          <label>Weight ({imperial ? "lbs" : "kg"})
            <input name="weight" type="number" step="0.1" min="1" value={form.weight} onChange={change} />
          </label>
          <label>Age
            <input name="age" type="number" min="10" max="100" value={form.age} onChange={change} />
          </label>
          <label>Biological sex
            <select name="sex" value={form.sex} onChange={change}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <button className="primary" type="submit">Calculate</button>
        </form>
      </section>

      <section className="card center">
        <h2>Your result</h2>
        <Gauge bmi={bmi} color={cat.color} />
        <p className="badge" style={{ background: cat.color }}>{cat.label}</p>
        <div className="legend">
          {["Underweight", "Normal", "Overweight", "Obese"].map((l) => (
            <span key={l} className={l === cat.label ? "bold" : "muted"}>{l}</span>
          ))}
        </div>
        <p className="big">{bmr.toLocaleString()} <span className="muted">kcal/day BMR</span></p>
      </section>

      <CalorieCard bmr={bmr} />
    </>
  );
}

function CalorieCard({ bmr }) {
  const { profile, saveProfile } = useHealth();
  const goals = [["cut", "Cut"], ["maintain", "Maintain"], ["bulk", "Bulk"]];
  return (
    <section className="card">
      <h2>Calorie target</h2>
      <div className="seg">
        {goals.map(([id, label]) => (
          <button key={id} className={profile.goal === id ? "on" : ""} onClick={() => saveProfile({ goal: id })}>{label}</button>
        ))}
      </div>
      <p className="big">{calorieTarget(bmr, profile.goal).toLocaleString()} <span className="muted">kcal/day</span></p>
      <p className="muted small">BMR x 1.375 (light activity), minus 400 to cut or plus 300 to bulk. A rough starting point only.</p>
    </section>
  );
}
