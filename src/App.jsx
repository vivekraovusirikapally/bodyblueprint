import { useState } from "react";
import { useHealth } from "./context/HealthContext.jsx";
import Calculator from "./components/Calculator.jsx";
import WaterLogger from "./components/WaterLogger.jsx";
import SleepLogger from "./components/SleepLogger.jsx";
import ScoreRing from "./components/ScoreRing.jsx";
import Advice from "./components/Advice.jsx";
import Trends from "./components/Trends.jsx";

const tabs = ["Today", "Body", "Trends"];

export default function App() {
  const [tab, setTab] = useState("Today");
  const { resetAll } = useHealth();

  return (
    <div className="app">
      <header className="top">
        <div>
          <h1>BodyBlueprint</h1>
          <p className="muted">One place for your body metrics, water and sleep.</p>
        </div>
        <nav className="tabs">
          {tabs.map((t) => (
            <button key={t} className={t === tab ? "tab active" : "tab"} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>
      </header>

      {tab === "Today" && (
        <main className="grid">
          <ScoreRing />
          <Advice />
          <WaterLogger />
          <SleepLogger />
        </main>
      )}
      {tab === "Body" && (
        <main className="grid">
          <Calculator />
        </main>
      )}
      {tab === "Trends" && (
        <main className="grid">
          <Trends />
        </main>
      )}

      <footer className="muted small">
        <p>
          Educational wellness information only, loosely based on WHO guidelines. This is not medical advice.
          Please talk to a doctor about any health concerns.
        </p>
        <button className="link" onClick={() => window.confirm("Reset to the sample data?") && resetAll()}>
          Reset demo data
        </button>
      </footer>
    </div>
  );
}
