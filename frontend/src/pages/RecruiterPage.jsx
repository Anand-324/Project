import React, { useState, useEffect } from 'react';
import { getAdminCandidates } from '../utils/api';
import { Chip, Skeleton } from '../components/UI';

export default function RecruiterPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minScore, setMinScore] = useState(60);
  const [minCgpa, setMinCgpa] = useState(7.0);
  const [roleFilter, setRoleFilter] = useState('All');
  const [shortlisted, setShortlisted] = useState(new Set());

  const ROLES = ['All', 'Backend Developer', 'Data Scientist', 'Frontend Developer', 'ML Engineer', 'DevOps Engineer'];

  useEffect(() => {
    getAdminCandidates().then(({ data }) => setCandidates(data.candidates)).finally(() => setLoading(false));
  }, []);

  const filtered = candidates.filter(c =>
    (roleFilter === 'All' || c.role === roleFilter) &&
    (c.final === null || c.final >= minScore) &&
    c.cgpa >= minCgpa
  );

  const scoreColor = s => s >= 80 ? 'var(--teal)' : s >= 60 ? 'var(--accent)' : s >= 40 ? 'var(--amber)' : 'var(--red)';

  function toggleShortlist(id) {
    setShortlisted(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Recruiter Dashboard</h1>
        <p>Filter and shortlist candidates based on AI performance scores.</p>
      </div>

      {/* Filters */}
      <div className="card mb-24">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Filter by Role</label>
            <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">Min. Final Score: {minScore}</label>
            <input type="range" min={0} max={100} step={5} value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">Min. CGPA: {minCgpa.toFixed(1)}</label>
            <input type="range" min={5} max={10} step={0.1} value={minCgpa}
              onChange={e => setMinCgpa(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', paddingBottom: 4 }}>
            {filtered.length} candidate{filtered.length !== 1 ? 's' : ''} match
          </div>
        </div>
      </div>

      {/* Shortlisted count */}
      {shortlisted.size > 0 && (
        <div style={{ background: 'var(--accent-glow)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14 }}>✅ {shortlisted.size} candidate{shortlisted.size > 1 ? 's' : ''} shortlisted</span>
          <button className="btn btn-sm btn-outline" onClick={() => setShortlisted(new Set())}>Clear</button>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Candidate</th><th>Role</th><th>CGPA</th>
                <th>Aptitude</th><th>Coding</th><th>Interview</th><th>Final</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><Skeleton height={40} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>
                    No candidates match the current filters.
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.id} style={{ opacity: c.final === null ? 0.6 : 1 }}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {c.name.toLowerCase().replace(' ', '.') + '@example.com'}
                    </div>
                  </td>
                  <td><span style={{ fontSize: 13 }}>{c.role}</span></td>
                  <td><strong>{c.cgpa}</strong></td>
                  <td><span style={{ color: c.aptitude ? scoreColor(c.aptitude) : 'var(--muted)' }}>{c.aptitude ?? '—'}</span></td>
                  <td><span style={{ color: c.coding ? scoreColor(c.coding) : 'var(--muted)' }}>{c.coding ?? '—'}</span></td>
                  <td><span style={{ color: c.interview ? scoreColor(c.interview) : 'var(--muted)' }}>{c.interview ?? '—'}</span></td>
                  <td>
                    <strong style={{ fontSize: 16, color: c.final ? scoreColor(c.final) : 'var(--muted)' }}>
                      {c.final ?? '—'}
                    </strong>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${shortlisted.has(c.id) ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => toggleShortlist(c.id)}
                      disabled={c.final === null}
                    >
                      {shortlisted.has(c.id) ? '✓ Listed' : 'Shortlist'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
