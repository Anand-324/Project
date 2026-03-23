"""
Profile Analysis Route — simulates Sentence-BERT (SBERT) profile understanding.

POST /api/profile/analyse
Body: { name, cgpa, marks_10, marks_12, role, skills, projects, courses }

Returns:
  - profile_match_score
  - context_vector_summary
  - role_alignment
  - top_skills
  - skill_gaps
  - recommended_roles
  - sbert_embedding_preview (mock vector snippet for UI display)
"""

from flask import Blueprint, request, jsonify
from ai_client import claude_json

profile_bp = Blueprint("profile", __name__)

SYSTEM_PROMPT = """
You are an AI profile analyser that simulates Sentence-BERT (SBERT) semantic embedding
and cosine similarity scoring for a mock interview platform.

Analyse the candidate profile and return a JSON object with exactly these fields:
- profile_match_score: integer 0-100 (how well the candidate matches the target role)
- context_vector_summary: string (1-2 sentences describing the candidate's semantic profile)
- role_alignment: string (1 sentence on how well they fit their target role)
- top_skills: array of exactly 3 strings (strongest skills from their profile)
- skill_gaps: array of exactly 3 strings (key missing skills for their target role)
- recommended_roles: array of exactly 3 strings (best-fit roles ranked by match)
- strengths_summary: string (2 sentences on academic/project strengths)
- sbert_embedding_preview: array of 8 floats between -1 and 1 (mock semantic vector)

Return ONLY valid JSON. No markdown, no explanation.
"""


@profile_bp.route("/analyse", methods=["POST"])
def analyse():
    data = request.get_json()

    required = ["name", "cgpa", "marks_10", "marks_12", "role", "skills", "projects", "courses"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    user_prompt = f"""
Candidate Profile:
- Name: {data['name']}
- Target Role: {data['role']}
- CGPA: {data['cgpa']} / 10
- 10th Grade: {data['marks_10']}%
- 12th Grade: {data['marks_12']}%
- Technical Skills: {data['skills']}
- Projects: {data['projects']}
- Completed Courses: {data['courses']}

Perform SBERT-style semantic profile analysis and return JSON as specified.
"""

    try:
        result = claude_json(SYSTEM_PROMPT, user_prompt)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
