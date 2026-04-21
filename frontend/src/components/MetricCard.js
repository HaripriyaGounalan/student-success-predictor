import React from "react";

function MetricCard({ label, value, sub, color }) {
return (
    <div className={`metric-card ${color}`}>
        <div className="metric-label">{label}</div>
        <div className="metric-value">{value}</div>
        <div className="metric-sub">{sub}</div>
    </div>
    );
}

export default MetricCard;