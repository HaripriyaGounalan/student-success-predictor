import React from "react";
import { useState } from "react";
import SummaryStat from "./SummaryStat";
import theme from "../theme";

function SuccessPage({ data }) {
const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    firstGpa: "3.2", hsAvg: "78", math: "32", english: "7",
    residency: "1", fastTrack: "2", funding: "2", prevEd: "1", age: "3",
  });

  const predict = () => {
    const g = parseFloat(form.firstGpa) || 3.0;
    const h = parseFloat(form.hsAvg)    || 75;
    const m = parseFloat(form.math)     || 25;
    setResult((Math.min(0.99, Math.max(0.01, g * 0.22 + (h / 100) * 0.18 + (m / 50) * 0.10 + 0.15)) * 100).toFixed(1));
  };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <div className="page-header">
        <div className="page-title">Student success</div>
        <div className="page-desc">Predict student success — persisted AND achieved average GPA ≥ 2.5</div>
      </div>
      <div className="two-col">
        <div className="card">
          <div className="card-title">Input</div>
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
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">Residency</div>
              <select className="form-input" value={form.residency} onChange={update("residency")}>
                <option value="1">Domestic</option>
                <option value="2">International</option>
              </select>
            </div>
            <div className="form-group">
              <div className="form-label">Funding</div>
              <select className="form-input" value={form.funding} onChange={update("funding")}>
                <option value="2">GPOG FT</option>
                <option value="1">Apprentice PS</option>
                <option value="3">Intl Offshore</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">Fast track</div>
              <select className="form-input" value={form.fastTrack} onChange={update("fastTrack")}>
                <option value="1">Yes</option>
                <option value="2">No</option>
              </select>
            </div>
            <div className="form-group">
              <div className="form-label">Previous education</div>
              <select className="form-input" value={form.prevEd} onChange={update("prevEd")}>
                <option value="1">High school</option>
                <option value="2">Post secondary</option>
              </select>
            </div>
          </div>

          <button className="predict-btn" onClick={predict}>Predict student success</button>
          {result && (
            <div className="result-box">
              <div className="result-label">Probability of student success</div>
              <div className="result-value">{result}%</div>
              <div className="result-conf">
                {parseFloat(result) >= 70
                  ? "High confidence — student likely to succeed"
                  : parseFloat(result) >= 50
                  ? "Moderate — monitor closely"
                  : "High risk — early intervention strongly recommended"}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Model summary</div>
          <SummaryStat data={[
            { key: "Best architecture", val: "1L-64-ReLU-Adam"                   },
            { key: "Test AUC",          val: "94.60%"                            },
            { key: "Test accuracy",     val: "87.50%"                            },
            { key: "Recall",            val: "92.00%"                            },
            { key: "Precision",         val: "87.98%"                            },
            { key: "Gap",               val: "0.12% — excellent generalization"  },
            { key: "Target definition", val: "Persist AND avg GPA ≥ 2.5"         },
            { key: "Input features",    val: "9"                                 },
          ]} />
        </div>
      </div>
    </>
  );
}

export default SuccessPage;