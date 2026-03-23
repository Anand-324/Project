import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useAppContext';
import { computeResults } from '../utils/api';
import { ScoreRing, SHAPBar, Chip, Skeleton, ErrorBox } from '../components/UI';

export default function ResultsPage() {
  const { profile, profileResult, aptitudeResult, codingResult, interviewData, finalResults, setFinalResults } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!finalResults && aptitudeResult && codingResult) {
      computeFinal();
    }
  }, []);

  async function computeFinal() {
    setLoading(true); setError('');
    try {
      const avgInterview = interviewData.scores.length
        ? Math.round(interviewData.scores.reduce((a, b) => a + b.composite, 0) / interviewData.scores.length)
        : 0;

      const { data } = await computeResults({
        profile: { ...profile, role: profile.role },
        aptitude_score: aptitudeResult?.aptitude_score ?? 0,
        coding_score: codingResult?.overall_score ?? 0,
        interview_scores: interviewData.scores,
        profile_match_score: profileResult?.profile_match_score ?? 0,
      });
      setFinalResults(data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>Results & SHAP Analysis</h1></div>
        <div className="card" style={{ maxWidth: 500, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Computing Meta GBC + SHAP...</div>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
            Aggregating all scores and computing SHAP feature contributions.
          </p>
          <Skeleton height={10} /><Skeleton height={10} width="80%" /><Skeleton height={10} width="60%" />
        </div>
      </div>
    );
  }

  if (error && !finalResults) {
    return (
      <div>
        <div className="page-header"><h1>Results & SHAP Analysis</h1></div>
        <ErrorBox message={error} />
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={computeFinal}>Retry</button>
      </div>
    );
  }

  if (!finalResults) {
    return (
      <div>
        <div className="page-header"><h1>Results & SHAP Analysis</h1></div>
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Complete the interview first</div>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            Finish the aptitude test, coding test, and HR interview to generate your final SHAP report.
          </p>
        </div>
      </div>
    );
  }

  const d = finalResults;
  const gradeColor = { 'A+': 'var(--teal)', A: 'var(--teal)', 'B+': 'var(--accent)', B: 'var(--accent2)', 'C+': 'var(--amber)', C: 'var(--amber)', D: 'var(--red)' }[d.grade] ?? 'var(--accent)';

  return (
    <div>
      <div className="page-header">
        <h1>Results & SHAP Analysis</h1>
        <p><strong>SHAP (SHapley Additive Explanations)</strong> reveals exactly what drove your final score.</p>
      </div>

      {/* Top row */}
      <div className="grid-2 mb-16">
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <ScoreRing score={d.final_score} color={gradeColor} size={150} label="Final Score" />
          <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip variant="accent" style={{ fontSize: 14, padding: '8px 16px' }}>Grade: {d.grade} · {d.grade_label}</Chip>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10 }}>
            Percentile: {d.percentile} · Hire Probability: {Math.round(d.hire_probability * 100)}%
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Meta GBC Aggregation Model</p>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 4 }}>SHAP Feature Contributions</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
            How each factor pushed your score up (+) or down (−) from baseline
          </div>
          {d.shap_values?.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
            .map((sv, i) => (
              <SHAPBar key={i} label={sv.feature} contribution={sv.contribution} maxAbs={10} />
            ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid-2 mb-16">
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>💪 Strengths (Positive SHAP)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {d.strengths?.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--green-dim)', borderRadius: 'var(--r)', padding: 12 }}>
                <div className="dot dot-green" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                    {s.title} <span style={{ fontSize: 12, color: 'var(--teal)' }}>{s.impact}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.explanation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>⚠ Improvement Areas (Negative SHAP)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {d.weaknesses?.map((w, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--red-dim)', borderRadius: 'var(--r)', padding: 12 }}>
                <div className="dot dot-amber" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                    {w.title} <span style={{ fontSize: 12, color: 'var(--red)' }}>{w.impact}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{w.explanation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Recommendations */}
      <div className="card mb-16">
        <div style={{ fontWeight: 600, marginBottom: 16 }}>📚 Course Recommendations (SHAP-Driven)</div>
        <div className="grid-3">
          {d.course_recommendations?.map((c, i) => (
            <div key={i} style={{
              background: 'var(--bg3)', borderRadius: 'var(--r)', padding: 16,
              borderLeft: `3px solid ${i === 0 ? 'var(--teal)' : i === 1 ? 'var(--accent)' : 'var(--amber)'}`,
            }}>
              <div style={{ fontSize: 11, color: i === 0 ? 'var(--teal)' : i === 1 ? 'var(--accent)' : 'var(--amber)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                📘 {c.platform}
              </div>
              <div style={{ fontWeight: 500, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{c.rationale}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip variant={c.priority === 'High' ? 'red' : c.priority === 'Medium' ? 'amber' : 'teal'} style={{ fontSize: 11 }}>
                  {c.priority} Priority
                </Chip>
                <span style={{ fontSize: 12, color: 'var(--teal)' }}>{c.estimated_score_gain}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Recommendations */}
      <div className="card mb-16">
        <div style={{ fontWeight: 600, marginBottom: 16 }}>💼 Role Fit Recommendations</div>
        <div className="grid-3">
          {d.role_recommendations?.map((r, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 500 }}>{r.role}</div>
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: r.match_percentage >= 80 ? 'var(--teal)' : 'var(--accent)' }}>
                  {r.match_percentage}%
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{r.rationale}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Companies hiring:</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {r.companies?.map((c, j) => (
                  <span key={j} style={{ fontSize: 11, background: 'var(--accent-glow)', color: 'var(--accent2)', padding: '2px 8px', borderRadius: 10 }}>{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 12 }}>🗺 Improvement Roadmap</div>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--muted)' }}>{d.improvement_roadmap}</p>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={computeFinal} disabled={loading}>
          Recompute Results
        </button>
      </div>
    </div>
  );
}
