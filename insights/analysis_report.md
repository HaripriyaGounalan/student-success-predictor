# Student Data Analysis Report

## Dataset Overview
- Total records: 1,437
- Target variable: first_year_persistence
- Features: 15
- Numerical variables: first_term_gpa, second_term_gpa, high_school_average_mark, math_score
- Categorical variables: first_language, funding, school, fast_track, coop, residency, gender, previous_education, age_group, english_grade
- Original target attribute: first_year_persistence
- Added analysis attributes used internally: GPA_BAND, MARK_BAND, MATH_BAND

## Missing Values
Features with missing values:
- first_term_gpa: 17 (1.18%)
- second_term_gpa: 160 (11.13%)
- first_language: 111 (7.72%)
- previous_education: 4 (0.28%)
- age_group: 4 (0.28%)
- high_school_average_mark: 743 (51.70%)
- math_score: 462 (32.15%)
- english_grade: 45 (3.13%)

## Class Distribution
- Persisted: 1,138 (79.19%)
- Did Not Persist: 299 (20.81%)

## Data Quality Checks
- Repeated rows (exact duplicates): 2
- Duplicate groups: 1
- Out-of-range records: 101

Range/Rule checks across all variables:
- first_term_gpa: range: [0, 4.5] | exceeded: 0
- second_term_gpa: range: [0, 4.5] | exceeded: 0
- first_language: allowed values: [1, 2, 3] | exceeded: 0
- funding: allowed values: [1, 2, 3, 4, 5, 6, 7, 8, 9] | exceeded: 0
- school: allowed values: [1, 2, 3, 4, 5, 6, 7] | exceeded: 0
- fast_track: allowed values: [1, 2] | exceeded: 0
- coop: allowed values: [1, 2] | exceeded: 0
- residency: allowed values: [1, 2] | exceeded: 0
- gender: allowed values: [1, 2, 3] | exceeded: 0
- previous_education: allowed values: [1, 2] | exceeded: 88
- age_group: allowed values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] | exceeded: 0
- high_school_average_mark: range: [0, 100] | exceeded: 13
- math_score: range: [0, 50] | exceeded: 0
- english_grade: allowed values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] | exceeded: 0
- first_year_persistence: allowed values: [0, 1] | exceeded: 0

Detailed files:
- insights/quality_analysis/duplicate_rows.csv

## Generated Visualizations
### Correlation Analysis
- Full correlation matrices
- Target correlation analysis

### Grouped Analysis
- GPA band persistence distribution
- Mark and math band persistence patterns
- Persistence heatmap

### Persistence Analysis
- Residency persistence patterns
- Previous education persistence patterns

### Age Analysis
- Students by age group
