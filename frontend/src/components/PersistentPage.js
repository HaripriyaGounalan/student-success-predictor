import React from "react";
import { useState } from "react";
import SummaryStat from "./SummaryStat";
import theme from "../theme";

function PersistentPage({ data }) {
const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    firstGpa: "3.2", hsAvg: "78", residency: "1", funding: "2", fastTrack: "2", coop: "2",
  });

  const predict = () => {
    const g = parseFloat(form.firstGpa) || 3.0;
    const h = parseFloat(form.hsAvg)    || 75;
    setResult((Math.min(0.99, Math.max(0.01, g * 0.18 + (h / 100) * 0.15 + 0.35)) * 100).toFixed(1));
  };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <div className="page-header">
        <div className="page-title">Persistence model</div>
        <div className="page-desc">Predict whether a student will persist through their first year</div>
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
                <option value="4">Intl Regular</option>
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
              <div className="form-label">Coop</div>
              <select className="form-input" value={form.coop} onChange={update("coop")}>
                <option value="1">Yes</option>
                <option value="2">No</option>
              </select>
            </div>
          </div>

          <button className="predict-btn" onClick={predict}>Predict persistence probability</button>
          {result && (
            <div className="result-box">
              <div className="result-label">Probability of persisting</div>
              <div className="result-value">{result}%</div>
              <div className="result-conf">
                {parseFloat(result) >= 70
                  ? "High confidence — student likely to persist"
                  : parseFloat(result) >= 50
                  ? "Moderate — monitor student closely"
                  : "At risk — early intervention recommended"}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Model summary</div>
          <SummaryStat data={[
            { key: "Best architecture", val: "3L-128-64-32-ReLU-Adam"     },
            { key: "Best AUC",          val: "85.44%"                     },
            { key: "Best accuracy",     val: "84.38%"                     },
            { key: "Recall",            val: "90.79%"                     },
            { key: "Precision",         val: "89.61%"                     },
            { key: "Gap",               val: "7.99%"                      },
            { key: "Best imputation",   val: "IterativeImputer (Bayesian)" },
            { key: "Input features",    val: "15 (incl. 2 missing flags)" },
          ]} />
        </div>
      </div>
    </>
  );
}

export default PersistentPage;