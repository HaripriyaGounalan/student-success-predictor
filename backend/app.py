"""
Multi-Model API
===============
How to run:
    pip install fastapi uvicorn tensorflow scikit-learn joblib numpy
    uvicorn main:app --reload --port 8000

Visit http://localhost:8000/docs to test interactively.
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any, Optional
import numpy as np
import joblib, json, os
import tensorflow as tf
import uvicorn
import pandas as pd

from data_cleaner_proxy import DataCleaner
from data_processing import preprocess_for_predict, NUMERICAL_BOUNDS, CATEGORICAL_ALLOWED, SELECTED_FEATURES
from tensorflow.keras.models import load_model

app = FastAPI(title="Multi-Model API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ModelBase:
    """All models must implement predict()."""
    def predict(self, input: Any) -> Any:
        raise NotImplementedError

# ==============================================================================
# MODEL 1 — First-Year Persistence Predictor
# ==============================================================================

# ── Artifact loading ───────────────────────────────────────────────────────────

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "firstyearpersistence")
print(f"\nLoading artifacts from: {MODELS_DIR}")

_persistence_model = tf.keras.models.load_model(os.path.join(MODELS_DIR, "best_model.keras"))
_scaler            = joblib.load(os.path.join(MODELS_DIR, "scaler.pkl"))
_ohe               = joblib.load(os.path.join(MODELS_DIR, "ohe_funding.pkl"))
_knn_imputer       = joblib.load(os.path.join(MODELS_DIR, "knn_imputer.pkl"))
_gw_medians        = joblib.load(os.path.join(MODELS_DIR, "group_medians.pkl"))
_train_modes       = joblib.load(os.path.join(MODELS_DIR, "train_modes.pkl"))

with open(os.path.join(MODELS_DIR, "pipeline_config.json")) as f:
    _config = json.load(f)

TUNED_THRESHOLD = _config["tuned_threshold"]
FEATURE_NAMES   = _config["feature_names"]
OHE_COLS        = list(_ohe.get_feature_names_out(["funding"]))
SCALE_COLS      = _config["scale_cols"]
BINARY_RECODE   = _config["binary_recode_cols"]
VALID_RANGES    = _config.get("valid_ranges", {})

print(f"  Threshold        : {TUNED_THRESHOLD}")
print(f"  KNN expects      : {_knn_imputer.n_features_in_} features")
print(f"  Config features  : {len(FEATURE_NAMES)}")
print(f"  Feature list     : {FEATURE_NAMES}")
print(f"  OHE cols (actual): {OHE_COLS}\n")

# ── Schemas ────────────────────────────────────────────────────────────────────

class StudentInput(BaseModel):
    first_term_gpa:  float        = Field(..., ge=0.0, le=4.5)
    second_term_gpa: float        = Field(..., ge=0.0, le=4.5)
    first_language:  int          = Field(..., ge=1, le=2)
    funding:         int          = Field(..., ge=1, le=9)
    fast_track:      int          = Field(..., ge=1, le=2)
    coop:            int          = Field(..., ge=1, le=2)
    residency:       int          = Field(..., ge=1, le=2)
    gender:          int          = Field(..., ge=1, le=2)
    prev_education:  int          = Field(..., ge=1, le=2)
    age_group:       int          = Field(..., ge=1, le=10)
    hs_avg:          float | None = Field(None, ge=0.0, le=100.0)
    math_score:      float | None = Field(None, ge=0.0, le=50.0)
    english_grade:   int          = Field(..., ge=1, le=11)

class PersistenceOutput(BaseModel):
    persistence:    int
    probability:    float
    confidence_pct: float
    message_title:  str
    message_body:   str
    message_action: str
    message_tier:   str

# ── Pipeline helpers ───────────────────────────────────────────────────────────

def _run_persistence_pipeline(raw: dict) -> np.ndarray:
    d = raw.copy()

    for col, bounds in VALID_RANGES.items():
        if col in d and d[col] is not None:
            d[col] = max(float(bounds[0]), min(float(bounds[1]), float(d[col])))

    if d.get("first_language") == 3:
        d["first_language"] = 2
    if d.get("first_term_gpa") == 0.0 and (d.get("second_term_gpa") or 0) != 0.0:
        d["first_term_gpa"] = None

    hs = d.get("hs_avg")
    d["hs_avg_miss_flag"] = 1 if (hs is None or (isinstance(hs, float) and np.isnan(hs))) else 0

    if d.get("first_language") is None:
        d["first_language"] = 1 if d["residency"] == 1 else 2

    for col in ["first_term_gpa", "second_term_gpa", "math_score"]:
        val = d.get(col)
        if val is None or (isinstance(val, float) and np.isnan(val)):
            d[col] = float(_gw_medians[col][1])

    for col in ["gender", "prev_education", "age_group", "english_grade"]:
        if d.get(col) is None:
            d[col] = int(_train_modes[col])

    for col in BINARY_RECODE:
        if col in d and d[col] is not None:
            d[col] = int(d[col]) - 1

    funding_encoded = _ohe.transform([[d["funding"]]])[0]
    for col_name, val in zip(OHE_COLS, funding_encoded):
        d[col_name] = float(val)

    scale_vals = np.array(
        [[d.get(c) if d.get(c) is not None else np.nan for c in SCALE_COLS]],
        dtype=np.float64,
    )
    scaled = _scaler.transform(scale_vals)[0]
    for i, col in enumerate(SCALE_COLS):
        d[col] = float(scaled[i])

    FEATURE_NAMES_NO_PC = [f for f in FEATURE_NAMES if f != "program_completion"]
    row = np.array([[float(d.get(f, 0.0)) for f in FEATURE_NAMES_NO_PC]], dtype=np.float32)
    row = _knn_imputer.transform(row)

    gi1 = SCALE_COLS.index("first_term_gpa")
    gi2 = SCALE_COLS.index("second_term_gpa")
    threshold_scaled_1 = (2.0 - _scaler.mean_[gi1]) / _scaler.scale_[gi1]
    threshold_scaled_2 = (2.0 - _scaler.mean_[gi2]) / _scaler.scale_[gi2]
    thresh = (threshold_scaled_1 + threshold_scaled_2) / 2

    idx1 = FEATURE_NAMES_NO_PC.index("first_term_gpa")
    idx2 = FEATURE_NAMES_NO_PC.index("second_term_gpa")
    gpa1, gpa2 = row[0][idx1], row[0][idx2]
    program_completion = 1 if (gpa1 + gpa2) / 2 >= thresh else 0

    row = np.append(row, [[program_completion]], axis=1)
    return row


def _build_persistence_message(probability: float) -> dict:
    pct = round(probability * 100, 1)
    if probability >= 0.75:
        return {
            "tier"  : "high",
            "title" : "You're on a great path!",
            "body"  : (f"Our model sees a {pct}% likelihood that you will successfully complete "
                       "your first year. Your academic profile shows real strength. Keep showing "
                       "up, keep asking questions, and trust the process — you've got this!"),
            "action": ("Stay connected with your program advisor to make the most of every "
                       "opportunity. Consider joining a student club or study group to keep "
                       "that momentum going."),
        }
    elif probability >= 0.45:
        return {
            "tier"  : "medium",
            "title" : "You're on the right track — with some support you can thrive.",
            "body"  : (f"Our model estimates a {pct}% chance of completing your first year. "
                       "Many students in your situation go on to do brilliantly — the key is "
                       "connecting early with the right support."),
            "action": ("Book a free appointment with Academic Advising at "
                       "continuingeducation@centennialcollege.ca — they are there specifically "
                       "to help you succeed."),
        }
    else:
        return {
            "tier"  : "low",
            "title" : "Let's make sure you have everything you need.",
            "body"  : (f"Our model flags some potential challenges ahead ({pct}% persistence "
                       "likelihood). This is NOT a judgment — it is an early signal so we can "
                       "get you the right support before small obstacles become big ones. "
                       "Many students who started just like you went on to graduate with honours."),
            "action": ("Please reach out to Student Services today: "
                       "continuingeducation@centennialcollege.ca or visit the Student Success "
                       "Centre on campus. You are not alone — the earlier you connect, the "
                       "better the outcome."),
        }

# ── Model class ────────────────────────────────────────────────────────────────

class FirstYearPersistenceModel(ModelBase):
    """First-year student persistence predictor (Keras + sklearn pipeline)."""

    def predict(self, input: StudentInput) -> PersistenceOutput:
        X    = _run_persistence_pipeline(input.model_dump())
        prob = float(_persistence_model.predict(X, verbose=0)[0][0])
        msg  = _build_persistence_message(prob)
        return PersistenceOutput(
            persistence    = 1 if prob >= TUNED_THRESHOLD else 0,
            probability    = round(prob, 4),
            confidence_pct = round(prob * 100, 1),
            message_title  = msg["title"],
            message_body   = msg["body"],
            message_action = msg["action"],
            message_tier   = msg["tier"],
        )

SECOND_COLS = [
    "first_term_gpa", "first_language", "funding", "fast_track", "coop",
    "residency", "gender", "previous_education", "age_group",
    "high_school_average_mark", "math_score", "english_grade",
]
 
THIRD_COLS = [
    "first_term_gpa", "second_term_gpa", "first_language", "funding", "fast_track",
    "coop", "residency", "gender", "previous_education", "age_group",
    "high_school_average_mark", "math_score", "english_grade",
    "first_year_persistence",
]

class ChainedGPAInput(BaseModel):
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
 
class ChainedGPAOutput(BaseModel):
    predicted_second_term_gpa: float
    predicted_third_term_gpa:  float
    second_gpa_source:         str   # "predicted" or "provided"
 
# ── Helper ─────────────────────────────────────────────────────────────────────
 
def _chain_predict(df: "pd.DataFrame", pipeline, scaler, model, columns: list) -> float:
    """Run one stage of the chain: preprocess → predict → inverse scale."""
    X = pipeline.transform(df[columns])
    y_scaled = model.predict(X, verbose=0)
    return float(scaler.inverse_transform(y_scaled).flatten()[0])
 
 
GPA2_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "second_term_gpa_regression", "models", "best_model"
)
print(f"\nLoading second-term GPA artefacts from: {GPA2_DIR}")
 
_gpa2_preprocessing = joblib.load(os.path.join(GPA2_DIR, "preprocessing_pipeline.pkl"))
_gpa2_target_scaler = joblib.load(os.path.join(GPA2_DIR, "target_scaler.pkl"))
_gpa2_model = tf.keras.models.load_model(os.path.join(GPA2_DIR, "custom_model_bayesian.keras"),compile=False,)
_gpa3_cleaner = joblib.load(os.path.join(GPA2_DIR, "relay_third_term_preprocessing_pipeline.pkl"))
_gpa3_target_scaler = joblib.load(os.path.join(GPA2_DIR, "relay_third_term_target_scaler.pkl"))
_gpa3_model = tf.keras.models.load_model(os.path.join(GPA2_DIR, "relay_third_term_regression_ann_model.keras"),compile=False,)

class ChainedGPAModel(ModelBase):
    def predict(self, input: ChainedGPAInput) -> ChainedGPAOutput:
        df = pd.DataFrame([input.model_dump()])
 
        if input.second_term_gpa is not None:
            second_gpa   = input.second_term_gpa
            second_source = "provided"
        else:
            second_gpa   = _chain_predict(df, _gpa2_preprocessing, _gpa2_target_scaler, _gpa2_model, SECOND_COLS)
            second_source = "predicted"
 
        second_gpa = float(np.clip(second_gpa, 0.0, 4.5))
 
        df["second_term_gpa"] = second_gpa
        third_gpa = _chain_predict(df, _gpa3_cleaner, _gpa3_target_scaler, _gpa3_model, THIRD_COLS)
        third_gpa = float(np.clip(third_gpa, 0.0, 4.5))
 
        return ChainedGPAOutput(
            predicted_second_term_gpa = round(second_gpa, 2),
            predicted_third_term_gpa  = round(third_gpa, 2),
            second_gpa_source         = second_source,
        )

COMPLETION_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "studentcompletion")
print(f"Loading completion model artefacts from: {COMPLETION_DIR}")
_completion_model = load_model(os.path.join(COMPLETION_DIR, "student_completion_model5.keras"))
_completion_scaler = joblib.load(os.path.join(COMPLETION_DIR, "student_completion_scaler5.pkl"))
_completion_imputer = joblib.load(os.path.join(COMPLETION_DIR, "iterative_imputer5.pkl"))
with open(os.path.join(COMPLETION_DIR, "approach5_config.json")) as f:
    _approach5_config = json.load(f)
IMPUTER_COLUMNS = _approach5_config['all_cols']
CATEGORICAL_RANGES = _approach5_config['categorical_ranges']

class CompletionInput(BaseModel):
    first_term_gpa: float | None = Field(None, ge=0.0, le=4.5, description="First-term GPA (0.0-4.5)", alias="First Term Gpa")
    math_score: float | None = Field(None, ge=6.0, le=50.0, description="Math placement score; None if unknown", alias="Math Score")
    high_school_average_mark: float | None = Field(None, ge=17.0, le=108.0, description="High school average mark; None if unknown", alias="High School Average Mark")
    funding: int | None = Field(None, ge=1, le=9, description="Funding source code (1-9)", alias="Funding")
    english_grade: int | None = Field(None, ge=1, le=11, description="English placement grade (1-11)", alias="English Grade")
    residency: int | None = Field(None, ge=1, le=2, description="1=Domestic, 2=International", alias="Residency")
    fast_track: int | None = Field(None, ge=1, le=2, description="1=No, 2=Yes", alias="FastTrack")
    previous_education: int | None = Field(None, ge=1, le=2, description="1=High school, 2=Post secondary", alias="Previous Education")
    age_group: int | None = Field(None, ge=1, le=10, description="Age bracket code (1-10)", alias="Age Group")

    model_config = {"populate_by_name": True}


class CompletionOutput(BaseModel):
    completed: int
    probability: float
    confidence_pct: float


class StudentCompletionModel(ModelBase):

    def predict(self, input: CompletionInput) -> CompletionOutput:
        raw = {
            "First Term Gpa": input.first_term_gpa,
            "High School Average Mark": input.high_school_average_mark,
            "Math Score": input.math_score,
            "Funding": input.funding,
            "Residency": input.residency,
            "FastTrack": input.fast_track,
            "Age Group": input.age_group,
            "English Grade": input.english_grade,
            "Previous Education": input.previous_education,
        }
        df_raw = pd.DataFrame([raw])
        print(f"\nRaw input data:\n{df_raw.to_dict(orient='records')[0]}")

        X = preprocess_for_predict(
            df_raw,
            _completion_imputer,
            IMPUTER_COLUMNS,
            CATEGORICAL_RANGES,
            NUMERICAL_BOUNDS,
            CATEGORICAL_ALLOWED,
            SELECTED_FEATURES,
        )


        X_scaled = _completion_scaler.transform(X.values)

        prob = float(_completion_model.predict(X_scaled, verbose=0)[0][0])
        print(f"Raw model output (probability of completion): {prob}")

        return CompletionOutput(
            completed=1 if prob >= 0.5 else 0,
            probability=round(prob, 4),
            confidence_pct=round(prob * 100, 1),
        )

MODEL_REGISTRY: dict[str, ModelBase] = {
    "first-year-persistence" : FirstYearPersistenceModel(),
    "chained-gpa"            : ChainedGPAModel(),
    "student-completion"     : StudentCompletionModel(),
}

def get_model(model_name: str) -> ModelBase:
    model = MODEL_REGISTRY.get(model_name)
    if not model:
        raise HTTPException(
            status_code=404,
            detail=f"Model '{model_name}' not found. "
                   f"Available: {list(MODEL_REGISTRY.keys())}",
        )
    return model

#########################################################################################

@app.get("/")
def root():
    return {"status": "ok", "models": list(MODEL_REGISTRY.keys())}

@app.get("/models")
def list_models():
    return {"models": list(MODEL_REGISTRY.keys())}

@app.post("/predict/first-year-persistence", response_model=PersistenceOutput)
def predict_persistence(student: StudentInput):
    try:
        return MODEL_REGISTRY["first-year-persistence"].predict(student)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/predict/chained-gpa", response_model=ChainedGPAOutput)
def predict_chained_gpa(student: ChainedGPAInput):
    try:
        return MODEL_REGISTRY["chained-gpa"].predict(student)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/student-completion", response_model=CompletionOutput)
def predict_student_completion(student: CompletionInput):
    try:
        return MODEL_REGISTRY["student-completion"].predict(student)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)