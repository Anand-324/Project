import React, { useState, useEffect } from 'react';
import { getAdminStats, getAdminCandidates, getAdminRoles } from '../utils/api';
import { Chip, Skeleton } from '../components/UI';

export default function AdminPage() {
  const [tab, setTab] = useState('candidates');
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getAdminCandidates(), getAdminRoles()])
      .then(([s, c, r]) => {
        setStats(s.data); setCandidates(c.data.candidates); setRoles(r.data.roles);
      })
      .finally(() => setLoading(false));
  }, []);

  const scoreColor = s => s >= 80 ? 'var(--teal)' : s >= 60 ? 'var(--accent)' : s >= 40 ? 'var(--amber)' : 'var(--red)';
  const statusVariant = s => ({ 'Complete': 'green', 'In Progress': 'amber', 'Just Joined': 'accent' }[s] ?? 'teal');

  return (
    <div>
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage users, job roles, question banks, and system performance.</p>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-24">
        {loading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="card card-sm"><Skeleton height={60} /></div>
        )) : [
          { title: 'Total Candidates', value: stats?.total_candidates?.toLocaleString(), sub: '↑ 42 this week', color: 'var(--text)' },
          { title: 'Active Sessions',  value: stats?.active_sessions, sub: 'Right now', color: 'var(--teal)' },
          { title: 'Question Bank',   value: stats?.question_bank_size, sub: 'Across 6 domains', color: 'var(--accent)' },
          { title: 'Avg. Final Score', value: stats?.avg_final_score, sub: 'All candidates', color: 'var(--amber)' },
        ].map(s => (
          <div key={s.title} className="card card-sm">
            <div className="card-title">{s.title}</div>
            <div className="card-value" style={{ color: s.color }}>{s.value}</div>
            <div className="card-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['candidates','roles'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Candidates table */}
      {tab === 'candidates' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600 }}>Candidate Management</div>
            <input className="form-input" style={{ width: 220 }} placeholder="🔍 Search candidates..." />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Target Role</th><th>CGPA</th>
                  <th>Aptitude</th><th>Coding</th><th>Interview</th><th>Final</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8}><Skeleton height={40} /></td></tr>
                ) : candidates.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.role}</td>
                    <td>{c.cgpa}</td>
                    <td><span style={{ color: c.aptitude ? scoreColor(c.aptitude) : 'var(--muted)' }}>{c.aptitude ?? '—'}</span></td>
                    <td><span style={{ color: c.coding ? scoreColor(c.coding) : 'var(--muted)' }}>{c.coding ?? '—'}</span></td>
                    <td><span style={{ color: c.interview ? scoreColor(c.interview) : 'var(--muted)' }}>{c.interview ?? '—'}</span></td>
                    <td><strong style={{ color: c.final ? scoreColor(c.final) : 'var(--muted)' }}>{c.final ?? '—'}</strong></td>
                    <td><Chip variant={statusVariant(c.status)}>{c.status}</Chip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roles table */}
      {tab === 'roles' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600 }}>Job Roles</div>
            <button className="btn btn-primary btn-sm">+ Add Role</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Role</th><th>Domain</th><th>Candidates</th><th>Avg. Match</th><th>Status</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5}><Skeleton height={40} /></td></tr>
                ) : roles.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{r.role}</td>
                    <td>{r.domain}</td>
                    <td>{r.candidates}</td>
                    <td><span style={{ color: scoreColor(r.avg_match) }}>{r.avg_match}%</span></td>
                    <td><Chip variant="green">Active</Chip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
