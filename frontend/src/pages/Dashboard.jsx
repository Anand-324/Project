import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useAppContext';
import { ScoreRing, ProgressBar, StepJourney, Chip } from '../components/UI';

const STEPS = ['Profile', 'Aptitude', 'Coding', 'Interview', 'Results'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, completed, aptitudeResult, codingResult, interviewData, profileResult } = useApp();

  const stepIndex = ['profile','aptitude','coding','interview','results']
    .findIndex(s => !completed[s]);
  const currentStep = stepIndex === -1 ? 4 : stepIndex;

  const aptScore  = aptitudeResult?.aptitude_score ?? 0;
  const codeScore = codingResult?.overall_score ?? 0;
  const intScore  = interviewData.scores.length
    ? Math.round(interviewData.scores.reduce((a, b) => a + b.composite, 0) / interviewData.scores.length)
    : 0;
  const profileMatch = profileResult?.profile_match_score ?? 0;
  const overall = completed.interview
    ? Math.round(profileMatch * 0.15 + aptScore * 0.25 + codeScore * 0.25 + intScore * 0.15 + 78 * 0.2)
    : 0;

  const nextRoutes = ['/profile','/aptitude','/coding','/interview','/results'];
  const nextRoute  = nextRoutes[currentStep] || '/results';

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {profile.name.split(' ')[0]} 👋</h1>
        <p>Your mock interview journey — all in one place.</p>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        <div className="card card-sm">
          <div className="card-title">Overall Score</div>
          <div className="card-value" style={{ color: 'var(--accent)' }}>
            {overall > 0 ? overall : '—'}
            {overall > 0 && <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--muted)' }}>/100</span>}
          </div>
          <div className="card-sub">{overall > 0 ? 'Meta GBC result' : 'Complete all modules'}</div>
        </div>
        <div className="card card-sm">
          <div className="card-title">Aptitude</div>
          <div className="card-value" style={{ color: 'var(--teal)' }}>
            {aptScore > 0 ? aptScore : '—'}
            {aptScore > 0 && <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--muted)' }}>/100</span>}
          </div>
          <div className="card-sub">{aptitudeResult?.cognitive_grade ?? 'Not attempted'}</div>
        </div>
        <div className="card card-sm">
          <div className="card-title">Coding</div>
          <div className="card-value" style={{ color: 'var(--amber)' }}>
            {codeScore > 0 ? codeScore : '—'}
            {codeScore > 0 && <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--muted)' }}>/100</span>}
          </div>
          <div className="card-sub">{codingResult?.verdict ?? 'Not attempted'}</div>
        </div>
        <div className="card card-sm">
          <div className="card-title">Interview</div>
          <div className="card-value" style={{ color: 'var(--pink)' }}>
            {intScore > 0 ? intScore : '—'}
            {intScore > 0 && <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--muted)' }}>/100</span>}
          </div>
          <div className="card-sub">
            {interviewData.scores.length > 0 ? `${interviewData.scores.length} questions answered` : 'Not attempted'}
          </div>
        </div>
      </div>

      <div className="grid-2 mb-24">
        {/* Journey */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 20 }}>Your Interview Journey</div>
          <StepJourney steps={STEPS} current={currentStep} />
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
            Next: {STEPS[currentStep] ?? 'All complete!'}
          </p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate(nextRoute)}>
            {currentStep < 4 ? `Start ${STEPS[currentStep]} →` : 'View Results →'}
          </button>
        </div>

        {/* Score breakdown */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 20 }}>Score Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ProgressBar label="Profile Match (SBERT)" right={profileMatch > 0 ? `${profileMatch}%` : '—'} value={profileMatch} color="var(--accent)" />
            <ProgressBar label="Aptitude (GBC)" right={aptScore > 0 ? `${aptScore}%` : '—'} value={aptScore} color="var(--teal)" />
            <ProgressBar label="Coding (Code2Vec)" right={codeScore > 0 ? `${codeScore}%` : '—'} value={codeScore} color="var(--amber)" />
            <ProgressBar label="Interview (NLP)" right={intScore > 0 ? `${intScore}%` : '—'} value={intScore} color="var(--pink)" />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {profileResult && (
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>🎯 AI Recommendations (from SBERT)</div>
          <div className="grid-3">
            {profileResult.recommended_roles?.map((role, i) => (
              <div key={i} style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: 14 }}>
                <Chip variant={i === 0 ? 'accent' : i === 1 ? 'teal' : 'amber'} style={{ marginBottom: 10 }}>
                  💼 Role #{i + 1}
                </Chip>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{role}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Based on your SBERT profile analysis</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!profileResult && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Start your journey</div>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
            Complete your profile setup to unlock personalised AI recommendations.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/profile')}>Set Up Profile →</button>
        </div>
      )}
    </div>
  );
}
