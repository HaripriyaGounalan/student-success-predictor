"""Data exploration utilities for student data analysis."""

from io import StringIO
from pathlib import Path
import logging

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns


INSIGHTS_DIR = Path(__file__).resolve().parents[1] / "insights"


class DataExplorer:
    """Class for exploring and analyzing student data."""

    def __init__(self, data_path: str):
        """Initialize the DataExplorer.

        Args:
            data_path: Path to the data file
        """
        self.data_path = data_path
        self.df: pd.DataFrame = None
        self.missing_values: pd.Series = None
        self.quality_summary: dict = {}
        self.target_column = "first_year_persistence"
        self.original_columns: list[str] = []
        self.derived_columns = ["GPA_BAND", "MARK_BAND", "MATH_BAND"]
        self.numeric_columns = [
            "first_term_gpa",
            "second_term_gpa",
            "high_school_average_mark",
            "math_score",
        ]
        self.categorical_columns = [
            "first_language",
            "funding",
            "school",
            "fast_track",
            "coop",
            "residency",
            "gender",
            "previous_education",
            "age_group",
            "english_grade",
        ]
        self.category_mappings: dict = {
            self.target_column: {
                0: "Did Not Persist",
                1: "Persisted",
            },
            "first_language": {
                1: "English",
                2: "French",
                3: "Other",
            },
            "funding": {
                1: "Apprentice_PS",
                2: "GPOG_FT",
                3: "Intl Offshore",
                4: "Intl Regular",
                5: "Intl Transfer",
                6: "Joint Program Ryerson",
                7: "Joint Program UTSC",
                8: "Second Career Program",
                9: "Work Safety Insurance Board",
            },
            "school": {
                1: "Advancement",
                2: "Business",
                3: "Communications",
                4: "Community and Health",
                5: "Hospitality",
                6: "Engineering",
                7: "Transportation",
            },
            "fast_track": {
                1: "Y",
                2: "N",
            },
            "coop": {
                1: "Y",
                2: "N",
            },
            "residency": {
                1: "Domestic",
                2: "International",
            },
            "gender": {
                1: "Female",
                2: "Male",
                3: "Neutral",
            },
            "previous_education": {
                1: "HighSchool",
                2: "PostSecondary",
            },
            "age_group": {
                1: "0 to 18",
                2: "19 to 20",
                3: "21 to 25",
                4: "26 to 30",
                5: "31 to 35",
                6: "36 to 40",
                7: "41 to 50",
                8: "51 to 60",
                9: "61 to 65",
                10: "66+",
            },
            "english_grade": {
                1: "Level-130",
                2: "Level-131",
                3: "Level-140",
                4: "Level-141",
                5: "Level-150",
                6: "Level-151",
                7: "Level-160",
                8: "Level-161",
                9: "Level-170",
                10: "Level-171",
                11: "Level-180",
            },
        }
        self._setup_directories()
        self._setup_logging()

    def _setup_directories(self) -> None:
        """Create necessary output directories."""
        dirs = [
            "correlation",
            "grouped_analysis",
            "persistence_analysis",
            "age_analysis",
            "quality_analysis",
        ]
        for dir_path in dirs:
            (INSIGHTS_DIR / dir_path).mkdir(parents=True, exist_ok=True)

    def _setup_logging(self) -> None:
        """Set up logging configuration."""
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s - %(levelname)s - %(message)s",
        )

    def load_data(self) -> pd.DataFrame:
        """Load the student data.

        Returns:
            pd.DataFrame: Loaded and preprocessed data
        """
        logging.info("Loading data...")
        self.df = pd.read_csv(self.data_path)
        self.original_columns = self.df.columns.tolist()
        logging.info(f"Dataset shape: {self.df.shape}")

        # Preprocess the data
        self.df = self._preprocess_data(self.df)
        return self.df

    def _preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Preprocess the data for analysis.

        Args:
            df: Raw dataframe

        Returns:
            pd.DataFrame: Preprocessed dataframe
        """
        df = df.copy()
        df = df.replace("?", pd.NA)

        for column in df.columns:
            df[column] = pd.to_numeric(df[column], errors="coerce")

        # Add GPA band column for grouped analysis
        df["GPA_BAND"] = pd.cut(
            df["first_term_gpa"],
            bins=[-0.01, 2.0, 3.0, 4.5],
            labels=["Low GPA", "Mid GPA", "High GPA"],
        )

        # Add High School Mark band column
        df["MARK_BAND"] = pd.cut(
            df["high_school_average_mark"],
            bins=[-0.01, 60, 70, 80, 100],
            labels=["0-60", "61-70", "71-80", "81-100"],
        )

        # Add Math Score band column
        df["MATH_BAND"] = pd.cut(
            df["math_score"],
            bins=[-0.01, 20, 30, 40, 50],
            labels=["0-20", "21-30", "31-40", "41-50"],
        )

        return df

    def analyze_basic_stats(self) -> pd.Series:
        """Perform initial data analysis.

        Returns:
            pd.Series: Missing value counts
        """
        logging.info("\n=== Data Analysis ===")
        logging.info("\nData Info:")
        info_buffer = StringIO()
        self.df[self.original_columns].info(buf=info_buffer)
        logging.info(info_buffer.getvalue())

        self.missing_values = self.df[self.original_columns].isnull().sum()
        logging.info("\nMissing Values:")
        logging.info(self.missing_values[self.missing_values > 0])

        logging.info("\nTarget Class Distribution:")
        target_distribution = self.df[self.target_column].value_counts()
        target_distribution.index = [
            self.category_mappings[self.target_column].get(int(value), value)
            for value in target_distribution.index
        ]
        logging.info(target_distribution)

        return self.missing_values

    def _get_quality_rules(self) -> dict:
        """Return expected value rules for quality checks."""
        return {
            "first_term_gpa": {
                "min": 0,
                "max": 4.5,
                "description": "First term GPA should be between 0 and 4.5",
            },
            "second_term_gpa": {
                "min": 0,
                "max": 4.5,
                "description": "Second term GPA should be between 0 and 4.5",
            },
            "high_school_average_mark": {
                "min": 0,
                "max": 100,
                "description": "High school average mark should be between 0 and 100",
            },
            "math_score": {
                "min": 0,
                "max": 50,
                "description": "Math score should be between 0 and 50",
            },
            "first_year_persistence": {
                "allowed": set(self.category_mappings[self.target_column].keys()),
                "description": "Persistence should be encoded as 0 or 1",
            },
            "first_language": {
                "allowed": set(self.category_mappings["first_language"].keys()),
                "description": "First language should match encoded categories",
            },
            "funding": {
                "allowed": set(self.category_mappings["funding"].keys()),
                "description": "Funding code should match encoded categories",
            },
            "school": {
                "allowed": set(self.category_mappings["school"].keys()),
                "description": "School code should match encoded categories",
            },
            "fast_track": {
                "allowed": set(self.category_mappings["fast_track"].keys()),
                "description": "Fast track flag should be encoded as 1 or 2",
            },
            "coop": {
                "allowed": set(self.category_mappings["coop"].keys()),
                "description": "Co-op flag should be encoded as 1 or 2",
            },
            "residency": {
                "allowed": set(self.category_mappings["residency"].keys()),
                "description": "Residency code should match encoded categories",
            },
            "gender": {
                "allowed": set(self.category_mappings["gender"].keys()),
                "description": "Gender code should match encoded categories",
            },
            "previous_education": {
                "allowed": set(self.category_mappings["previous_education"].keys()),
                "description": "Previous education code should match encoded categories",
            },
            "age_group": {
                "allowed": set(self.category_mappings["age_group"].keys()),
                "description": "Age group code should match encoded categories",
            },
            "english_grade": {
                "allowed": set(self.category_mappings["english_grade"].keys()),
                "description": "English grade code should match encoded categories",
            },
        }

    def analyze_data_quality(self) -> dict:
        """Analyze data quality issues such as repeated rows and out-of-range values."""
        logging.info("\n=== Running Data Quality Checks ===")

        quality_dir = INSIGHTS_DIR / "quality_analysis"
        source_df = self.df[self.original_columns].copy()

        # Identify exact duplicated rows across original variables.
        duplicate_mask = source_df.duplicated(keep=False)
        duplicate_rows = source_df[duplicate_mask].copy()
        duplicate_count = int(duplicate_mask.sum())
        duplicate_groups = 0
        duplicate_path = quality_dir / "duplicate_rows.csv"

        if duplicate_count > 0:
            signatures = duplicate_rows.astype(str).agg("|".join, axis=1)
            duplicate_rows.insert(0, "duplicate_group_id", signatures.factorize()[0] + 1)
            duplicate_groups = int(duplicate_rows["duplicate_group_id"].nunique())
            duplicate_rows.to_csv(duplicate_path, index_label="row_index")

        rules = self._get_quality_rules()
        rule_results: list[dict] = []
        for column in self.original_columns:
            rule = rules.get(column)
            if column not in source_df.columns:
                continue

            if rule is None:
                rule_results.append(
                    {
                        "column": column,
                        "rule": "no rule defined",
                        "exceeded_count": 0,
                    }
                )
                continue

            series = pd.to_numeric(source_df[column], errors="coerce")
            not_missing_mask = series.notna()

            if "allowed" in rule:
                invalid_mask = not_missing_mask & (~series.isin(rule["allowed"]))
                rule_text = f"allowed values: {sorted(rule['allowed'])}"
            else:
                invalid_mask = not_missing_mask & ((series < rule["min"]) | (series > rule["max"]))
                rule_text = f"range: [{rule['min']}, {rule['max']}]"

            rule_results.append(
                {
                    "column": column,
                    "rule": rule_text,
                    "exceeded_count": int(invalid_mask.sum()),
                }
            )

        out_of_range_total = int(sum(item["exceeded_count"] for item in rule_results))

        self.quality_summary = {
            "duplicate_rows": duplicate_count,
            "duplicate_groups": duplicate_groups,
            "out_of_range_total": out_of_range_total,
            "rule_violations": rule_results,
            "duplicate_file": str(duplicate_path),
        }

        logging.info(f"Repeated rows (exact duplicates): {duplicate_count}")
        if duplicate_count > 0:
            logging.info(f"Duplicate rows saved to {duplicate_path}")

        logging.info(f"Out-of-range records: {out_of_range_total}")

        return self.quality_summary

    def analyze_correlations(self) -> tuple[pd.Series, dict]:
        """Create and save correlation matrices.

        Returns:
            tuple[pd.Series, dict]: Target correlations and category mappings
        """
        logging.info("\n=== Creating Correlation Matrices ===")

        # Create a copy of the dataframe
        df_encoded = self.df.copy()

        # Remove rows with missing target values
        df_encoded = df_encoded[df_encoded[self.target_column].notna()]

        # Drop derived columns
        df_encoded = df_encoded.drop(columns=self.derived_columns)

        # Add target column
        df_encoded[self.target_column] = (
            df_encoded[self.target_column] == 1
        ).astype(float)

        # Calculate correlations
        correlations = df_encoded.corr()

        # Save category mappings
        self._save_category_mappings()

        # Save correlations
        correlations.to_csv(INSIGHTS_DIR / "correlation/full_feature_correlations.csv")

        # Create correlation plots
        self._plot_correlation_matrices(correlations)

        # Get target correlations
        target_corr = correlations[self.target_column].sort_values(ascending=False)
        target_corr = target_corr.drop(self.target_column)

        # Plot target correlations
        self._plot_target_correlations(target_corr)

        return target_corr, self.category_mappings

    def _save_category_mappings(self) -> None:
        """Save category mappings to file."""
        with open(INSIGHTS_DIR / "correlation/category_mappings.txt", "w") as f:
            f.write("Category Mappings for Encoded Features:\n")
            f.write("=====================================\n\n")
            for column, mapping in self.category_mappings.items():
                f.write(f"\n{column}:\n")
                for code, category in mapping.items():
                    f.write(f"  {code}: {category}\n")

    def _plot_correlation_matrices(self, correlations: pd.DataFrame) -> None:
        """Plot correlation matrices.

        Args:
            correlations: Correlation matrix
        """
        n_cols = len(correlations.columns)
        max_cols_per_plot = 20
        n_splits = (n_cols + max_cols_per_plot - 1) // max_cols_per_plot

        for i in range(n_splits):
            start_idx = i * max_cols_per_plot
            end_idx = min((i + 1) * max_cols_per_plot, n_cols)

            plt.figure(figsize=(24, 20))
            sns.heatmap(
                correlations.iloc[start_idx:end_idx, start_idx:end_idx],
                annot=True,
                cmap="coolwarm",
                center=0,
                fmt=".2f",
                square=True,
            )
            plt.title(f"Full Correlation Matrix Part {i+1}")
            plt.tight_layout()
            plt.savefig(
                INSIGHTS_DIR / f"correlation/full_correlation_matrix_{i+1}.png",
                dpi=300,
                bbox_inches="tight",
            )
            plt.close()

    def _plot_target_correlations(self, target_corr: pd.Series) -> None:
        """Plot target correlations.

        Args:
            target_corr: Series of correlations with target
        """
        plt.figure(figsize=(12, 8))
        sns.barplot(x=target_corr.values, y=target_corr.index)
        plt.title("Feature Correlations with Persistence")
        plt.xlabel("Correlation Coefficient")
        plt.tight_layout()
        plt.savefig(
            INSIGHTS_DIR / "correlation/full_target_correlations.png",
            dpi=300,
            bbox_inches="tight",
        )
        plt.close()

    def analyze_grouped_patterns(self) -> None:
        """Analyze grouped patterns in student data."""
        logging.info("\n=== Analyzing Grouped Patterns ===")

        # GPA Band Distribution of Persistence
        self._plot_bar(
            data=self.df,
            x="GPA_BAND",
            hue=self.target_column,
            title="Persistence by GPA Band",
            filename="grouped_analysis/gpa_band_persistence.png",
        )

        # Mark and Math Band Analysis
        plt.figure(figsize=(12, 6))
        mark_math = pd.crosstab(
            [self.df["MARK_BAND"], self.df["MATH_BAND"]],
            self.df[self.target_column],
        )
        mark_math.columns = [
            self.category_mappings[self.target_column].get(int(value), value)
            for value in mark_math.columns
        ]
        mark_math.plot(kind="bar", stacked=True)
        plt.title("Persistence by Mark Band and Math Band")
        plt.xlabel("Mark Band - Math Band")
        plt.ylabel("Number of Students")
        plt.legend(title="Persistence", bbox_to_anchor=(1.05, 1), loc="upper left")
        plt.xticks(rotation=90)
        plt.tight_layout()
        plt.savefig(INSIGHTS_DIR / "grouped_analysis/mark_math_persistence.png", bbox_inches="tight")
        plt.close()

        # Persistence Heatmap
        plt.figure(figsize=(12, 6))
        persistence_matrix = pd.crosstab(
            self.df["age_group"],
            self.df["funding"],
            values=self.df[self.target_column],
            aggfunc="mean",
        )
        persistence_matrix.index = [
            self.category_mappings["age_group"].get(int(value), value)
            if pd.notna(value)
            else value
            for value in persistence_matrix.index
        ]
        persistence_matrix.columns = [
            self.category_mappings["funding"].get(int(value), value)
            if pd.notna(value)
            else value
            for value in persistence_matrix.columns
        ]
        sns.heatmap(persistence_matrix, cmap="YlOrRd", annot=True, fmt=".2f")
        plt.title("Persistence Heatmap (Age Group vs Funding)")
        plt.xlabel("Funding")
        plt.ylabel("Age Group")
        plt.xticks(rotation=45, ha="right")
        plt.tight_layout()
        plt.savefig(INSIGHTS_DIR / "grouped_analysis/persistence_heatmap.png", bbox_inches="tight")
        plt.close()

    def analyze_persistence_patterns(self) -> None:
        """Analyze persistence patterns."""
        logging.info("\n=== Analyzing Persistence Patterns ===")

        # Persistence Distribution by Residency
        self._plot_bar(
            data=self.df,
            x="residency",
            hue=self.target_column,
            title="Persistence by Residency",
            filename="persistence_analysis/residency_persistence.png",
        )

        # Persistence Distribution by Previous Education
        self._plot_bar(
            data=self.df,
            x="previous_education",
            hue=self.target_column,
            title="Persistence by Previous Education",
            filename="persistence_analysis/previous_education_persistence.png",
        )

    def _plot_bar(self, data: pd.DataFrame, x: str, hue: str, title: str, filename: str) -> None:
        """Helper function to create and save bar plots."""
        
        plt.figure(figsize=(12, 6))
        plot_data = pd.crosstab(data[x], data[hue])

        plot_data.columns = [
            self.category_mappings[self.target_column].get(int(value), value)
            if pd.notna(value) else value
            for value in plot_data.columns
        ]
        
        if x in self.category_mappings:
            plot_data.index = [
                self.category_mappings[x].get(int(value), value)
                if pd.notna(value) else value
                for value in plot_data.index
            ]
            
        plot_data.plot(kind="bar", stacked=True)
        plt.title(title)
        plt.xlabel(x.replace("_", " ").title())
        plt.ylabel("Number of Students")
        plt.legend(title="Persistence", bbox_to_anchor=(1.05, 1), loc="upper left")
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(INSIGHTS_DIR / filename, bbox_inches="tight")
        plt.close()

    def analyze_age_patterns(self) -> None:
        """Analyze simple grouped patterns in student data."""
        logging.info("\n=== Analyzing Age Patterns ===")

        # Students by Age Group
        self._plot_bar(
            data=self.df,
            x="age_group",
            hue=self.target_column,
            title="Persistence by Age Group",
            filename="age_analysis/persistence_by_age_group.png",
        )

    def save_analysis_report(self) -> None:
        """Save a comprehensive analysis report."""
        report_path = INSIGHTS_DIR / "analysis_report.md"

        with open(report_path, "w") as f:
            f.write("# Student Data Analysis Report\n\n")

            f.write("## Dataset Overview\n")
            f.write(f"- Total records: {len(self.df):,}\n")
            f.write(f"- Target variable: {self.target_column}\n")
            f.write(f"- Features: {len(self.original_columns)}\n")
            f.write(f"- Numerical variables: {', '.join(self.numeric_columns)}\n")
            f.write(f"- Categorical variables: {', '.join(self.categorical_columns)}\n")
            f.write(f"- Original target attribute: {self.target_column}\n")
            f.write(
                "- Added analysis attributes used internally: GPA_BAND, MARK_BAND, MATH_BAND\n\n"
            )

            f.write("## Missing Values\n")
            if self.missing_values is not None:
                missing = self.missing_values[self.missing_values > 0]
                f.write("Features with missing values:\n")
                for col, count in missing.items():
                    percentage = (count / len(self.df)) * 100
                    f.write(f"- {col}: {count:,} ({percentage:.2f}%)\n")

            f.write("\n## Class Distribution\n")
            class_dist = self.df[self.target_column].value_counts()
            for cls, count in class_dist.items():
                percentage = (count / len(self.df)) * 100
                f.write(
                    f"- {self.category_mappings[self.target_column].get(int(cls), cls)}: "
                    f"{count:,} ({percentage:.2f}%)\n"
                )

            f.write("\n## Data Quality Checks\n")
            if self.quality_summary:
                f.write(
                    f"- Repeated rows (exact duplicates): "
                    f"{self.quality_summary.get('duplicate_rows', 0):,}\n"
                )
                f.write(
                    f"- Duplicate groups: "
                    f"{self.quality_summary.get('duplicate_groups', 0):,}\n"
                )
                f.write(
                    f"- Out-of-range records: "
                    f"{self.quality_summary.get('out_of_range_total', 0):,}\n"
                )

                rule_violations = self.quality_summary.get("rule_violations", [])
                if rule_violations:
                    f.write("\nRange/Rule checks across all variables:\n")
                    for item in rule_violations:
                        f.write(
                            f"- {item['column']}: {item['rule']} | "
                            f"exceeded: {item['exceeded_count']:,}\n"
                        )

                f.write(
                    "\nDetailed files:\n"
                    "- insights/quality_analysis/duplicate_rows.csv\n"
                )
            else:
                f.write("- Quality analysis was not run.\n")

            f.write("\n## Generated Visualizations\n")
            f.write("### Correlation Analysis\n")
            f.write("- Full correlation matrices\n")
            f.write("- Target correlation analysis\n")

            f.write("\n### Grouped Analysis\n")
            f.write("- GPA band persistence distribution\n")
            f.write("- Mark and math band persistence patterns\n")
            f.write("- Persistence heatmap\n")

            f.write("\n### Persistence Analysis\n")
            f.write("- Residency persistence patterns\n")
            f.write("- Previous education persistence patterns\n")

            f.write("\n### Age Analysis\n")
            f.write("- Students by age group\n")

            logging.info(f"Analysis report saved to {report_path}")

    def run_full_analysis(self) -> None:
        """Run all analysis steps."""
        self.load_data()
        self.analyze_basic_stats()
        self.analyze_data_quality()
        self.analyze_correlations()
        self.analyze_persistence_patterns()
        self.analyze_grouped_patterns()
        self.analyze_age_patterns()
        self.save_analysis_report()
