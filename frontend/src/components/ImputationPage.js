import React from "react";
import theme from "../theme";

const imputationData = [
  { name: "IterativeImputer (Bayesian)", val: 85.44, best: true  },
  { name: "Per-column imputation",       val: 81.39               },
  { name: "Simple median / mode",        val: 80.11               },
  { name: "Drop high-missing cols",      val: 79.75               },
  { name: "Drop all NaN rows",           val: 76.48, worst: true  },
];

function ImputationPage({ data }) {
  return (
    <>
      <div className="page-header">
        <div className="page-title">Imputation comparison</div>
        <div className="page-desc">5 strategies compared on First Year Persistence AUC</div>
      </div>
      <div className="two-col">
      <div className="card">
        <div className="card-title">AUC by approach</div>
        {imputationData.map((item, i) => (
          <div className="bar-row" key={i}>
            <div className="bar-label" style={{ width: 160 }}>
              {item.name}
              {item.best  && <span className="badge badge-success" style={{ marginLeft: 6 }}>Best</span>}
              {item.worst && <span className="badge badge-danger"  style={{ marginLeft: 6 }}>Worst</span>}
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${item.val}%`,
                  background: item.best ? theme.success : item.worst ? theme.danger : theme.accent,
                }}
              />
            </div>
            <div className="bar-val">{item.val}%</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Strategy details</div>
        {[
          { name: "IterativeImputer",   rows: "1437", features: "15", note: "BayesianRidge · max_iter=20"          },
          { name: "Per-column",         rows: "1437", features: "15", note: "Mode / Median / RF / KNN per column"   },
          { name: "Simple median/mode", rows: "1437", features: "14", note: "Median continuous, mode categorical"   },
          { name: "Drop high-missing",  rows: "1437", features: "11", note: "Removed HS Mark + Math Score"         },
          { name: "Drop NaN rows",      rows: "470",  features: "14", note: "Lost 67.3% of data"                   },
        ].map((item, i) => (
          <div className="imp-row" key={i}>
            <div>
              <div style={{ color: theme.textPrimary, fontSize: 12, fontWeight: 500 }}>{item.name}</div>
              <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>{item.note}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="imp-val">{item.rows} rows</div>
              <div style={{ fontSize: 10, color: theme.textMuted }}>{item.features} features</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);}

export default ImputationPage;