import React from "react";
import { useState } from "react";
import SummaryStat from "./SummaryStat";

function GPAPage({ data }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_term_gpa: "", first_language: "1", funding: "2", fast_track: "1",
    coop: "2", residency: "1", gender: "1", previous_education: "1",
    age_group: "4", english_grade: "5", first_year_persistence: "1",
    high_school_average_mark: "", math_score: "",
  });

  const predict = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/predict/chained-gpa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_term_gpa: parseFloat(form.first_term_gpa),
          first_language: parseInt(form.first_language),
          funding: parseInt(form.funding),
          fast_track: parseInt(form.fast_track),
          coop: parseInt(form.coop),
          residency: parseInt(form.residency),
          gender: parseInt(form.gender),
          previous_education: parseInt(form.previous_education),
          age_group: parseInt(form.age_group),
          english_grade: parseInt(form.english_grade),
          first_year_persistence: parseInt(form.first_year_persistence),
          high_school_average_mark: parseFloat(form.high_school_average_mark),
          math_score: parseFloat(form.math_score),
        }),
      });
      const json = await res.json();
      setResult(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const clamp = (key, min, max) => () => {
    setForm((f) => {
      const v = f[key];
      if (v === "") return f;
      const n = parseFloat(v);
      if (isNaN(n)) return { ...f, [key]: "" };
      return { ...f, [key]: String(Math.min(max, Math.max(min, n))) };
    });
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">GPA predictor</div>
        <div className="page-desc">Predict second and third term GPA using chained prediction</div>
      </div>
      <div className="two-col">
        <div className="card">
          <div className="card-title">Input</div>
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">First term GPA</div>
              <input className="form-input" type="number" step="0.1" placeholder="0.0 – 4.5" value={form.first_term_gpa} onChange={update("first_term_gpa")} onBlur={clamp("first_term_gpa", 0, 4.5)} />
            </div>
            <div className="form-group">
              <div className="form-label">HS average mark</div>
              <input className="form-input" type="number" step="0.1" placeholder="0.0 – 100.0" value={form.high_school_average_mark} onChange={update("high_school_average_mark")} onBlur={clamp("high_school_average_mark", 0, 100)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">Math score</div>
              <input className="form-input" type="number" step="0.1" placeholder="0.0 – 50.0" value={form.math_score} onChange={update("math_score")} onBlur={clamp("math_score", 0, 50)} />
            </div>
            <div className="form-group">
              <div className="form-label">English grade</div>
              <input className="form-input" type="number" min="1" max="11" value={form.english_grade} onChange={update("english_grade")} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">Age group</div>
              <input className="form-input" type="number" min="1" value={form.age_group} onChange={update("age_group")} />
            </div>
            <div className="form-group">
              <div className="form-label">First year persistence</div>
              <select className="form-input" value={form.first_year_persistence} onChange={update("first_year_persistence")}>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
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
              <div className="form-label">Gender</div>
              <select className="form-input" value={form.gender} onChange={update("gender")}>
                <option value="1">Male</option>
                <option value="2">Female</option>
              </select>
            </div>
            <div className="form-group">
              <div className="form-label">First language</div>
              <select className="form-input" value={form.first_language} onChange={update("first_language")}>
                <option value="1">English</option>
                <option value="2">Other</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">Previous education</div>
              <select className="form-input" value={form.previous_education} onChange={update("previous_education")}>
                <option value="1">High school</option>
                <option value="2">College</option>
                <option value="3">University</option>
              </select>
            </div>
            <div className="form-group">
              <div className="form-label">Fast track</div>
              <select className="form-input" value={form.fast_track} onChange={update("fast_track")}>
                <option value="1">Yes</option>
                <option value="2">No</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">Coop</div>
              <select className="form-input" value={form.coop} onChange={update("coop")}>
                <option value="1">Yes</option>
                <option value="2">No</option>
              </select>
            </div>
          </div>

          <button className="predict-btn" onClick={predict} disabled={loading}>
            {loading ? "Predicting..." : "Predict GPA"}
          </button>

          {result && (
            <div className="two-col">
              <div className={`result-box${result.predicted_second_term_gpa < 2
                  ? " result-box--danger"
                  : ""
                }`}>
                <div className={`result-label${result.predicted_second_term_gpa < 2 ? " result-box--danger" : ""}`}>Predicted second term GPA</div>
                <div className={`result-value${result.predicted_second_term_gpa < 2 ? " result-box--danger" : ""}`}>{result.predicted_second_term_gpa} / 4.5</div>
              </div>
              <div className={`result-box${result.predicted_third_term_gpa < 2
                  ? " result-box--danger"
                  : ""
                }`}>
                <div className={`result-label${result.predicted_third_term_gpa < 2 ? " result-box--danger" : ""}`}>Predicted third term GPA</div>
                <div className={`result-value${result.predicted_third_term_gpa < 2 ? " result-box--danger" : ""}`}>{result.predicted_third_term_gpa} / 4.5</div>
              </div>
            </div>
          )}
        </div>

        <div className="two-col">
          <div className="card">
            <div className="card-title">Second Term GPA</div>
            <SummaryStat data={[
              { key: "Best Architecture", val: "2L-512-Tanh-D0.1-128-ELU-D0.2-SGD-LR0.0009-BS32" },
              { key: "Test RMSE", val: "0.558661" },
              { key: "Test MAE", val: "0.423561" },
              { key: "Test R²", val: "0.714179" },
              { key: "Training Epochs", val: "65" },
              { key: "Total features", val: "21" },
              { key: "Missing flags", val: "9" },
              { key: "Original columns", val: "12" },
            ]} />
          </div>
          <div className="card">
            <div className="card-title">Relay Third Term GPA</div>
            <SummaryStat data={[
              { key: "Best Architecture", val: "2L-512-Tanh-D0.1-128-ELU-D0.2-SGD-LR0.0009-BS32" },
              { key: "Test RMSE", val: "0.345779" },
              { key: "Test MAE", val: "0.256132" },
              { key: "Test R²", val: "0.917617" },
              { key: "Training Epochs", val: "148" },
              { key: "Total features", val: "18" },
              { key: "Original features", val: "14" },
              { key: "Missing flags", val: "3" },
              { key: "GPA gate feature", val: "engineered" },
            ]} />
          </div>
        </div>

        <div className="card" style={{ marginTop: "1.2rem" }}>
          <div className="card-title">Custom Model Metrics</div>
          <img
            src="/ap_results_01.png"
            alt="Custom Model Metrics"
            style={{ width: "100%", borderRadius: "8px", marginTop: "0.5rem" }}
          />
        </div>

        <div className="card" style={{ marginTop: "1.2rem" }}>
          <div className="card-title">Custom Actual vs. Predicted</div>
          <img
            src="/ap_results_02.png"
            alt="Custom Actual vs. Predicted"
            style={{ width: "100%", borderRadius: "8px", marginTop: "0.5rem" }}
          />
        </div>

        <div className="card" style={{ marginTop: "1.2rem" }}>
          <div className="card-title">Relay Model Metrics</div>
          <img
            src="/ap_results_03.png"
            alt="Relay Model Metrics"
            style={{ width: "100%", borderRadius: "8px", marginTop: "0.5rem" }}
          />
        </div>

        <div className="card" style={{ marginTop: "1.2rem" }}>
          <div className="card-title">Relay Actual vs. Predicted</div>
          <img
            src="/ap_results_04.png"
            alt="Relay Actual vs. Predicted"
            style={{ width: "100%", borderRadius: "8px", marginTop: "0.5rem" }}
          />
        </div>
      </div>
    </>
  );
}

export default GPAPage;