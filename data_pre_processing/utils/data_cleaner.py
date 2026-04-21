import pandas as pd
import numpy as np

from sklearn.experimental import enable_iterative_imputer  # noqa: F401
from sklearn.impute import IterativeImputer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import BayesianRidge
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

class DataCleaner:
    def __init__(self, numeric_imputer: str = "bayesian", random_state: int = 42):
        self.numeric_imputer = numeric_imputer.lower()
        self.random_state = random_state

        self.numeric_cols = [
            "first_term_gpa",
            "second_term_gpa",
            "high_school_average_mark",
            "math_score",
        ]
        self.binary_cols = ["fast_track", "coop", "residency"]
        self.nominal_cols = ["first_language", "funding", "gender", "previous_education"]
        self.ordinal_cols = ["age_group", "english_grade"]

        self.missing_flag_cols = [
            "first_term_gpa",
            "second_term_gpa",
            "high_school_average_mark",
            "math_score",
            "first_language",
            "funding",
            "gender",
            "previous_education",
            "age_group",
            "english_grade",
        ]

        self.age_imputer = SimpleImputer(strategy="most_frequent")
        self.eng_imputer = SimpleImputer(strategy="median")

        self.imputer = None
        self.scaler = None
        self.feature_columns_ = None
        self.is_fitted_ = False

    def _check_required_columns(self, df: pd.DataFrame) -> None:
        # required in the raw dataset passed into the cleaner.
        raw_nominal_cols = [col for col in self.nominal_cols ]
        required = self.numeric_cols + self.binary_cols + raw_nominal_cols + self.ordinal_cols
        missing = [col for col in required if col not in df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")

    def _get_estimator(self):
        """ decide which estimator to use for numeric imputation based on the numeric_imputer parameter """
        if self.numeric_imputer == "random_forest":
            return RandomForestRegressor(
                n_estimators=50,
                random_state=self.random_state
            )
        if self.numeric_imputer == "bayesian":
            return BayesianRidge()
        raise ValueError("numeric_imputer must be 'bayesian' or 'random_forest'")

    def _clean_raw(self, df: pd.DataFrame, drop_duplicates: bool = False, fit: bool = False) -> pd.DataFrame:
        """ basic cleaning of raw data: replace "?" with NaN, convert to numeric, create missing flags, and handle missing values."""
        df = df.copy().replace("?", np.nan)

        if drop_duplicates:
            df = df.drop_duplicates().copy()

        self._check_required_columns(df)

        for col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        for col in self.binary_cols:
            df[col] = df[col].map({1: 1, 2: 0})

        for col in self.missing_flag_cols:
            df[f"{col}_missing"] = df[col].isna().astype(int)

        if fit:
            df["age_group"] = self.age_imputer.fit_transform(df[["age_group"]]).ravel()
            df["english_grade"] = self.eng_imputer.fit_transform(df[["english_grade"]]).ravel()
        else:
            df["age_group"] = self.age_imputer.transform(df[["age_group"]]).ravel()
            df["english_grade"] = self.eng_imputer.transform(df[["english_grade"]]).ravel()

        # Nominal columns
        raw_nominal_cols = [
            col for col in self.nominal_cols if col not in {"previous_education"}
        ]
        df[raw_nominal_cols] = df[raw_nominal_cols].fillna(0).astype(int)   # 0 = Missing
        df["previous_education"] = df["previous_education"].fillna(3).astype(int)  # 0 = Unknown, 3 = Missing

        return df
    
    def _clip_numeric(self, df: pd.DataFrame) -> pd.DataFrame:
        """clipping out of range values for numeric columns based on given constraints """
        df["first_term_gpa"] = df["first_term_gpa"].clip(0, 4.5)
        df["second_term_gpa"] = df["second_term_gpa"].clip(0, 4.5)
        df["high_school_average_mark"] = df["high_school_average_mark"].clip(0, 100)
        df["math_score"] = df["math_score"].clip(0, 50)
        return df

    def _encode_nominals(self, df: pd.DataFrame) -> pd.DataFrame:
        """one-hot encode nominal columns"""
        return pd.get_dummies(df, columns=self.nominal_cols, drop_first=False)

    def fit(self, X_train: pd.DataFrame):
        """ fit the imputer and scaler on the training data, and determine the final feature columns after encoding """
        df = self._clean_raw(X_train, drop_duplicates=True, fit=True)

        self.imputer = IterativeImputer(
            estimator=self._get_estimator(),
            max_iter=15,
            random_state=self.random_state,
            initial_strategy="median"
        )

        df[self.numeric_cols] = self.imputer.fit_transform(df[self.numeric_cols])
        df = self._clip_numeric(df)

        self.scaler = StandardScaler()
        df[self.numeric_cols] = self.scaler.fit_transform(df[self.numeric_cols])

        df = self._encode_nominals(df)

        self.feature_columns_ = df.columns.tolist()
        self.is_fitted_ = True
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        """ apply the same transformations to new data, used for validation and testing """
        if not self.is_fitted_:
            raise ValueError("Call fit() before transform().")

        df = self._clean_raw(X, drop_duplicates=False)

        df[self.numeric_cols] = self.imputer.transform(df[self.numeric_cols])

        df = self._clip_numeric(df)

        df[self.numeric_cols] = self.scaler.transform(df[self.numeric_cols])

        df = self._encode_nominals(df)

        df = df.reindex(columns=self.feature_columns_, fill_value=0)
        return df

    def fit_transform(self, X_train: pd.DataFrame) -> pd.DataFrame:
        """method to fit and transform the training data in one step, for convenience during model training"""
        self.fit(X_train)
        return self.transform(X_train)
