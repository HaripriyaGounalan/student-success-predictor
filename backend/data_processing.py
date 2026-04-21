import numpy as np
import pandas as pd


NUMERICAL_BOUNDS = {
    'First Term Gpa': {'min': 0.0, 'max': 4.5},
    'Second Term Gpa': {'min': 0.0, 'max': 4.5},
    'High School Average Mark': {'min': 0.0, 'max': 100.0},
    'Math Score': {'min': 0.0, 'max': 50.0},
}

CATEGORICAL_ALLOWED = {
    'First Language': [1, 2, 3],
    'Funding': [1, 2, 3, 4, 5, 6, 7, 8, 9],
    'FastTrack': [1, 2],
    'Coop': [1, 2],
    'Residency': [1, 2],
    'Gender': [1, 2, 3],
    'Previous Education': [1, 2],
    'Age Group': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    'English Grade': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
}

SELECTED_FEATURES = ['First Term Gpa', 'High School Average Mark', 'Math Score', 'Funding', 'Residency', 'FastTrack', 'Age Group', 'English Grade', 'Previous Education']
CATEGORICAL_COLS_TO_ROUND = ['First Language', 'Previous Education', 'Age Group', 'English Grade']


def preprocess_for_predict(df_raw: pd.DataFrame,
                           iterative_imputer,
                           imputer_columns: list,
                           categorical_ranges: dict,
                           numerical_bounds: dict,
                           categorical_allowed: dict,
                           selected_features: list) -> pd.DataFrame:

    df = df_raw.copy()

    df.drop(columns=['School'], errors='ignore', inplace=True)

    for col in imputer_columns:
        if col not in df.columns:
            df[col] = np.nan

    df.replace('?', np.nan, inplace=True)
    df = df.apply(pd.to_numeric, errors='coerce')

    for col, bounds in numerical_bounds.items():
        if col in df.columns:
            df[col] = df[col].clip(lower=bounds['min'], upper=bounds['max'])

    for col, allowed in categorical_allowed.items():
        if col in df.columns:
            invalid = ~df[col].isin(allowed) & df[col].notna()
            df.loc[invalid, col] = np.nan

    df_to_impute = df[imputer_columns].copy()
    df_imputed = pd.DataFrame(
        iterative_imputer.transform(df_to_impute),
        columns=imputer_columns,
        index=df_to_impute.index,
    )
    df[imputer_columns] = df_imputed

    for col in CATEGORICAL_COLS_TO_ROUND:
        if col in df.columns and col in categorical_ranges:
            df[col] = df[col].round().clip(
                categorical_ranges[col]['min'],
                categorical_ranges[col]['max'],
            ).astype(int)

    for feat in selected_features:
        if feat not in df.columns:
            df[feat] = 0

    return df[selected_features]