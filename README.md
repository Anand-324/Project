# InterviewAI — AI-Powered Mock Interview Platform

A full-stack React + Flask application simulating an AI-driven mock interview system using Claude API as the intelligence layer for SBERT, GBC, Code2Vec, T5, NLP, and SHAP modules.

---

## Tech Stack

| Layer     | Technology                                 |
|-----------|--------------------------------------------|
| Frontend  | React 18, React Router 6, Axios, Recharts  |
| Backend   | Python 3.9+, Flask, Flask-CORS             |
| AI Engine | Anthropic Claude API (claude-opus-4)       |
| Database  | MySQL (admin data, optional extension)     |

---

## Project Structure

```
interview-platform/
├── backend/
│   ├── app.py               ← Flask entry point
│   ├── ai_client.py         ← Anthropic client + helpers
│   ├── requirements.txt
│   └── routes/
│       ├── profile.py       ← SBERT profile analysis
│       ├── aptitude.py      ← GBC aptitude evaluation
│       ├── coding.py        ← Code2Vec code analysis
│       ├── interview.py     ← T5 + NLP interview engine
│       ├── results.py       ← Meta GBC + SHAP explainability
│       └── admin.py         ← Admin data endpoints
│
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.jsx
        ├── index.js / index.css
        ├── utils/api.js           ← Axios API client
        ├── hooks/useAppContext.js ← Global state (React Context)
        ├── components/
        │   ├── Sidebar.jsx        ← Navigation
        │   └── UI.jsx             ← Shared components
        └── pages/
            ├── Dashboard.jsx
            ├── ProfilePage.jsx    ← SBERT analysis
            ├── AptitudePage.jsx   ← GBC quiz + results
            ├── CodingPage.jsx     ← Code2Vec editor
            ├── InterviewPage.jsx  ← ARIA HR avatar
            ├── ResultsPage.jsx    ← SHAP explainability
            ├── AdminPage.jsx
            └── RecruiterPage.jsx
```

---

## Quick Start

### 1. Get your Anthropic API key
Sign up at https://console.anthropic.com and create an API key.

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt

# Set API key
export ANTHROPIC_API_KEY=sk-ant-...       # macOS/Linux
set ANTHROPIC_API_KEY=sk-ant-...          # Windows CMD

python app.py
# Flask runs on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm start
# React runs on http://localhost:3000
```

Open http://localhost:3000 — the React app proxies all `/api` calls to Flask on port 5000.

---

## AI Modules & Routes

### POST /api/profile/analyse
Simulates **Sentence-BERT (SBERT)** profile analysis.
- Input: name, cgpa, marks_10, marks_12, role, skills, projects, courses
- Output: profile_match_score, context_vector_summary, top_skills, skill_gaps, recommended_roles, sbert_embedding_preview

### GET /api/aptitude/questions?role=...
**T5-style** question generation — returns 10 role-specific aptitude questions.

### POST /api/aptitude/evaluate
Simulates **Gradient Boosting Classifier (GBC)** cognitive evaluation.
- Input: role, answers (array of {id, selected_index, time_taken_seconds})
- Output: aptitude_score, cognitive_grade, percentile, category_scores, gbc_features

### GET /api/coding/problem?role=...&difficulty=...
Generates a role-specific coding problem.

### POST /api/coding/evaluate
Simulates **Code2Vec** structural analysis.
- Input: code, language, problem_title, role
- Output: overall_score, correctness, modularity, time_complexity, code2vec_attention_tokens, improvements

### POST /api/interview/question
Simulates **T5 personalised question generation**.
- Input: profile, history, question_number
- Output: question, category, difficulty, intent, follow_up_hint

### POST /api/interview/evaluate
**NLP answer evaluation** — relevance, clarity, depth scoring.

### POST /api/interview/feedback
**ARIA** HR avatar spoken feedback on each answer.

### POST /api/results/compute
**Meta GBC + SHAP** final score aggregation.
- Input: all scores from previous modules
- Output: final_score, grade, shap_values, strengths, weaknesses, course_recommendations, role_recommendations

---

## Extending to Production

- **MySQL**: Add SQLAlchemy models to persist candidate sessions, scores, and recommendations
- **Authentication**: Add Flask-JWT-Extended for candidate/admin/recruiter login
- **Real SBERT**: Replace Claude SBERT simulation with `sentence-transformers` library
- **Real GBC**: Train sklearn GradientBoostingClassifier on historical candidate data
- **Real Code2Vec**: Integrate the open-source Code2Vec model (Java-based) via subprocess
- **Real SHAP**: Use `shap` library with your trained GBC model for true Shapley values
- **Deployment**: Dockerise both services; use nginx to serve React build and proxy to Flask

---

## Environment Variables

| Variable            | Description                    |
|---------------------|--------------------------------|
| ANTHROPIC_API_KEY   | Your Anthropic API key         |
| FLASK_ENV           | development / production       |
| MYSQL_URL           | Optional MySQL connection URL  |

---

## License
MIT
