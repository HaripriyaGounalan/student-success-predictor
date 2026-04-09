Overview

This project is a full-stack intelligent application developed for the COMP-258 Neural Networks course. The goal is to predict student success using machine learning models and present the results through a user-friendly web interface.

The frontend is built using React.js and is responsible for collecting user input, communicating with backend APIs, and displaying prediction results along with data insights.

Features
1. Student Input Form
Users can enter student information:
High School Average
First Term GPA
Math Score
English Grade
Clean and modern UI design
Form validation-ready structure
2. Prediction Results

After submitting the form, the system displays:

✅ Program Completion Prediction
📘 First-Year Persistence Prediction
🎯 Predicted GPA (Regression Output)
🏆 Performance Category (Low / Average / High)
3. Dashboard (Data Insights)

The results page also includes a dashboard showing:

📊 Data exploration insights (from backend)
📈 GPA and performance trends
📋 Sample cleaned dataset (from backend)
🧠 Student insights and interpretation
4. Backend Integration
Frontend communicates with backend using REST API:
POST /predict
Sends user input data
Receives prediction + analytics results
🛠️ Technologies Used
React.js
Axios (API calls)
CSS (custom styling)
🚀 How to Run
cd frontend
npm install
npm start