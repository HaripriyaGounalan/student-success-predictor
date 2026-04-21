import React from "react";
import { useState } from "react";

function CountPlot({ data, title, color = "#2563EB" }) {
  const [hovered, setHovered] = useState(null);
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="count-plot-header">
      {title && (
        <div className="card-title">
          {title}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d, i) => (
          <div key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "default" }}
          >
            {/* Label row */}
            <div className="count-plot-row-label">
              <span>{d.label}</span>
              <span className="count-plot-row-value">
                {d.value.toLocaleString()}
                <span className="count-plot-row-percentage">
                  ({((d.value / total) * 100).toFixed(1)}%)
                </span>
              </span>
            </div>

            {/* Bar */}
            <div className="bar-track">
              <div className="bar-fill" style={{
                width: `${(d.value / max) * 100}%`,
                height: "100%",
                background: hovered === i ? "#1D4ED8" : color,
                borderRadius: 4,
                transition: "width 0.5s ease, background 0.15s",
                display: "flex",
                alignItems: "center",
                paddingLeft: 8,
              }}>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CountPlot;