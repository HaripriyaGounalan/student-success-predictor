import React from "react";
import Dashboard from "./Dashboard";

function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="results">
      <h2>📊 Prediction Results</h2>

      <div className="result-grid">
        <div className="result-box success">
          ✅ Completion: {result.completion === 1 ? "Yes" : "No"}
        </div>

        <div className="result-box info">
          📘 Persistence: {result.persistence === 1 ? "Yes" : "No"}
        </div>

        <div className="result-box highlight">
          🎯 GPA: {result.gpa}
        </div>

        <div className="result-box badge">
          🏆 Performance: {result.performance}
        </div>
      </div>

      {/* DASHBOARD */}
      <Dashboard data={result} />
    </div>
  );
}

export default ResultCard;