import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import Dashboard from "./components/Dashboard";
import GPAPage from "./components/GPAPage";
import PersistentPage from "./components/PersistentPage";
import SuccessPage from "./components/SuccessPage";
import ImputationPage from "./components/ImputationPage";
import DataDashboard from "./components/DataDashboard";
import FeaturePage from "./components/FeaturePage";

import NavItem from "./components/NavItem";

const pages = {
  dashboard: { label: "Dashboard", component: Dashboard },
  experiments: { label: "Data Exploration", component: DataDashboard },
  gpa: { label: "GPA predictor", component: GPAPage },
  persistence: { label: "Persistence model", component: PersistentPage },
  success: { label: "Student success", component: SuccessPage },
  imputation: { label: "Imputation compare", component: ImputationPage },
  features: { label: "Feature importance", component: FeaturePage },
};

const navItems = [
  { id: "dashboard", label: "Dashboard", section: "Overview" },
  { id: "experiments", label: "Data Exploration", section: null },
  { id: "gpa", label: "GPA predictor", section: "Models" },
  { id: "persistence", label: "Persistence model", section: null },
  { id: "success", label: "Student success", section: null },
  { id: "imputation", label: "Imputation compare", section: "Analysis" },
  { id: "features", label: "Feature importance", section: null },
];

function App() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const Page = pages[activeNav].component;

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo-area">
          <div className="logo-title">STUDENT</div>
        </div>
        {navItems.map((item) => (
          <div key={item.id}>
            {item.section && <div className="nav-section">{item.section}</div>}
            <NavItem
              label={item.label}
              active={activeNav === item.id}
              onClick={() => setActiveNav(item.id)}
            />
          </div>
        ))}
      </div>

      <div className="main">
        <div className="topbar">
        </div>
        <div className="content">
          <Page />
        </div>
      </div>
    </div>
  );
}

export default App;


















// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
