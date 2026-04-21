import React from "react";
import { useState } from "react";

function CountPlotVertical({ data, title, xLabel, yLabel, chartHeight = 400, color = "#2563EB" }) {
  const [hovered, setHovered] = useState(null);
  const maxValue = Math.max(...data.map(d => d.value));
  const yTicks = 5;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((maxValue / yTicks) * i)
  );

  return (
    <div className="count-plot-header">
      {title && (
        <div className="card-title">
          {title}
        </div>
      )}

      <div style={{ display: "flex", gap: 0 }}>

        {/* Y axis labels */}
        <div style={{ display: "flex", flexDirection: "column-reverse",
          justifyContent: "space-between", paddingBottom: 24,
          paddingRight: 8 }}>
          {tickValues.map((v, i) => (
            <div key={i} className="count-plot-vertical-ytick">
              {v}
            </div>
          ))}
        </div>

        {/* Bars + X axis */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

          {/* Bar area */}
          <div style={{ position: "relative",
            borderLeft: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0" }}>

            {/* Bars */}
            <div className="count-plot-vertical-bar">
              {data.map((d, i) => {
                const barH = (d.value / maxValue) * chartHeight;
                return (
                  <div key={i} style={{ flex: 1, position: "relative",
                    display: "flex", flexDirection: "column", alignItems: "center" }}>

                    {/* Tooltip */}
                    {hovered === i && (
                      <div className="count-plot-vertical-tooltip">
                        {d.value.toLocaleString()}
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        width: "100%",
                        height: barH,
                        background: hovered === i ? `${color}CC` : color,
                        borderRadius: "3px 3px 0 0",
                        transition: "height 0.4s ease, background 0.15s",
                        cursor: "default",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* X axis labels */}
          <div style={{ display: "flex", padding: "0 16px", marginTop: 6, gap: 12 }}>
            {data.map((d, i) => (
              <div key={i} className= "count-plot-vertical-xlabel">
                {d.label}
              </div>
            ))}
          </div>

          {xLabel && (
            <div className="count-plot-vertical-xlabel">
              {xLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CountPlotVertical;