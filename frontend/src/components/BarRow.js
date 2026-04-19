import React from "react";

function BarRow({ label, value, max = 100, color }) {
return (
    <div className="bar-row">
        <div className="bar-label">{label}</div>
        <div className="bar-track">
        <div
            className="bar-fill"
            style={{ width: `${(value / max) * 100}%`, background: color }}
        />
        </div>
        <div className="bar-val">{value}%</div>
    </div>
    );
}

export default BarRow;