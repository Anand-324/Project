"""
Results & SHAP Explainability Route — simulates Meta GBC + SHAP values.

POST /api/results/compute
Body: {
  profile: { cgpa, marks_10, marks_12, skills, role, courses },
  aptitude_score: int,
  coding_score: int,
  interview_scores: [{ relevance, clarity, depth, composite }],
  profile_match_score: int
}

Returns final score, grade, SHAP values, strengths, weaknesses, recommendations.
"""

from flask import Blueprint, request, jsonify
from ai_client import claude_json

results_bp = Blueprint("results", __name__)

SYSTEM_PROMPT = """
You are a Meta Gradient Boosting Classifier (GBC) with SHAP (SHapley Additive Explanations)
for an AI mock interview platform. You aggregate all evaluation scores into a final result
and explain each feature's contribution using SHAP values.

Return a JSON object with exactly:
- final_score: integer 0-100 (weighted aggregate)
- grade: one of "A+" | "A" | "B+" | "B" | "C+" | "C" | "D"
- grade_label: string (e.g. "Excellent" | "Good" | "Average" | "Needs Improvement")
- percentile: integer 0-100
- hire_probability: float 0-1 (probability of clearing a real interview)

- shap_values: array of objects each with:
    feature: string
    contribution: float (positive = helps score, negative = hurts score)
    percentage_impact: float (0-100, absolute impact)
    direction: "positive" | "negative"

- strengths: array of 3 objects each with:
    title: string
    explanation: string (2 sentences with specific numbers)
    impact: string (e.g. "+8.2 points")

- weaknesses: array of 3 objects each with:
    title: string
    explanation: string (2 sentences)
    impact: string (e.g. "−5.1 points")

- course_recommendations: array of 3 objects each with:
    title: string
    platform: string (e.g. "Coursera" | "Udemy" | "NPTEL" | "LeetCode")
    rationale: string (1 sentence linking to a weak SHAP feature)
    estimated_score_gain: string (e.g. "+8-12 points")
    priority: "High" | "Medium" | "Low"

- role_recommendations: array of 3 objects each with:
    role: string
    match_percentage: integer 0-100
    companies: array of 3 strings
    rationale: string

- improvement_roadmap: string (3-4 sentence personalised plan)

Return ONLY valid JSON. No markdown.
"""


@results_bp.route("/compute", methods=["POST"])
def compute():
    data = request.get_json()

    profile = data.get("profile", {})
    aptitude = data.get("aptitude_score", 0)
    coding = data.get("coding_score", 0)
    interview_scores = data.get("interview_scores", [])
    profile_match = data.get("profile_match_score", 0)

    avg_interview = 0
    if interview_scores:
        avg_interview = sum(s.get("composite", 0) for s in interview_scores) // len(interview_scores)

    academic_score = (
        float(profile.get("cgpa", 0)) * 10 * 0.4 +
        float(profile.get("marks_10", 0)) * 0.3 +
        float(profile.get("marks_12", 0)) * 0.3
    )

    prompt = f"""
Candidate Data for Meta GBC + SHAP Analysis:

Academic Details:
- CGPA: {profile.get('cgpa', 0)} / 10 → Academic score ≈ {round(academic_score)}
- 10th Grade: {profile.get('marks_10', 0)}%
- 12th Grade: {profile.get('marks_12', 0)}%

Assessment Scores:
- Profile Match Score (SBERT): {profile_match} / 100
- Aptitude Score (GBC): {aptitude} / 100
- Coding Score (Code2Vec): {coding} / 100
- Interview Score (NLP avg): {avg_interview} / 100

Profile:
- Target Role: {profile.get('role', 'Software Developer')}
- Skills: {profile.get('skills', 'Not provided')}
- Courses: {profile.get('courses', 'Not provided')}

Compute the Meta GBC final score with SHAP explanations. 
Weight suggestion: Profile Match 15%, Academics 20%, Aptitude 25%, Coding 25%, Interview 15%.
SHAP values should sum to approximately the final_score − 50 (baseline).

Return full JSON as specified.
"""
    try:
        result = claude_json(SYSTEM_PROMPT, prompt, max_tokens=2000)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
