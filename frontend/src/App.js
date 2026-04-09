import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import InputForm from "./components/InputForm";
import ResultCard from "./components/ResultCard";

function App() {
  const [formData, setFormData] = useState({
    hs_avg: "",
    first_term_gpa: "",
    math_score: "",
    english_grade: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/predict",
        {
          hs_avg: Number(formData.hs_avg),
          first_term_gpa: Number(formData.first_term_gpa),
          math_score: Number(formData.math_score),
          english_grade: Number(formData.english_grade)
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("❌ Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="card">
        <h1>🎓 Student Success Predictor</h1>

        <InputForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
        />

        {result && <ResultCard result={result} />}
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
