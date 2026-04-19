import React from "react";
import { useState } from "react";
import SummaryStat from "./SummaryStat";
import theme from "../theme";

function GPAPage({ data }) {
  const [tab, setTab] = useState(0);
    const [result, setResult] = useState(null);
    const [form, setForm] = useState({
      firstGpa: "3.2", hsAvg: "78", math: "32", english: "7", secondGpa: "3.4",
    });
  
    const predict = () => {
      const g = parseFloat(form.firstGpa) || 3.0;
      const h = parseFloat(form.hsAvg)    || 75;
      const s = tab === 1 ? parseFloat(form.secondGpa) || 3.0 : 0;
      const p = Math.min(4.5, Math.max(0, g * 0.72 + (h / 100) * 0.8 + (tab === 1 ? s * 0.15 : 0) + 0.2));
      setResult(p.toFixed(2));
    };
  
    const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  
    return (
      <>
        <div className="page-header">
          <div className="page-title">GPA predictor</div>
          <div className="page-desc">Predict second term GPA — Task 1 baseline or Task 2 transfer learning</div>
        </div>
        <div className="two-col">
          <div className="card">
            <div className="card-title">Input</div>
            <div className="tabs">
              {["Task 1 — predict 2nd term", "Task 2 — transfer learning"].map((t, i) => (
                <div
                  key={i}
                  className={`tab ${tab === i ? "active" : ""}`}
                  onClick={() => { setTab(i); setResult(null); }}
                >
                  {t}
                </div>
              ))}
            </div>
  
            <div className="form-row">
              <div className="form-group">
                <div className="form-label">First term GPA</div>
                <input className="form-input" type="number" step="0.1" min="0" max="4.5" value={form.firstGpa} onChange={update("firstGpa")} />
              </div>
              <div className="form-group">
                <div className="form-label">HS average mark</div>
                <input className="form-input" type="number" min="0" max="100" value={form.hsAvg} onChange={update("hsAvg")} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <div className="form-label">Math score</div>
                <input className="form-input" type="number" min="0" max="50" value={form.math} onChange={update("math")} />
              </div>
              <div className="form-group">
                <div className="form-label">English grade</div>
                <input className="form-input" type="number" min="1" max="11" value={form.english} onChange={update("english")} />
              </div>
            </div>
            {tab === 1 && (
              <div className="form-row">
                <div className="form-group">
                  <div className="form-label">Second term GPA (known)</div>
                  <input className="form-input" type="number" step="0.1" min="0" max="4.5" value={form.secondGpa} onChange={update("secondGpa")} />
                </div>
              </div>
            )}
  
            <button className="predict-btn" onClick={predict}>
              {tab === 0 ? "Predict second term GPA" : "Predict future GPA"}
            </button>
            {result && (
              <div className="result-box">
                <div className="result-label">{tab === 0 ? "Predicted second term GPA" : "Predicted future GPA"}</div>
                <div className="result-value">{result} / 4.5</div>
                <div className="result-conf">
                  95% interval: {Math.max(0, parseFloat(result) - 0.57).toFixed(2)} – {Math.min(4.5, parseFloat(result) + 0.57).toFixed(2)}
                </div>
              </div>
            )}
          </div>
  
          <div className="card">
            <div className="card-title">Model summary</div>
            <SummaryStat data={[
              { key: "Best architecture", val: tab === 0 ? "1L-128-ReLU-RMSprop"    : "2L-128-64-ReLU-Batch64"   },
              { key: "Test RMSE",         val: tab === 0 ? "0.5701"                 : "0.2951"                   },
              { key: "Test MAE",          val: tab === 0 ? "0.4183"                 : "0.2080"                   },
              { key: "Test R²",           val: tab === 0 ? "76.94%"                 : "90.92%"                   },
              { key: "Training epochs",   val: tab === 0 ? "61"                     : "90"                       },
              { key: "Input features",    val: tab === 0 ? "10"                     : "11 (+ 2nd term GPA)"      },
            ]} />
          </div>
        </div>
      </>
    );
}

export default GPAPage;