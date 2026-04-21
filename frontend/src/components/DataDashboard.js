import React from "react";
import { useState } from "react";
import MetricCard from "./MetricCard";
import BarRow from "./BarRow";
import CountPlot from "./CountPlot";
import CountPlotVertical from "./CountPlotVertical";
import theme from "../theme";

const missingData = [
    { label: "High School Average Mark", value: 743 },
    { label: "Math score", value: 462 },
    { label: "Second Term Gpa", value: 160 },
    { label: "First Language", value: 111 },
    { label: "English Grade", value: 45 },
    { label: "First Term Gpa", value: 17 },
    { label: "Previous Education", value: 4 },
    { label: "Age group", value: 4 }
];

const firstYearPersistentDistribution = [
    { label: "(0) Dropout", value: 299 },
    { label: "(1) Persist", value: 1138 },
];

const corrContinuedVariables = [
    { label: "First term GPA", value: [1, 0.8, 0.59, 0.46] },
    { label: "Second term GPA", value: [0.8, 1, 0.55, 0.45] },
    { label: "HS average mark", value: [0.59, 0.55, 1, 0.53] },
    { label: "Math score", value: [0.46, 0.45, 0.53, 1] },
];

const missingByFeature = [
    { label: "First Term Gpa", value: [1, 0.31, -0.032, -0.0058, -0.0058, -0.075, -0.062, 0.017] },
    { label: "Second Term Gpa", value: [0.31, 1, -0.044, 0.023, 0.023, -0.016, -0.097, 0.063] },
    { label: "First Language", value: [-0.032, -0.044, 1, 0.18, 0.18, 0.28, -0.076, -0.0071] },
    { label: "Previous Education", value: [-0.0058, 0.023, 0.18, 1, 1, 0.051, 0.02, -0.0095] },
    { label: "Age group", value: [-0.0058, 0.023, 0.018, 1, 1, 0.051, 0.02, -0.0095] },
    { label: "HS average mark", value: [-0.075, -0.16, 0.28, 0.051, 0.051, 1, 0.39, -0.058] },
    { label: "Math score", value: [-0.062, -0.097, -0.076, 0.02, 0.02, 0.39, 1, 0.16] },
    { label: "English Grade", value: [0.017, 0.063, -0.0071, -0.0095, -0.0095, -0.058, 0.16, 1] },
];

const phikByFeature = [
    { label: "First Year Persistence", value: 1 },
    { label: "First Term Gpa", value: 0.76 },
    { label: "Second Term Gpa", value: 0.59 },
    { label: "Residency", value: 0.32 },
    { label: "Math Score", value: 0.32 },
    { label: "Funding", value: 0.31 },
    { label: "FastTrack", value: 0.27 },
    { label: "High School Average Mark", value: 0.27 },
    { label: "English Grade", value: 0.24 },
    { label: "Age Group", value: 0.2 },
    { label: "First Language", value: 0.11 },
    { label: "Previous Education", value: 0.074 },
    { label: "Gender", value: 0.048 },
    { label: "Coop", value: 0 },
];

function DataDashboard({ data }) {
    const [historyTab, setHistoryTab] = useState(0);
    const maxVal = 1;
    const getColor = (value) => {
        if (value >= 0.5) {
            const intensity = (value - 0.5) / 0.5;
            const r = 250;
            const g = Math.round(250 - intensity * 200);
            const b = Math.round(250 - intensity * 200);
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            const intensity = (0.5 - value) / 0.5;
            const r = Math.round(250 - intensity * 80);
            const g = Math.round(250 - intensity * 80);
            const b = 255;
            return `rgb(${r}, ${g}, ${b})`;
        }
    };

    const getTextColor = (value) => {
        return value > 0.65 || value < 0.2 ? "#FFFFFF" : "#0F172A";
    };

    const scaleStops = [1.0, 0.8, 0.6, 0.4, 0.2, 0.0];

    return (
        <>
            <div className="metrics-row">
                <MetricCard label="Dataset" value="1,437" color="purple" />
                <MetricCard label="Features" value="14" color="amber" />
                <MetricCard label="Continuous Features" value="4" color="blue" />
                <MetricCard label="Categorical Features" value="10" color="green" />
            </div>

            <div className="two-col">
                <div className="card">
                    <CountPlot
                        data={missingData}
                        title="Missing values by feature"
                        color="#2563EB"
                    />
                </div>
                <div className="card">
                    <CountPlotVertical
                        title="First Year Persistence"
                        xLabel="Persistence"
                        yLabel="Count"
                        color="#2563EB"
                        chartHeight={350}
                        data={firstYearPersistentDistribution}
                    />
                </div>
            </div>

            <div className="two-col">
                <div className="card">
                    <div className="card-title">Correlation Matrix of Missingness</div>

                    {/* Column labels */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 4, paddingLeft: 70 }}>
                        {missingByFeature.map((t) => (
                            <div key={t.label} className="corr-column-label">
                                {t.label}
                            </div>
                        ))}
                    </div>

                    {missingByFeature.map((r, i) => {
                        const row = missingByFeature[i];
                        const label = row.label;
                        const values = row.value;
                        const maxVal = 1;

                        return (
                            <div key={i} style={{ display: "flex", gap: 4, marginBottom: 4, alignItems: "center" }}>
                                <div style={{ width: 60, fontSize: 15, color: "#8394ac", textAlign: "right", paddingRight: 6 }}>
                                    {label}
                                </div>
                                {values.map((v, j) => (
                                    <div key={j} style={{
                                        flex: 1,
                                        height: 80,
                                        backgroundColor: getColor(v),
                                        color: getTextColor(v),
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 20,
                                        fontWeight: "bold",
                                        borderRadius: 4,
                                    }}>
                                        {v}
                                    </div>
                                ))}
                            </div>
                        )
                    })}
                </div>

                <div className="card">
                    <div className="card-title">Correlation Matrix of Continued Variables</div>

                    {/* Column labels */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 4, paddingLeft: 70 }}>
                        {corrContinuedVariables.map((t) => (
                            <div key={t.label} className="corr-column-label">
                                {t.label}
                            </div>
                        ))}
                    </div>

                    {corrContinuedVariables.map((r, i) => {
                        const row = corrContinuedVariables[i];
                        const label = row.label;
                        const values = row.value;
                        const maxVal = 1;

                        return (
                            <div key={i} style={{ display: "flex", gap: 4, marginBottom: 4, alignItems: "center" }}>
                                <div style={{ width: 60, fontSize: 15, color: "#8394ac", textAlign: "right", paddingRight: 6 }}>
                                    {label}
                                </div>
                                {values.map((v, j) => (
                                    <div key={j} style={{
                                        flex: 1,
                                        height: 165,
                                        backgroundColor: getColor(v),
                                        color: getTextColor(v),
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 20,
                                        fontWeight: "bold",
                                        borderRadius: 4,
                                    }}>
                                        {v}
                                    </div>
                                ))}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="two-col">
                <div className="card">
                    <div className="card-title">Phik Correlation - First Year Persistence</div>
                    <div style={{ display: "flex", alignItems: "stretch", gap: 12 }}>

                        {/* Row labels + bars */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                            {phikByFeature.map((row, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>

                                    {/* Row label */}
                                    <div style={{
                                        width: 160,
                                        fontSize: 14,
                                        color: "#475569",
                                        textAlign: "right",
                                        paddingRight: 6,
                                        flexShrink: 0,
                                        whiteSpace: "nowrap",
                                    }}>
                                        {row.label}
                                    </div>

                                    {/* Bar cell */}
                                    <div style={{
                                        flex: 1,
                                        height: 50,
                                        background: getColor(row.value),
                                        borderRadius: 3,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: getTextColor(row.value),
                                        transition: "opacity 0.15s",
                                    }}>
                                        {row.value % 1 === 0 ? row.value : row.value}
                                    </div>
                                </div>
                            ))}

                            {/* X axis label */}
                            <div style={{
                                    textAlign: "center", fontSize: 14, color: "#475569",
                                    marginTop: 8, paddingLeft: 168
                                }}>
                                    First Year Persistence
                                </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

export default DataDashboard;