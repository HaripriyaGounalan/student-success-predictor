import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.feature_selection import RFECV


def build_default_rfecv_estimator(random_state: int = 42) -> RandomForestRegressor:
    """Return a stable default estimator for RFECV on tabular regression data."""
    return RandomForestRegressor(
        n_estimators=200,
        random_state=random_state,
        n_jobs=1,
    )


def run_rfecv_selection(
    X_train: pd.DataFrame,
    y_train,
    estimator=None,
    *,
    step: int = 1,
    cv: int = 3,
    scoring: str = "neg_root_mean_squared_error",
    min_features_to_select: int = 10,
    n_jobs: int = 1,
    verbose: int = 0,
):
    """
    Run RFECV on a preprocessed feature matrix and return the selector plus summaries.

    Notes:
    - Use this after the DataCleaner has already transformed the raw training data.
    - The default estimator is a RandomForestRegressor because it handles mixed,
      non-linear tabular relationships better than linear models for this project.
    - Default n_jobs=1 is intentional to avoid Windows multiprocessing issues in
      notebook environments.
    """
    if not isinstance(X_train, pd.DataFrame):
        raise TypeError("X_train must be a pandas DataFrame so selected columns can be tracked.")

    if estimator is None:
        estimator = build_default_rfecv_estimator()

    selector = RFECV(
        estimator=estimator,
        step=step,
        cv=cv,
        scoring=scoring,
        min_features_to_select=min_features_to_select,
        n_jobs=n_jobs,
        verbose=verbose,
    )
    selector.fit(X_train, y_train)

    selected_columns = X_train.columns[selector.support_].tolist()

    ranking_df = pd.DataFrame(
        {
            "feature": X_train.columns,
            "selected": selector.support_,
            "rank": selector.ranking_,
        }
    ).sort_values(["rank", "feature"]).reset_index(drop=True)

    cv_raw = selector.cv_results_
    cv_results = pd.DataFrame(
        {
            "mean_test_score": cv_raw["mean_test_score"],
            "std_test_score": cv_raw["std_test_score"],
        }
    )

    if "n_features" in cv_raw:
        cv_results["n_features"] = pd.Series(cv_raw["n_features"]).astype(int)
    else:
        n_candidates = len(cv_results)
        cv_results["n_features"] = list(
            range(min_features_to_select, min_features_to_select + n_candidates)
        )

    if scoring == "neg_root_mean_squared_error":
        cv_results["mean_rmse"] = -cv_results["mean_test_score"]
        cv_results["std_rmse"] = cv_results["std_test_score"]

    return {
        "selector": selector,
        "selected_columns": selected_columns,
        "ranking_df": ranking_df,
        "cv_results_df": cv_results,
    }


def apply_selected_columns(
    X_train: pd.DataFrame,
    X_val: pd.DataFrame,
    X_test: pd.DataFrame,
    selected_columns,
):
    """Subset aligned train/validation/test matrices to the selected feature columns."""
    return (
        X_train.loc[:, selected_columns].copy(),
        X_val.loc[:, selected_columns].copy(),
        X_test.loc[:, selected_columns].copy(),
    )
