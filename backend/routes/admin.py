"""
Admin Panel Route — mock data for admin dashboard.

GET /api/admin/stats
GET /api/admin/candidates
GET /api/admin/roles
"""

from flask import Blueprint, jsonify

admin_bp = Blueprint("admin", __name__)

MOCK_CANDIDATES = [
    {"id":1, "name":"Arjun Kumar",  "role":"Backend Developer", "cgpa":8.2, "aptitude":82, "coding":68, "interview":71, "final":74, "status":"In Progress"},
    {"id":2, "name":"Priya Sharma", "role":"Data Scientist",     "cgpa":9.1, "aptitude":92, "coding":85, "interview":88, "final":88, "status":"Complete"},
    {"id":3, "name":"Rahul Mehta",  "role":"Frontend Developer", "cgpa":7.6, "aptitude":70, "coding":65, "interview":58, "final":61, "status":"Complete"},
    {"id":4, "name":"Ananya Iyer",  "role":"ML Engineer",        "cgpa":8.8, "aptitude":None,"coding":None,"interview":None,"final":None,"status":"Just Joined"},
    {"id":5, "name":"Karan Singh",  "role":"DevOps Engineer",    "cgpa":7.9, "aptitude":78, "coding":82, "interview":76, "final":79, "status":"Complete"},
    {"id":6, "name":"Divya Nair",   "role":"Full Stack Dev",     "cgpa":8.5, "aptitude":85, "coding":79, "interview":80, "final":81, "status":"Complete"},
]

MOCK_ROLES = [
    {"role":"Backend Developer",  "domain":"Engineering", "candidates":312, "avg_match":76, "active":True},
    {"role":"Data Scientist",     "domain":"AI/ML",       "candidates":198, "avg_match":81, "active":True},
    {"role":"Frontend Developer", "domain":"Engineering", "candidates":274, "avg_match":69, "active":True},
    {"role":"ML Engineer",        "domain":"AI/ML",       "candidates":156, "avg_match":84, "active":True},
    {"role":"DevOps Engineer",    "domain":"Infrastructure","candidates":98,"avg_match":72, "active":True},
]


@admin_bp.route("/stats", methods=["GET"])
def stats():
    completed = [c for c in MOCK_CANDIDATES if c["final"] is not None]
    avg_score = round(sum(c["final"] for c in completed) / len(completed), 1) if completed else 0
    return jsonify({
        "total_candidates": 1284,
        "active_sessions": 37,
        "question_bank_size": 892,
        "avg_final_score": avg_score,
        "completion_rate": 78,
        "top_role": "Data Scientist",
    })


@admin_bp.route("/candidates", methods=["GET"])
def candidates():
    return jsonify({"candidates": MOCK_CANDIDATES})


@admin_bp.route("/roles", methods=["GET"])
def roles():
    return jsonify({"roles": MOCK_ROLES})
