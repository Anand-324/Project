"""
Aptitude Evaluation Route — simulates Gradient Boosting Classifier (GBC).

GET  /api/aptitude/questions?role=<role>   → returns 10 role-tailored questions
POST /api/aptitude/evaluate               → evaluates answers, returns GBC score

Question format: { id, question, options: [A,B,C,D], correct_index, category, difficulty }
Evaluate body:   { role, answers: [{id, selected_index, time_taken_seconds}] }

Returns:
  - aptitude_score: integer 0-100
  - cognitive_grade: string (e.g. "High Cognitive Performer")
  - category_scores: { quantitative, logical, verbal }
  - gbc_features: { accuracy, avg_time, difficulty_score, pattern_score }
  - insights: string
"""

from flask import Blueprint, request, jsonify
from ai_client import claude_json

aptitude_bp = Blueprint("aptitude", __name__)

QUESTIONS_SYSTEM = """
You are a psychometric test designer for a technical mock interview platform.
Generate aptitude questions tailored to the candidate's target job role.
Return ONLY a valid JSON array of exactly 10 question objects, each with:
  - id: string (e.g. "q1")
  - question: string
  - options: array of exactly 4 strings (A, B, C, D)
  - correct_index: integer 0-3
  - category: one of "Quantitative" | "Logical" | "Verbal"
  - difficulty: one of "Easy" | "Medium" | "Hard"

Mix: 4 Quantitative, 3 Logical, 3 Verbal. Mix difficulties.
No markdown, no explanation. Return ONLY the JSON array.
"""

EVALUATE_SYSTEM = """
You are a Gradient Boosting Classifier (GBC) evaluation engine for an AI mock interview platform.
You receive a candidate's aptitude test results and must return an analytical JSON evaluation.

Return a JSON object with exactly:
- aptitude_score: integer 0-100 (overall GBC predicted score)
- cognitive_grade: string (one of: "Elite Performer" | "High Cognitive Performer" | "Above Average" | "Average" | "Needs Development")
- percentile: integer 0-100 (estimated candidate percentile vs population)
- category_scores: object with keys "quantitative", "logical", "verbal" each an integer 0-100
- gbc_features: object with:
    accuracy_rate: float 0-1
    avg_response_time: float (seconds)
    difficulty_adjusted_score: integer 0-100
    error_pattern: string (e.g. "Consistent in logic, weak on verbal")
- strengths: array of 2 strings
- weaknesses: array of 2 strings
- insights: string (2-sentence summary of cognitive profile)

Return ONLY valid JSON. No markdown.
"""


@aptitude_bp.route("/questions", methods=["GET"])
def get_questions():
    role = request.args.get("role", "Software Developer")
    prompt = f"Generate 10 aptitude test questions for a candidate targeting the role of '{role}'. Mix technical context where appropriate for quantitative questions."
    try:
        questions = claude_json(QUESTIONS_SYSTEM, prompt, max_tokens=2000)
        return jsonify({"questions": questions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@aptitude_bp.route("/evaluate", methods=["POST"])
def evaluate():
    data = request.get_json()
    if "answers" not in data:
        return jsonify({"error": "Missing 'answers'"}), 400

    prompt = f"""
Role: {data.get('role', 'Software Developer')}
Number of questions: {len(data['answers'])}
Answers submitted: {data['answers']}

Based on these answer patterns (selected_index, time_taken_seconds per question),
compute the GBC-style aptitude evaluation. Return JSON as specified.
"""
    try:
        result = claude_json(EVALUATE_SYSTEM, prompt)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
