import pandas as pd
import re

class DataLoader:
    """Class to clean and structure raw dataset (fix headers and layout)."""

    def __init__(self, filepath):
        self.df = pd.read_csv(filepath)
    
    def load_and_clean_data(self):
        """function to clean and structure raw dataset (fix headers and layout)"""

        ignore_labels = {"", "Student Data", "Independent variables", "Dependent variable"}

        # detect first data row (more than 1 non-empty value)
        is_data_row = lambda row: sum(pd.notna(x) and str(x).strip() != "" for x in row) > 1
        start_row = next(i for i in range(len(self.df)) if is_data_row(self.df.iloc[i]))

        print(f"Detected data start at row {start_row}")

        # first column (only above data)
        col0 = self.df.iloc[:start_row, 0].fillna("").astype(str).str.strip()

        # extract headers (stop before start of data)
        headers = [x for x in col0.iloc[:start_row] if x not in ignore_labels]

        # extract data 
        clean_df = self.df.iloc[start_row:, :len(headers)].reset_index(drop=True)

        # clean headers → snake_case
        clean_headers = [
            "_".join(re.findall(r'[A-Z][a-z]*', x)).lower()
            for x in headers
        ]

        clean_df.columns = clean_headers

        return clean_df