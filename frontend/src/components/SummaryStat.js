import React from "react";

function SummaryStat({ data }) {
    return (
        data.map((s, i) => (
            <div className="summary-stat" key={i}>
                <div className="summary-key">{s.key}</div>
                <div className="summary-val">{s.val}</div>
            </div>
        ))
    )
}

export default SummaryStat;