import React from "react";
import { useState } from "react";
import MetricCard from "./MetricCard";
import BarRow from "./BarRow";
import theme from "../theme";


const trainData = [28, 42, 55, 63, 70, 76, 80, 83, 86, 88, 90, 91, 92, 93, 94];
const valData   = [35, 50, 60, 68, 74, 79, 83, 86, 89, 91, 92, 93, 94, 94, 94];

const experiments = [
  { name: "1L-64-ReLU-Adam",         trainAcc: "87.38", testAcc: "87.50", auc: "94.60", recall: "92.00", gap: "0.12",  epochs: 30, best: true  },
  { name: "1L-128-ReLU-Adam",        trainAcc: "88.57", testAcc: "87.50", auc: "93.79", recall: "93.14", gap: "1.07",  epochs: 27, best: false },
  { name: "2L-128-64-ELU-Adam",      trainAcc: "86.83", testAcc: "85.76", auc: "93.77", recall: "90.86", gap: "1.07",  epochs: 23, best: false },
  { name: "2L-128-64-Sigmoid-Adam",  trainAcc: "86.29", testAcc: "87.50", auc: "94.37", recall: "94.29", gap: "1.21",  epochs: 27, best: false },
  { name: "2L-256-128-ReLU-Adam",    trainAcc: "99.46", testAcc: "86.11", auc: "93.09", recall: "94.86", gap: "13.34", epochs: 44, best: false },
  { name: "3L-256-128-64-ReLU-Adam", trainAcc: "99.46", testAcc: "85.76", auc: "91.53", recall: "91.43", gap: "13.69", epochs: 31, best: false },
];

const imputationData = [
  { name: "IterativeImputer (Bayesian)", val: 85.44, best: true  },
  { name: "Per-column imputation",       val: 81.39               },
  { name: "Simple median / mode",        val: 80.11               },
  { name: "Drop high-missing cols",      val: 79.75               },
  { name: "Drop all NaN rows",           val: 76.48, worst: true  },
];

function Dashboard({ data }) {
  const [historyTab, setHistoryTab] = useState(0);

  return (
    <>
      <div className="metrics-row">
        <MetricCard label="GPA predictor — R²"   value="76.9%" sub="RMSE 0.57 · 1L-RMSprop"   color="blue"   />
        <MetricCard label="Persistence — AUC"     value="85.4%" sub="Recall 90.8% · 3L-ReLU"   color="green"  />
        <MetricCard label="Student success — AUC" value="94.6%" sub="Accuracy 87.5% · 1L-ReLU" color="amber"  />
        <MetricCard label="Dataset"               value="1,437" sub="14 features · 8 imputed"   color="purple" />
      </div>

      <div className="three-col">
        <div className="card">
          <div className="card-title">Model comparison — AUC / R²</div>
          <BarRow label="Student success" value={94.6} color="#3B82F6" />
          <BarRow label="Persistence"     value={85.4} color="#10B981" />
          <BarRow label="GPA — R²"        value={76.9} color="#F59E0B" />
          <div className="chart-legend" style={{ marginTop: 12 }}>
            <div className="legend-item"><div className="legend-dot" style={{ background: "#3B82F6" }} />Success AUC</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: "#10B981" }} />Persistence AUC</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: "#F59E0B" }} />GPA R²</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Feature importance — success</div>
          <BarRow label="First term GPA" value={92} color="#3B82F6" />
          <BarRow label="HS average"     value={73} color="#3B82F6" />
          <BarRow label="Math score"     value={56} color="#10B981" />
          <BarRow label="Funding"        value={34} color="#10B981" />
          <BarRow label="English grade"  value={34} color="#10B981" />
          <BarRow label="Age group"      value={34} color="#10B981" />
        </div>

        <div className="card">
          <div className="card-title">Confusion matrix — success</div>
          <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 6 }}>
            Test set · 288 students
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
            <div style={{ flex: 1, fontSize: 10, color: theme.textMuted, textAlign: "center" }}>Pred 0</div>
            <div style={{ flex: 1, fontSize: 10, color: theme.textMuted, textAlign: "center" }}>Pred 1</div>
          </div>
          <div className="conf-grid">
            <div className="conf-cell" style={{ background: theme.successSoft }}>
              <div className="conf-num"  style={{ color: theme.success }}>198</div>
              <div className="conf-lbl"  style={{ color: theme.success }}>True neg</div>
            </div>
            <div className="conf-cell" style={{ background: theme.dangerSoft }}>
              <div className="conf-num"  style={{ color: theme.danger }}>14</div>
              <div className="conf-lbl"  style={{ color: theme.danger }}>False pos</div>
            </div>
            <div className="conf-cell" style={{ background: theme.dangerSoft }}>
              <div className="conf-num"  style={{ color: theme.danger }}>22</div>
              <div className="conf-lbl"  style={{ color: theme.danger }}>False neg</div>
            </div>
            <div className="conf-cell" style={{ background: theme.successSoft }}>
              <div className="conf-num"  style={{ color: theme.success }}>54</div>
              <div className="conf-lbl"  style={{ color: theme.success }}>True pos</div>
            </div>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Imputation comparison — persistence AUC</div>
          {imputationData.map((item, i) => (
            <div className="imp-row" key={i}>
              <div className="imp-name">{item.name}</div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div className="imp-val">{item.val}%</div>
                {item.best  && <span className="badge badge-success">Best</span>}
                {item.worst && <span className="badge badge-danger">Worst</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Training history — AUC</div>
          <div className="tabs">
            {["Success model", "Persistence", "GPA — R²"].map((t, i) => (
              <div
                key={i}
                className={`tab ${historyTab === i ? "active" : ""}`}
                onClick={() => setHistoryTab(i)}
              >
                {t}
              </div>
            ))}
          </div>
          <div className="chart-bars">
            {trainData.map((v, i) => (
              <div
                key={i}
                className="chart-bar"
                style={{ height: `${v}%`, background: theme.accentSoft }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
            {valData.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: theme.accent, opacity: v / 100,
                }}
              />
            ))}
          </div>
          <div className="chart-legend" style={{ marginTop: 10 }}>
            <div className="legend-item"><div className="legend-dot" style={{ background: theme.accentSoft }} />Train AUC</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: theme.accent    }} />Val AUC</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;