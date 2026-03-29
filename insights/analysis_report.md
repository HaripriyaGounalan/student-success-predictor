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
