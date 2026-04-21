import React from "react";

function NavItem({ label, active, onClick }) {
return (
    <div className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
        <div className="nav-dot" />
        {label}
    </div>
    );
}

export default NavItem;