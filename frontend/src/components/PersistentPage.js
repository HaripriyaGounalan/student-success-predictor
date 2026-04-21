import React from "react";
import { useState } from "react";
import SummaryStat from "./SummaryStat";

function PersistentPage({ data }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_term_gpa: "2.5", second_term_gpa: "2.0", first_language: "1",
    funding: "2", fast_track: "1", coop: "1", residency: "1", gender: "1",
    prev_education: "1", age_group: "2", hs_avg: "75", math_score: "30", english_grade: "7",
  });

  const predict = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/predict/first-year-persistence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_term_gpa: parseFloat(form.first_term_gpa),
          second_term_gpa: parseFloat(form.second_term_gpa),
          first_language: parseInt(form.first_language),
          funding: parseInt(form.funding),
          fast_track: parseInt(form.fast_track),
          coop: parseInt(form.coop),
          residency: parseInt(form.residency),
          gender: parseInt(form.gender),
          prev_education: parseInt(form.prev_education),
          age_group: parseInt(form.age_group),
          hs_avg: parseFloat(form.hs_avg),
          math_score: parseFloat(form.math_score),
          english_grade: parseInt(form.english_grade),
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
              <input className="form-input" type="number" step="0.1" min="0" max="4.5" value={form.first_term_gpa} onChange={update("first_term_gpa")} />
            </div>
            <div className="form-group">
              <div className="form-label">Second term GPA</div>
              <input className="form-input" type="number" step="0.1" min="0" max="4.5" value={form.second_term_gpa} onChange={update("second_term_gpa")} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">HS average mark</div>
              <input className="form-input" type="number" min="0" max="100" value={form.hs_avg} onChange={update("hs_avg")} />
            </div>
            <div className="form-group">
              <div className="form-label">Math score</div>
              <input className="form-input" type="number" min="0" max="100" value={form.math_score} onChange={update("math_score")} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">English grade</div>
              <input className="form-input" type="number" min="1" max="10" value={form.english_grade} onChange={update("english_grade")} />
            </div>
            <div className="form-group">
              <div className="form-label">Age group</div>
              <input className="form-input" type="number" min="1" value={form.age_group} onChange={update("age_group")} />
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
              <select className="form-input" value={form.prev_education} onChange={update("prev_education")}>
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
            {loading ? "Predicting..." : "Predict persistence probability"}
          </button>

          {result && (
            <div className="result-box">
              <div className="result-label">Probability of persisting</div>
              <div className="result-value">{result.confidence_pct}%</div>
              <div className="result-title">{result.message_title}</div>
              <div className="result-body">{result.message_body}</div>
              <div className="result-action">{result.message_action}</div>
            </div>
          )}
        </div>

        <div className="two-col">
          <div className="card">
            <div className="card-title">Default threshold (0.50)</div>
            <SummaryStat data={[
              { key: "Accuracy", val: "88%" },
              { key: "Dropout — precision", val: "66%" },
              { key: "Dropout — recall", val: "82%" },
              { key: "Dropout — F1", val: "73%" },
              { key: "Persisted — precision", val: "95%" },
              { key: "Persisted — recall", val: "89%" },
              { key: "Persisted — F1", val: "92%" },
              { key: "Macro F1", val: "83%" },
              { key: "Weighted F1", val: "88%" },
            ]} />
          </div>
          <div className="card">
            <div className="card-title">Tuned threshold (0.70)</div>
            <SummaryStat data={[
              { key: "Accuracy", val: "80%" },
              { key: "Dropout — precision", val: "51%" },
              { key: "Dropout — recall", val: "84%" },
              { key: "Dropout — F1", val: "64%" },
              { key: "Persisted — precision", val: "95%" },
              { key: "Persisted — recall", val: "79%" },
              { key: "Persisted — F1", val: "86%" },
              { key: "Macro F1", val: "75%" },
              { key: "Weighted F1", val: "82%" },
            ]} />
          </div>
        </div>

        <div className="card" style={{ marginTop: "1.2rem" }}>
          <div className="card-title">Final test set evaluation</div>
          <img
            src="/fyp_results_01.png"
            alt="Final test set evaluation — confusion matrices and probability distribution"
            style={{ width: "100%", borderRadius: "8px", marginTop: "0.5rem" }}
          />
        </div>

        <div className="card" style={{ marginTop: "1.2rem" }}>
          <div className="card-title">Threshold Tuning</div>
          <img
            src="/fyp_results_02.png"
            alt="Threshold tuning"
            style={{ width: "100%", borderRadius: "8px", marginTop: "0.5rem" }}
          />
        </div>

      </div>
    </>
  );
}

export default PersistentPage;