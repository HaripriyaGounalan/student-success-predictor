import pandas as pd
import numpy as np


class DataCleaner:
    """Preprocess student data for neural network modeling."""

    def __init__(self, df: pd.DataFrame):
        self.df = df


    def clean(self) -> pd.DataFrame:
        # 1. Replace ? with NaN, convert to numeric, remove duplicates, drop non-informative column
        clean_df = self.df.replace("?", np.nan).apply(pd.to_numeric, errors="coerce").drop_duplicates()
        clean_df = clean_df.drop(columns=["school"], errors="ignore")

        # 2. Define variable groups
        numeric_cols = ["first_term_gpa", "second_term_gpa", "high_school_average_mark", "math_score"]
        binary_cols = ["fast_track", "coop", "residency"]
        nominal_cols = ["first_language", "funding", "gender", "previous_education"]
        ordinal_cols = ["age_group", "english_grade"]
        target_col = "first_year_persistence"

        # 3. Validate coded values (invalid -> NaN)
        clean_df["first_language"] = clean_df["first_language"].where(clean_df["first_language"].isin([1, 2, 3]), np.nan)
        clean_df["funding"] = clean_df["funding"].where(clean_df["funding"].isin(range(1, 10)), np.nan)
        clean_df["gender"] = clean_df["gender"].where(clean_df["gender"].isin([1, 2, 3]), np.nan)
        clean_df["previous_education"] = clean_df["previous_education"].where(clean_df["previous_education"].isin([1, 2]), np.nan)
        clean_df["age_group"] = clean_df["age_group"].where(clean_df["age_group"].isin(range(1, 11)), np.nan)
        clean_df["english_grade"] = clean_df["english_grade"].where(clean_df["english_grade"].isin(range(1, 12)), np.nan)

        # 4. Convert binary variables (1/2 -> 1/0)
        for col in binary_cols:
            clean_df[col] = clean_df[col].map({1: 1, 2: 0})

        # 5. Apply logical bounds to numeric variables
        clean_df["high_school_average_mark"] = clean_df["high_school_average_mark"].clip(0, 100)

        # 6. Create missing flags
        clean_df["second_term_gpa_missing"] = clean_df["second_term_gpa"].isna().astype(int)
        clean_df["high_school_average_mark_missing"] = clean_df["high_school_average_mark"].isna().astype(int)
        clean_df["math_score_missing"] = clean_df["math_score"].isna().astype(int)

        # 7. Impute numeric and ordinal variables
        for col in numeric_cols:
            clean_df[col] = clean_df[col].fillna(clean_df[col].median())

        for col in ordinal_cols:
            clean_df[col] = clean_df[col].fillna(clean_df[col].mode()[0])

        # 8. Map coded categories to labels
        clean_df["first_language"] = clean_df["first_language"].map({
            1: "English", 2: "French", 3: "Other"
        })
        clean_df["funding"] = clean_df["funding"].map({
            1: "Apprentice_PS",
            2: "GPOG_FT",
            3: "Intl_Offshore",
            4: "Intl_Regular",
            5: "Intl_Transfer",
            6: "Joint_Ryerson",
            7: "Joint_UTSC",
            8: "Second_Career",
            9: "Work_Safety"
        })
        clean_df["gender"] = clean_df["gender"].map({
            1: "Female", 2: "Male", 3: "Neutral"
        })
        clean_df["previous_education"] = clean_df["previous_education"].map({
            1: "Yes", 2: "No"
        })

        # 9. Fill nominal missing with explicit category
        for col in nominal_cols:
            clean_df[col] = clean_df[col].fillna("Missing")

        # 10. Clean target variable
        clean_df = clean_df[clean_df[target_col].isin([0, 1])]
        clean_df[target_col] = clean_df[target_col].astype(int)

        # 11. One-hot encode nominal variables
        clean_df = pd.get_dummies(clean_df, columns=nominal_cols, drop_first=False)

        return clean_df