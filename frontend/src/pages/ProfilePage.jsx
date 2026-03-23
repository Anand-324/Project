import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useAppContext';
import { analyseProfile } from '../utils/api';
import { Skeleton, Chip, ProgressBar, ErrorBox } from '../components/UI';

const ROLES = ['Backend Developer','Frontend Developer','Full Stack Developer',
  'Data Scientist','ML Engineer','DevOps Engineer','Mobile Developer','QA Engineer'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, setProfile, profileResult, setProfileResult, markComplete } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  async function handleAnalyse() {
    setLoading(true); setError('');
    try {
      const { data } = await analyseProfile(profile);
      setProfileResult(data);
      markComplete('profile');
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Profile Setup</h1>
        <p>Analysed by <strong>Sentence-BERT (SBERT)</strong> — creates a semantic profile vector for personalised question generation.</p>
      </div>

      <div className="grid-2 mb-16">
        {/* Academic */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Academic Details</div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={profile.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">10th Grade %</label>
              <input className="form-input" type="number" value={profile.marks_10} onChange={e => update('marks_10', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">12th Grade %</label>
              <input className="form-input" type="number" value={profile.marks_12} onChange={e => update('marks_12', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">College CGPA (out of 10)</label>
            <input className="form-input" type="number" step="0.1" value={profile.cgpa} onChange={e => update('cgpa', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Job Role</label>
            <select className="form-select" value={profile.role} onChange={e => update('role', e.target.value)}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Skills */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Skills & Experience</div>
          <div className="form-group">
            <label className="form-label">Technical Skills (comma-separated)</label>
            <input className="form-input" value={profile.skills} onChange={e => update('skills', e.target.value)} placeholder="e.g. Python, React, SQL" />
          </div>
          <div className="form-group">
            <label className="form-label">Projects (describe briefly)</label>
            <textarea className="form-textarea" value={profile.projects} onChange={e => update('projects', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Completed Courses / Certifications</label>
            <input className="form-input" value={profile.courses} onChange={e => update('courses', e.target.value)} placeholder="e.g. ML Coursera, DSA NPTEL" />
          </div>
        </div>
      </div>

      {/* SBERT Analysis Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 600 }}>SBERT Profile Analysis</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              Sentence-BERT converts your profile into a 768-dim semantic embedding vector
            </div>
          </div>
          <Chip variant="accent">Sentence-BERT Engine</Chip>
        </div>

        {loading && (
          <div>
            <Skeleton height={16} width="90%" />
            <Skeleton height={16} width="70%" />
            <Skeleton height={80} />
            <Skeleton height={16} width="50%" />
          </div>
        )}

        {!loading && !profileResult && (
          <div style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>
            Click "Analyse Profile" to generate your SBERT context vector and role-fit scores using Claude AI.
          </div>
        )}

        {!loading && profileResult && <SBERTResult data={profileResult} />}

        <ErrorBox message={error} />

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button className="btn btn-primary" onClick={handleAnalyse} disabled={loading}>
            {loading ? '⏳ Analysing...' : '🔍 Analyse Profile'}
          </button>
          {profileResult && (
            <button className="btn btn-outline" onClick={() => navigate('/aptitude')}>
              Proceed to Aptitude Test →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SBERTResult({ data }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        {/* Match score */}
        <div style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: 16, textAlign: 'center', minWidth: 130 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 700, color: 'var(--accent)' }}>
            {data.profile_match_score}<span style={{ fontSize: 14, color: 'var(--muted)' }}>%</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Profile-Role Match</div>
        </div>

        {/* Summary */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Context Vector Summary
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 10 }}>{data.context_vector_summary}</p>
          <p style={{ fontSize: 13, color: 'var(--teal)' }}>{data.role_alignment}</p>
        </div>
      </div>

      {/* Embedding preview */}
      {data.sbert_embedding_preview && (
        <div style={{ marginBottom: 16, background: 'var(--bg)', borderRadius: 'var(--r)', padding: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>EMBEDDING VECTOR PREVIEW (768-dim, showing 8)</div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent2)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {'[ ' + data.sbert_embedding_preview.map(v => v.toFixed(4)).join(', ') + ' ... ]'}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--green)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>✓ Top Skills Detected</div>
          {data.top_skills?.map((s, i) => (
            <div key={i} style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>• {s}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚠ Skill Gaps</div>
          {data.skill_gaps?.map((s, i) => (
            <div key={i} style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>• {s}</div>
          ))}
        </div>
      </div>

      {data.recommended_roles && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>RECOMMENDED ROLES</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {data.recommended_roles.map((r, i) => (
              <Chip key={i} variant={i === 0 ? 'accent' : i === 1 ? 'teal' : 'amber'}>{r}</Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
