import React from "react";

function InputForm({ formData, handleChange, handleSubmit, loading }) {
  return (
    <div className="form-container">
      <h2>📥 Enter Student Data</h2>

      <div className="form-group">
        <label>High School Average</label>
        <input
          name="hs_avg"
          value={formData.hs_avg}
          onChange={handleChange}
          placeholder="0 - 100"
        />
      </div>

      <div className="form-group">
        <label>First Term GPA</label>
        <input
          name="first_term_gpa"
          value={formData.first_term_gpa}
          onChange={handleChange}
          placeholder="0 - 4.5"
        />
      </div>

      <div className="form-group">
        <label>Math Score</label>
        <input
          name="math_score"
          value={formData.math_score}
          onChange={handleChange}
          placeholder="0 - 50"
        />
      </div>

      <div className="form-group">
        <label>English Grade</label>
        <input
          name="english_grade"
          value={formData.english_grade}
          onChange={handleChange}
          placeholder="1 - 11"
        />
      </div>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Predicting..." : "Predict"}
      </button>
    </div>
  );
}

export default InputForm;