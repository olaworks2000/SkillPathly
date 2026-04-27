import type { SkillDemand, ProjectRec, CertRec } from '../types'

export const ALL_SKILLS = [
  'Python', 'SQL', 'Excel', 'Power BI', 'Tableau', 'R',
  'Machine Learning', 'Statistics', 'Data Visualization', 'dbt',
  'Airflow', 'AWS', 'Azure', 'Pandas', 'NumPy', 'Scikit-learn',
  'Communication', 'Stakeholder Management',
]

export const TARGET_ROLES = [
  'Data Analyst',
  'Data Scientist',
  'Data Engineer',
  'Product Analyst',
  'ML Engineer',
] as const

export const PROJECT_DOMAINS = ['Finance', 'Healthcare', 'Sports', 'E-commerce', 'Other'] as const

// Job market demand by role
export const MARKET_DEMAND: Record<string, SkillDemand[]> = {
  'Data Analyst': [
    { skill: 'SQL', demand: 72 },
    { skill: 'Python', demand: 65 },
    { skill: 'Excel', demand: 61 },
    { skill: 'Power BI', demand: 54 },
    { skill: 'Tableau', demand: 48 },
    { skill: 'Statistics', demand: 43 },
    { skill: 'Data Visualization', demand: 41 },
    { skill: 'Communication', demand: 38 },
    { skill: 'Machine Learning', demand: 31 },
    { skill: 'dbt', demand: 22 },
  ],
  'Data Scientist': [
    { skill: 'Python', demand: 88 },
    { skill: 'Machine Learning', demand: 80 },
    { skill: 'Statistics', demand: 75 },
    { skill: 'SQL', demand: 68 },
    { skill: 'Scikit-learn', demand: 60 },
    { skill: 'NumPy', demand: 55 },
    { skill: 'Pandas', demand: 52 },
    { skill: 'Data Visualization', demand: 45 },
    { skill: 'R', demand: 38 },
    { skill: 'AWS', demand: 30 },
  ],
  'Data Engineer': [
    { skill: 'Python', demand: 82 },
    { skill: 'SQL', demand: 75 },
    { skill: 'AWS', demand: 65 },
    { skill: 'Airflow', demand: 58 },
    { skill: 'dbt', demand: 52 },
    { skill: 'Azure', demand: 48 },
    { skill: 'Pandas', demand: 42 },
    { skill: 'Statistics', demand: 28 },
    { skill: 'Communication', demand: 25 },
    { skill: 'Machine Learning', demand: 22 },
  ],
  'Product Analyst': [
    { skill: 'SQL', demand: 78 },
    { skill: 'Excel', demand: 70 },
    { skill: 'Communication', demand: 68 },
    { skill: 'Tableau', demand: 55 },
    { skill: 'Power BI', demand: 48 },
    { skill: 'Python', demand: 42 },
    { skill: 'Statistics', demand: 40 },
    { skill: 'Stakeholder Management', demand: 35 },
    { skill: 'Data Visualization', demand: 32 },
    { skill: 'Machine Learning', demand: 18 },
  ],
  'ML Engineer': [
    { skill: 'Python', demand: 92 },
    { skill: 'Machine Learning', demand: 88 },
    { skill: 'Scikit-learn', demand: 72 },
    { skill: 'NumPy', demand: 68 },
    { skill: 'AWS', demand: 62 },
    { skill: 'Pandas', demand: 58 },
    { skill: 'SQL', demand: 50 },
    { skill: 'Azure', demand: 45 },
    { skill: 'Statistics', demand: 42 },
    { skill: 'dbt', demand: 20 },
  ],
}

export const PROJECT_RECS: ProjectRec[] = [
  // SQL
  { id: 'sql-1', forSkill: 'SQL', title: 'Analyse e-commerce sales data', domain: 'E-commerce', difficulty: 'Beginner', description: 'Write SQL queries to explore customer orders, revenue trends, and product performance from a sample e-commerce dataset.' },
  { id: 'sql-2', forSkill: 'SQL', title: 'Analyse loan default trends', domain: 'Finance', difficulty: 'Intermediate', description: 'Identify patterns in loan defaults using window functions, CTEs, and aggregation on a financial dataset.' },
  { id: 'sql-3', forSkill: 'SQL', title: 'Analyse sports performance stats', domain: 'Sports', difficulty: 'Beginner', description: 'Explore player performance metrics, team standings, and season trends using SQL on public sports data.' },

  // Python
  { id: 'py-1', forSkill: 'Python', title: 'Build a customer churn prediction model', domain: 'Finance', difficulty: 'Intermediate', description: 'Use pandas and scikit-learn to clean data, engineer features, and train a model to predict customer churn.' },
  { id: 'py-2', forSkill: 'Python', title: 'Analyse NHS appointment no-shows', domain: 'Healthcare', difficulty: 'Intermediate', description: 'Analyse patterns in missed NHS appointments using pandas, matplotlib, and statistical testing.' },
  { id: 'py-3', forSkill: 'Python', title: 'Scrape and analyse job posting trends', domain: 'Tech', difficulty: 'Advanced', description: 'Build a web scraper to collect job listings and analyse in-demand skills and salary trends across industries.' },

  // Power BI
  { id: 'pbi-1', forSkill: 'Power BI', title: 'Build a sales performance dashboard', domain: 'Retail', difficulty: 'Beginner', description: 'Create an interactive Power BI dashboard tracking KPIs, regional sales, and product performance.' },
  { id: 'pbi-2', forSkill: 'Power BI', title: 'Build a financial KPI dashboard', domain: 'Finance', difficulty: 'Intermediate', description: 'Design a multi-page Power BI report with DAX measures for P&L, cash flow, and financial ratios.' },
  { id: 'pbi-3', forSkill: 'Power BI', title: 'Build a healthcare outcomes dashboard', domain: 'Healthcare', difficulty: 'Intermediate', description: 'Visualise patient outcome data, readmission rates, and treatment effectiveness in a Power BI report.' },

  // Excel
  { id: 'xl-1', forSkill: 'Excel', title: 'Build a budget tracker with pivot tables', domain: 'Finance', difficulty: 'Beginner', description: 'Create a personal/business budget tracker using Excel formulas, pivot tables, and dynamic charts.' },
  { id: 'xl-2', forSkill: 'Excel', title: 'Analyse retail sales trends', domain: 'E-commerce', difficulty: 'Beginner', description: 'Use Excel pivot tables and charts to identify seasonal trends and top-performing products.' },

  // Machine Learning
  { id: 'ml-1', forSkill: 'Machine Learning', title: 'Predict house prices using regression', domain: 'Finance', difficulty: 'Intermediate', description: 'Train a regression model to predict property prices using feature engineering and cross-validation.' },
  { id: 'ml-2', forSkill: 'Machine Learning', title: 'Build a fraud detection model', domain: 'Finance', difficulty: 'Advanced', description: 'Address class imbalance and build an ensemble model to detect fraudulent transactions in financial data.' },

  // Tableau
  { id: 'tab-1', forSkill: 'Tableau', title: 'Build a sales trend dashboard', domain: 'Retail', difficulty: 'Beginner', description: 'Connect Tableau to sample retail data and build an interactive dashboard with filters and drill-downs.' },
  { id: 'tab-2', forSkill: 'Tableau', title: 'Visualise global COVID-19 trends', domain: 'Healthcare', difficulty: 'Intermediate', description: 'Create a map-based Tableau story showing infection rates, vaccination progress, and mortality trends.' },

  // Statistics
  { id: 'stat-1', forSkill: 'Statistics', title: 'A/B test analysis for an e-commerce site', domain: 'E-commerce', difficulty: 'Intermediate', description: 'Analyse A/B test results using hypothesis testing, p-values, and effect sizes in Python or R.' },

  // dbt
  { id: 'dbt-1', forSkill: 'dbt', title: 'Build a dbt data transformation pipeline', domain: 'Finance', difficulty: 'Intermediate', description: 'Create dbt models to transform raw transactional data into analytics-ready tables with tests and documentation.' },

  // Data Visualization
  { id: 'dv-1', forSkill: 'Data Visualization', title: 'Create an interactive data story', domain: 'Sports', difficulty: 'Beginner', description: 'Use Python (matplotlib/seaborn) or Tableau to tell a compelling story with sports data and charts.' },
]

export const CERT_RECS: CertRec[] = [
  { id: 'cert-sql', forSkill: 'SQL', name: 'Google Data Analytics Certificate', provider: 'Google', level: 'Beginner', link: 'https://grow.google/certificates/data-analytics/' },
  { id: 'cert-pbi', forSkill: 'Power BI', name: 'Microsoft Power BI Data Analyst (PL-300)', provider: 'Microsoft', level: 'Intermediate', link: 'https://learn.microsoft.com/en-us/certifications/exams/pl-300/' },
  { id: 'cert-py', forSkill: 'Python', name: 'IBM Data Science Professional Certificate', provider: 'IBM', level: 'Beginner', link: 'https://www.coursera.org/professional-certificates/ibm-data-science' },
  { id: 'cert-ml', forSkill: 'Machine Learning', name: 'Machine Learning Specialization', provider: 'DeepLearning.AI', level: 'Intermediate', link: 'https://www.coursera.org/specializations/machine-learning-introduction' },
  { id: 'cert-tableau', forSkill: 'Tableau', name: 'Tableau Desktop Specialist', provider: 'Tableau', level: 'Beginner', link: 'https://www.tableau.com/learn/certification/desktop-specialist' },
  { id: 'cert-aws', forSkill: 'AWS', name: 'AWS Certified Data Analytics – Specialty', provider: 'Amazon', level: 'Advanced', link: 'https://aws.amazon.com/certification/certified-data-analytics-specialty/' },
  { id: 'cert-stat', forSkill: 'Statistics', name: 'Statistics with Python Specialization', provider: 'University of Michigan', level: 'Intermediate', link: 'https://www.coursera.org/specializations/statistics-with-python' },
  { id: 'cert-dbt', forSkill: 'dbt', name: 'dbt Fundamentals', provider: 'dbt Labs', level: 'Beginner', link: 'https://courses.getdbt.com/courses/fundamentals' },
]

// Module → Skill inference map
export const MODULE_SKILL_MAP: Record<string, Array<{ skill: string; level: 'Beginner' | 'Intermediate' | 'Advanced' }>> = {
  'database systems': [{ skill: 'SQL', level: 'Intermediate' }],
  databases: [{ skill: 'SQL', level: 'Intermediate' }],
  'machine learning': [{ skill: 'Python', level: 'Intermediate' }, { skill: 'Machine Learning', level: 'Beginner' }],
  statistics: [{ skill: 'Statistics', level: 'Intermediate' }],
  'statistical methods': [{ skill: 'Statistics', level: 'Intermediate' }],
  'data visualization': [{ skill: 'Power BI', level: 'Beginner' }, { skill: 'Data Visualization', level: 'Intermediate' }],
  'data engineering': [{ skill: 'Python', level: 'Intermediate' }, { skill: 'dbt', level: 'Beginner' }, { skill: 'Airflow', level: 'Beginner' }],
  programming: [{ skill: 'Python', level: 'Beginner' }],
  'introduction to programming': [{ skill: 'Python', level: 'Beginner' }],
}

export const CAREER_INTENT_QUESTIONS = [
  {
    id: 'q1',
    question: 'Which dataset would you enjoy working with most?',
    options: ['Healthcare records', 'Sports performance', 'Financial transactions', 'Social media data'],
  },
  {
    id: 'q2',
    question: 'What kind of work excites you most?',
    options: ['Finding patterns in data', 'Building data pipelines', 'Creating dashboards', 'Predicting outcomes'],
  },
  {
    id: 'q3',
    question: 'Which industry do you care about most?',
    options: ['Finance & Banking', 'Healthcare & Life Sciences', 'Sports & Entertainment', 'Retail & E-commerce'],
  },
  {
    id: 'q4',
    question: 'What motivates you most in a career?',
    options: ['High salary', 'Making an impact', 'Solving hard problems', 'Creative freedom'],
  },
]
