# Add project folder to sys.path
import sys
from pathlib import Path
project_path = Path(r"C:\Users\Vivek K\Haripriya\Sem_5\Neural Networks\Final_Project\student-success-predictor")
sys.path.append(str(project_path))

import joblib
import pandas as pd
from keras.models import load_model

# ------ Main Prediction Function ------
def predict_gpa(
    clean_df: pd.DataFrame,
    target_column: str,
    preprocessing_pipeline_path: str,
    target_scaler_path: str,
    model_path: str,
    drop_columns: list[str] | None = None,
):
    """
    Predict GPA (second or third term) using saved pipeline, scaler, and model.
    """
    # Prepare features
    X = clean_df.drop(columns=drop_columns, errors="ignore")

    # Load artifacts
    pipeline = joblib.load(preprocessing_pipeline_path)
    scaler = joblib.load(target_scaler_path)
    model = load_model(model_path, compile=False)

    # Predict (scaled → original)
    X_processed = pipeline.transform(X)
    y_scaled = model.predict(X_processed, verbose=0)
    predictions = scaler.inverse_transform(y_scaled).flatten()

    return predictions

#------ Run Second Term Predictions ------
structured_data_file = project_path / "data/structured_student_data.csv"
clean_df = pd.read_csv(structured_data_file)

pre_processing_pipeline_path = project_path / "second_term_gpa_regression" / "models" / "best_model" / "preprocessing_pipeline.pkl"
target_scaler_path = project_path / "second_term_gpa_regression" / "models" / "best_model" / "target_scaler.pkl"
model_path = project_path / "second_term_gpa_regression" / "models" / "best_model" / "custom_model_bayesian.keras"

second_term_predictions = predict_gpa(
    clean_df=clean_df.copy(),
    target_column="second_term_gpa",
    preprocessing_pipeline_path=pre_processing_pipeline_path,
    target_scaler_path=target_scaler_path,
    model_path=model_path,
    drop_columns=["second_term_gpa", "first_year_persistence","school"],
)

print(second_term_predictions[:5])


# ------ Run Third Term Predictions ----------
pre_processing_pipeline_path = project_path / "second_term_gpa_regression" / "models" / "best_model" / "relay_third_term_preprocessing_pipeline.pkl"
target_scaler_path = project_path / "second_term_gpa_regression" / "models" / "best_model" / "relay_third_term_target_scaler.pkl"
model_path = project_path / "second_term_gpa_regression" / "models" / "best_model" / "relay_third_term_regression_ann_model.keras"

third_term_predictions = predict_gpa(
    clean_df=clean_df.copy(),
    target_column="third_term_gpa_proxy",
    preprocessing_pipeline_path=pre_processing_pipeline_path,
    target_scaler_path=target_scaler_path,
    model_path=model_path,
    drop_columns=["school"],
)

print(third_term_predictions[:5])