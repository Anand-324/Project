"""
HR Avatar Interview Route — simulates T5 question generation + NLP answer evaluation.

POST /api/interview/question    → generate next personalised question
POST /api/interview/evaluate    → evaluate a single answer with NLP
POST /api/interview/feedback    → get ARIA's spoken feedback on an answer
"""

from flask import Blueprint, request, jsonify, Response, stream_with_context
from ai_client import claude_json, claude, get_client
import json

interview_bp = Blueprint("interview", __name__)

QUESTION_SYSTEM = """
You are T5 (Text-to-Text Transfer Transformer), a personalised interview question generator
for an AI mock interview platform. You generate contextually relevant, profile-aware questions.

Given the candidate's profile context and the interview history so far, generate ONE question.
Return a JSON object with:
- question: string (the question text)
- category: one of "Introduction" | "Technical" | "Behavioural" | "System Design" | "Culture Fit"
- difficulty: one of "Easy" | "Medium" | "Hard"
- intent: string (1 sentence — what this question is testing)
- follow_up_hint: string (a potential follow-up if the answer is shallow)

Return ONLY valid JSON. No markdown.
"""

EVALUATE_SYSTEM = """
You are an NLP answer evaluation engine for an AI mock interview platform.
You assess candidate answers for relevance, clarity, depth, and communication quality.

Return a JSON object with exactly:
- relevance_score: integer 0-100
- clarity_score: integer 0-100
- depth_score: integer 0-100
- communication_score: integer 0-100
- composite_score: integer 0-100
- sentiment: one of "Confident" | "Uncertain" | "Enthusiastic" | "Neutral" | "Nervous"
- keyword_hits: array of strings (important keywords detected in the answer)
- keyword_misses: array of strings (important keywords missing from the answer)
- nlp_summary: string (2 sentences — NLP assessment of the answer quality)
- improvement_tip: string (1 actionable sentence to improve this specific answer)

Return ONLY valid JSON. No markdown.
"""

FEEDBACK_SYSTEM = """
You are ARIA, a warm, professional AI HR interviewer for a mock interview platform.
You just heard the candidate's answer and give brief spoken feedback (2-3 sentences).
Be encouraging but honest. Acknowledge what was good and gently hint at what could be better.
Do NOT ask the next question — just give feedback on the current answer.
Speak naturally, as if you're talking to the candidate face-to-face.
"""


@interview_bp.route("/question", methods=["POST"])
def generate_question():
    data = request.get_json()
    profile = data.get("profile", {})
    history = data.get("history", [])   # list of {question, answer} dicts
    question_number = data.get("question_number", 1)

    prompt = f"""
Candidate Profile:
- Role: {profile.get('role', 'Software Developer')}
- Skills: {profile.get('skills', 'Not provided')}
- Projects: {profile.get('projects', 'Not provided')}
- CGPA: {profile.get('cgpa', 'Not provided')}

Question number: {question_number} of 6

Interview history so far:
{json.dumps(history, indent=2) if history else 'No history yet — this is the first question.'}

Generate question #{question_number}. 
- Q1: Introduction / Tell me about yourself
- Q2-Q3: Technical depth (role-specific)
- Q4: Behavioural (STAR method expected)
- Q5: System design or architecture
- Q6: Culture fit / career goals

Return the question JSON as specified.
"""
    try:
        result = claude_json(QUESTION_SYSTEM, prompt)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@interview_bp.route("/evaluate", methods=["POST"])
def evaluate_answer():
    data = request.get_json()
    question = data.get("question", "")
    answer = data.get("answer", "")
    role = data.get("role", "Software Developer")

    if not answer.strip():
        return jsonify({"error": "Empty answer"}), 400

    prompt = f"""
Role being interviewed for: {role}
Interview Question: "{question}"
Candidate's Answer: "{answer}"

Perform NLP evaluation of this answer. Return JSON as specified.
"""
    try:
        result = claude_json(EVALUATE_SYSTEM, prompt)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@interview_bp.route("/feedback", methods=["POST"])
def get_feedback():
    data = request.get_json()
    question = data.get("question", "")
    answer = data.get("answer", "")
    nlp_scores = data.get("nlp_scores", {})

    prompt = f"""
Question asked: "{question}"
Candidate's answer: "{answer}"
NLP scores: relevance={nlp_scores.get('relevance_score','?')}/100, clarity={nlp_scores.get('clarity_score','?')}/100

Give brief spoken feedback on this answer as ARIA.
"""
    try:
        feedback = claude(FEEDBACK_SYSTEM, prompt, max_tokens=200)
        return jsonify({"feedback": feedback})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
