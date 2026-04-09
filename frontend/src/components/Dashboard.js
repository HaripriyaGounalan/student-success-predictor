import React from "react";

function Dashboard({ data }) {
  if (!data) return null;

  return (
    <div className="dashboard">
      <h2>📊 Data Insights</h2>

      {/* INSIGHTS */}
      <div className="card">
        <h3>📌 Student Insights</h3>
        <p>{data.insights || "No insights provided by backend"}</p>
      </div>

      {/* CHART DATA */}
      <div className="card">
        <h3>📊 GPA Distribution</h3>
        <pre>{JSON.stringify(data.gpa_distribution, null, 2)}</pre>
      </div>

      <div className="card">
        <h3>📊 Persistence by GPA Band</h3>
        <pre>{JSON.stringify(data.persistence_by_gpa, null, 2)}</pre>
      </div>

      {/*CLEANED DATA */}
      <div className="card">
        <h3>📄Cleaned Data</h3>
        <table>
          <thead>
            <tr>
              <th>HS Avg</th>
              <th>GPA</th>
            </tr>
          </thead>
          <tbody>
            {data.sample_data?.map((row, index) => (
              <tr key={index}>
                <td>{row.hs_avg}</td>
                <td>{row.gpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;