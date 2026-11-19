// All the maths lives here so the components stay small.
// Everything is stored in metric (kg, cm, ml). Imperial is only for display.

export const KG_PER_LB = 0.45359237;
export const CM_PER_IN = 2.54;

export const lbsToKg = (lbs) => lbs * KG_PER_LB;
export const kgToLbs = (kg) => kg / KG_PER_LB;
export const inToCm = (inches) => inches * CM_PER_IN;
export const cmToIn = (cm) => cm / CM_PER_IN;

export function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export const todayKey = () => dateKey(new Date());

export function calcBmi(weightKg, heightCm) {
  const m = heightCm / 100;
  if (!m || !weightKg) return 0;
  return weightKg / (m * m);
}

// Mifflin-St Jeor
export function calcBmr({ weightKg, heightCm, age, sex }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "female" ? base - 161 : base + 5;
}

export function whoCategory(bmi) {
  if (bmi < 18.5) return { label: "Underweight", color: "#3b82f6" };
  if (bmi < 25) return { label: "Normal", color: "#22c55e" };
  if (bmi < 30) return { label: "Overweight", color: "#f59e0b" };
  return { label: "Obese", color: "#ef4444" };
}

// Daily water goal: about 35 ml per kg, rounded to the nearest 50
export function waterGoal(weightKg) {
  return Math.round((weightKg * 35) / 50) * 50;
}

// Sleep hours between bedtime and wake time ("HH:MM"), handles past midnight
export function sleepHoursBetween(bed, wake) {
  if (!bed || !wake) return 0;
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  let mins = wh * 60 + wm - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60;
  return Math.round((mins / 60) * 10) / 10;
}

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

// Each metric becomes a 0-100 sub-score based on how far it is from the target
export function bmiSubScore(bmi) {
  if (!bmi) return 0;
  if (bmi >= 18.5 && bmi < 25) return 100;
  const distance = bmi < 18.5 ? 18.5 - bmi : bmi - 24.9;
  return clamp(100 - distance * 10);
}
export function waterSubScore(ml, goal) {
  return goal ? clamp((ml / goal) * 100) : 0;
}
export function sleepSubScore(hours) {
  if (!hours) return 0;
  if (hours >= 7 && hours <= 9) return 100;
  if (hours < 7) return clamp((hours / 7) * 100);
  return clamp(100 - (hours - 9) * 15); // oversleeping costs a bit too
}

// Weights from the brief: BMI 30%, hydration 35%, sleep 35%
export function wellnessScore({ bmi, waterMl, goalMl, sleepHours }) {
  const parts = {
    bmi: bmiSubScore(bmi),
    water: waterSubScore(waterMl, goalMl),
    sleep: sleepSubScore(sleepHours),
  };
  const total = Math.round(parts.bmi * 0.3 + parts.water * 0.35 + parts.sleep * 0.35);
  return { total, parts };
}

export function scoreLabel(score) {
  if (score >= 85) return "Optimal Balance";
  if (score >= 70) return "Doing Well";
  if (score >= 50) return "Needs Attention";
  return "Low - Take It Easy";
}

// Rule based advice. First rules look at combinations, then single metrics.
export function buildAdvice({ bmi, waterMl, goalMl, sleepHours }) {
  const tips = [];
  const waterLow = waterMl < goalMl * 0.75;
  const sleepLow = sleepHours > 0 && sleepHours < 7;
  const category = whoCategory(bmi).label;

  if (sleepLow && waterLow) {
    tips.push({ tone: "warn", text: "Short sleep and low water together can leave you drained. Rest earlier tonight and sip water steadily through the day." });
  } else if (sleepLow) {
    tips.push({ tone: "warn", text: "Sleep deficit detected: increase water intake to offset fatigue, and aim for 7-9 hours tonight." });
  } else if (waterLow) {
    tips.push({ tone: "warn", text: `You are at ${Math.round((waterMl / goalMl) * 100)}% of your water goal. A glass now and one with each meal gets you close.` });
  }
  if (sleepHours > 9) {
    tips.push({ tone: "info", text: "More than 9 hours of sleep is a lot. If you often feel groggy anyway, a consistent wake time can help." });
  }
  if (category === "Underweight") {
    tips.push({ tone: "info", text: "Your BMI is in the underweight band. Regular balanced meals with enough protein are a good general starting point." });
  } else if (category === "Overweight" || category === "Obese") {
    tips.push({ tone: "info", text: "Your BMI is above the normal band. Short daily walks and good sleep both support healthy weight management." });
  }
  if (!waterLow && !sleepLow && sleepHours > 0) {
    tips.push({ tone: "good", text: "Hydration and sleep targets met! Maintain physical activity to match BMR baseline." });
  }
  if (tips.length === 0) {
    tips.push({ tone: "info", text: "Log your water and sleep for today to get personalised tips." });
  }
  return tips;
}

// Calorie target estimator (stretch feature). Activity multiplier fixed at light.
export function calorieTarget(bmr, goal) {
  const maintain = bmr * 1.375;
  if (goal === "cut") return Math.round(maintain - 400);
  if (goal === "bulk") return Math.round(maintain + 300);
  return Math.round(maintain);
}
