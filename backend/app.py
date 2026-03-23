"""
InterviewAI - Flask Backend
Run: python app.py
Requires: pip install flask flask-cors anthropic
Set: ANTHROPIC_API_KEY in your environment
"""

import os
from flask import Flask
from flask_cors import CORS
from routes.profile import profile_bp
from routes.aptitude import aptitude_bp
from routes.coding import coding_bp
from routes.interview import interview_bp
from routes.results import results_bp
from routes.admin import admin_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Register blueprints
app.register_blueprint(profile_bp,   url_prefix="/api/profile")
app.register_blueprint(aptitude_bp,  url_prefix="/api/aptitude")
app.register_blueprint(coding_bp,    url_prefix="/api/coding")
app.register_blueprint(interview_bp, url_prefix="/api/interview")
app.register_blueprint(results_bp,   url_prefix="/api/results")
app.register_blueprint(admin_bp,     url_prefix="/api/admin")

@app.route("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}

if __name__ == "__main__":
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("⚠  WARNING: ANTHROPIC_API_KEY not set. AI features will fail.")
    app.run(debug=True, port=5000)
