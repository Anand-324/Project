"""
Coding Evaluation Route — simulates Code2Vec structural analysis.

GET  /api/coding/problem?role=<role>&difficulty=<easy|medium|hard>
POST /api/coding/evaluate
Body: { code, language, problem_title, role }

Returns Code2Vec-style analysis: correctness, modularity, logic flow, complexity, score.
"""

from flask import Blueprint, request, jsonify
from ai_client import claude_json

coding_bp = Blueprint("coding", __name__)

PROBLEM_SYSTEM = """
You are a technical interview problem generator for a mock interview platform.
Return a single coding problem as a JSON object with:
- title: string
- difficulty: string
- description: string (clear problem statement, 3-5 sentences)
- constraints: array of 3 strings
- examples: array of 2 objects each with { input: string, output: string, explanation: string }
- starter_code_python: string (function skeleton with docstring)
- starter_code_java: string (method skeleton)
- hints: array of 2 strings

The problem should be relevant to the candidate's target role.
Return ONLY valid JSON. No markdown.
"""

EVALUATE_SYSTEM = """
You are a Code2Vec-based code analysis engine for a mock interview platform.
You parse submitted code into structural embeddings and evaluate multiple dimensions.

Return a JSON object with exactly:
- overall_score: integer 0-100
- correctness: integer 0-100
- modularity: integer 0-100
- readability: integer 0-100
- efficiency: integer 0-100
- time_complexity: string (e.g. "O(n)")
- space_complexity: string (e.g. "O(n)")
- verdict: one of "Excellent" | "Good" | "Needs Work" | "Incomplete"
- logic_flow_summary: string (2 sentences on how the code works)
- code2vec_path_count: integer (simulated, 10-200)
- code2vec_attention_tokens: array of 5 strings (key tokens detected)
- improvements: array of 3 strings (specific, actionable suggestions)
- positive_aspects: array of 2 strings (what the candidate did well)
- test_cases_passed: integer 0-5 (out of 5 hidden test cases)

Return ONLY valid JSON. No markdown.
"""


@coding_bp.route("/problem", methods=["GET"])
def get_problem():
    role = request.args.get("role", "Software Developer")
    difficulty = request.args.get("difficulty", "Medium")
    prompt = f"Generate a {difficulty} difficulty coding problem suitable for a '{role}' interview. Make it practical and relevant to day-to-day engineering work."
    try:
        problem = claude_json(PROBLEM_SYSTEM, prompt, max_tokens=1500)
        return jsonify(problem)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@coding_bp.route("/evaluate", methods=["POST"])
def evaluate():
    data = request.get_json()
    if "code" not in data:
        return jsonify({"error": "Missing 'code'"}), 400

    prompt = f"""
Problem: {data.get('problem_title', 'Unknown')}
Language: {data.get('language', 'Python')}
Target Role: {data.get('role', 'Software Developer')}

Submitted Code:
```
{data['code']}
```

Perform a Code2Vec structural analysis of this submission. Return JSON as specified.
"""
    try:
        result = claude_json(EVALUATE_SYSTEM, prompt, max_tokens=1200)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
