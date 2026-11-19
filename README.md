# BodyBlueprint - HealthHub Hack

A small personal health dashboard. It calculates BMI and BMR, tracks water and sleep,
and combines them into a daily wellness score with simple advice.

## Features
- BMI + BMR (Mifflin-St Jeor) with a WHO gauge, metric/imperial toggle
- Water logger with +250 / +500 ml buttons and a fill animation
- Sleep logger (bedtime, wake time, 1-5 star rating)
- Wellness score: BMI 30%, hydration 35%, sleep 35%
- Rule-based advice cards
- 7-day Chart.js trend chart (sleep, water, weight)
- Calorie target (cut / maintain / bulk)
- Data saved in localStorage, seeded with 14 days of sample student data

## Run it
```
npm install
npm run dev
```
Then open the URL Vite prints (usually http://localhost:5173).

## How the score works
Each metric becomes a 0-100 sub-score by how far it is from its target:
- BMI: 100 inside 18.5-24.9, loses 10 points per BMI unit outside
- Water: intake / goal, where goal = 35 ml x body weight
- Sleep: 100 for 7-9 hours, scaled down below 7, small penalty above 9

Then `score = 0.30*bmi + 0.35*water + 0.35*sleep`.

## Demo script
Height 175 cm, weight 72 kg. Log 2000 ml of water (4 taps of +500) and save 7.5 hours of sleep.
The ring should land in the high 80s / 90s with "Hydration and sleep targets met!".

## Disclaimer
Educational wellness info only, not medical advice.

## Project layout
- `src/lib/health.js` - formulas and advice rules
- `src/context/HealthContext.jsx` - shared state + localStorage
- `src/components/` - UI pieces
