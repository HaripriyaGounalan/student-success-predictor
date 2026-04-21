import React from "react";
import { useState } from "react";
import SummaryStat from "./SummaryStat";
import theme from "../theme";

function SuccessPage({ data }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    firstGpa: "3.2",
    hsAvg: "",
    math: "",
    english: "7",
    residency: "1",
    fastTrack: "2",
    funding: "2",
    prevEd: "1",
    age: "3",
  });

  const predict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const toNum = (v) => (v === "" || v === null || v === undefined ? null : parseFloat(v));
    const toInt = (v) => (v === "" || v === null || v === undefined ? null : parseInt(v, 10));

    const payload = {
      "First Term Gpa": toNum(form.firstGpa),
      "Math Score": toNum(form.math),
      "High School Average Mark": toNum(form.hsAvg),
      "Funding": toInt(form.funding),
      "English Grade": toInt(form.english),
      "Residency": toInt(form.residency),
      "FastTrack": toInt(form.fastTrack),
      "Previous Education": toInt(form.prevEd),
      "Age Group": toInt(form.age),
    };

    try {
      const res = await fetch("http://localhost:8000/predict/student-completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Request failed: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const probPct = result ? (result.probability * 100).toFixed(1) : null;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Program completion</div>
        <div className="page-desc">Predict whether a student is on track to complete the program — Term 2 GPA ≥ 2.0 AND persisted past first year</div>
      </div>
      <div className="two-col">
        <div className="card">
          <div className="card-title">Input</div>
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">First term GPA</div>
              <input className="form-input" type="number" step="0.1" min="0" max="4.5" value={form.firstGpa} onChange={update("firstGpa")} placeholder="0.0 - 4.5" />
            </div>
            <div className="form-group">
              <div className="form-label">HS average mark (optional)</div>
              <input className="form-input" type="number" min="0" max="100" value={form.hsAvg} onChange={update("hsAvg")} placeholder="Leave blank if unknown" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">Math score (optional)</div>
              <input className="form-input" type="number" min="0" max="50" value={form.math} onChange={update("math")} placeholder="Leave blank if unknown" />
            </div>
            <div className="form-group">
              <div className="form-label">English grade</div>
              <input className="form-input" type="number" min="1" max="10" value={form.english} onChange={update("english")} />
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
                <option value="1">Apprentice PS</option>
                <option value="2">GPOG FT</option>
                <option value="3">Intl Offshore</option>
                <option value="4">Intl Regular</option>
                <option value="5">Intl Transfer</option>
                <option value="6">Joint Program Ryerson</option>
                <option value="7">Joint Program UTSC</option>
                <option value="8">Second Career Program</option>
                <option value="9">Work Safety Insurance Board</option>
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
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">Age group</div>
              <select className="form-input" value={form.age} onChange={update("age")}>
                <option value="1">0 to 18</option>
                <option value="2">19 to 20</option>
                <option value="3">21 to 25</option>
                <option value="4">26 to 30</option>
                <option value="5">31 to 35</option>
                <option value="6">36 to 40</option>
                <option value="7">41 to 50</option>
                <option value="8">51 to 60</option>
              </select>
            </div>
            <div className="form-group"></div>
          </div>

          <button className="predict-btn" onClick={predict} disabled={loading}>
            {loading ? "Predicting..." : "Predict program completion"}
          </button>

          {error && (
            <div className="result-box" style={{ borderColor: "#c33" }}>
              <div className="result-label">Error</div>
              <div className="result-conf">{error}</div>
            </div>
          )}

          {result && (
            <div className="result-box">
              <div className="result-label">Probability of completing the program</div>
              <div className="result-value">{probPct}%</div>
              <div className="result-conf">
                {result.completed === 1
                  ? parseFloat(probPct) >= 75
                    ? "On track — high confidence"
                    : "On track — monitor closely"
                  : parseFloat(probPct) >= 25
                    ? "At risk — early intervention recommended"
                    : "High risk — immediate intervention strongly recommended"}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Model summary</div>
          <SummaryStat data={[
            { key: "Best architecture", val: "2L-16-8-ReLU-Adam" },
            { key: "Approach", val: "Iterative Imputer (Bayesian Ridge)" },
            { key: "Test accuracy", val: "82.29%" },
            { key: "Test AUC", val: "86.35%" },
            { key: "Precision", val: "87.89%" },
            { key: "Recall", val: "85.64%" },
            { key: "Train/test gap", val: "0.52%" },
            { key: "Target definition", val: "Term 2 GPA ≥ 2.0 AND persisted" },
            { key: "Input features", val: "9" },
          ]} />
        </div>

        <div className="card" style={{ marginTop: "1.2rem" }}>
          <div className="card-title">Phik Correlation Matrix</div>
          <img
            src="/sc_results_01.png"
            alt="Phik Correlation Matrix"
            style={{ width: "100%", borderRadius: "8px", marginTop: "0.5rem" }}
          />
        </div>

        <div className="card" style={{ marginTop: "1.2rem" }}>
          <div className="card-title">Training History</div>
          <img
            src="/sc_results_02.png"
            alt="Training History"
            style={{ width: "100%", borderRadius: "8px", marginTop: "0.5rem" }}
          />
        </div>
        <div className="card" style={{ marginTop: "1.2rem" }}>
          <div className="card-title">Best Model Diagnostics</div>
          <img
            src="/sc_results_03.png"
            alt="Best Model Diagnostics"
            style={{ width: "100%", borderRadius: "8px", marginTop: "0.5rem" }}
          />
        </div>
      </div>
    </>
  );
}

export default SuccessPage;