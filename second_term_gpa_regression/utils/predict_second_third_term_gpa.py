from pathlib import Path
import sys
import joblib
import pandas as pd
from keras.models import load_model
from pydantic import BaseModel, Field

#----------- 1. add your project path here (the parent directory of student-success-predictor) -----------
project_path = Path(r"add-your-project-path-here\student-success-predictor")
sys.path.append(str(project_path))


#----------- 2. Load models, scalers, pipelines and config -------------------
SECOND_COLS = [
    "first_term_gpa", "first_language", "funding", "fast_track", "coop",
    "residency", "gender", "previous_education", "age_group",
    "high_school_average_mark", "math_score", "english_grade"
]

THIRD_COLS = [
    "first_term_gpa", "second_term_gpa", "first_language", "funding", "fast_track",
    "coop", "residency", "gender", "previous_education", "age_group",
    "high_school_average_mark", "math_score", "english_grade",
    "first_year_persistence"
]

SECOND_PIPELINE = project_path / "second_term_gpa_regression/models/best_model/preprocessing_pipeline.pkl"
SECOND_SCALER = project_path / "second_term_gpa_regression/models/best_model/target_scaler.pkl"
SECOND_MODEL = project_path / "second_term_gpa_regression/models/best_model/custom_model_bayesian.keras"

THIRD_PIPELINE = project_path / "second_term_gpa_regression/models/best_model/relay_third_term_preprocessing_pipeline.pkl"
THIRD_SCALER = project_path / "second_term_gpa_regression/models/best_model/relay_third_term_target_scaler.pkl"
THIRD_MODEL = project_path / "second_term_gpa_regression/models/best_model/relay_third_term_regression_ann_model.keras"

#------------ 3. Input schema --------------------------------------------------
class StudentInput(BaseModel):
    first_term_gpa: float = Field(..., ge=0.0, le=4.5)
    second_term_gpa: float | None = Field(None, ge=0.0, le=4.5)
    first_language: int = Field(..., ge=1, le=2)
    funding: int = Field(..., ge=1, le=9)
    fast_track: int = Field(..., ge=1, le=2)
    coop: int = Field(..., ge=1, le=2)
    residency: int = Field(..., ge=1, le=2)
    gender: int = Field(..., ge=1, le=2)
    previous_education: int = Field(..., ge=1, le=2)
    age_group: int = Field(..., ge=1, le=10)
    high_school_average_mark: float | None = Field(None, ge=0.0, le=100.0)
    math_score: float | None = Field(None, ge=0.0, le=50.0)
    english_grade: int = Field(..., ge=1, le=11)
    first_year_persistence: int = Field(..., ge=1, le=2)

#------------ 4. Convert input to DataFrame --------------------------------------
def to_df(student: StudentInput) -> pd.DataFrame:
    return pd.DataFrame([student.model_dump()])

#------------ 5. Prediction function ----------------------------------------------
def predict(df: pd.DataFrame, pipeline_path, scaler_path, model_path, columns):
    pipeline = joblib.load(pipeline_path)
    scaler = joblib.load(scaler_path)
    model = load_model(model_path, compile=False)

    X = df[columns]
    X = pipeline.transform(X)
    y = model.predict(X, verbose=0)
    return scaler.inverse_transform(y).flatten()[0]

#------------ 6. Main prediction logic ----------------------------------------------
def predict_student(student: StudentInput):
    df = to_df(student)

    second_term_gpa = predict( df, SECOND_PIPELINE, SECOND_SCALER, SECOND_MODEL, SECOND_COLS )

    df["second_term_gpa"] = second_term_gpa

    third_term_gpa = predict( df, THIRD_PIPELINE, THIRD_SCALER, THIRD_MODEL, THIRD_COLS )

    return {
        "second_term_gpa": round(float(second_term_gpa), 2),
        "third_term_gpa": round(float(third_term_gpa), 2),
    }

# =========================================================
# Main block for testing
# =========================================================
if __name__ == "__main__":
    student = StudentInput(
        first_term_gpa=3.1,
        second_term_gpa=3.2,  
        first_language=1,
        funding=2,
        fast_track=1,
        coop=2,
        residency=1,
        gender=1,
        previous_education=1,
        age_group=4,
        high_school_average_mark=78.5,
        math_score=42.0,
        english_grade=5,
        first_year_persistence=1
    )

    print(predict_student(student))