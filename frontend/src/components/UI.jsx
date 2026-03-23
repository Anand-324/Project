import React from 'react';

/* ── ScoreRing ── */
export function ScoreRing({ score, color = 'var(--accent)', size = 120, label = 'Score' }) {
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="score-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg3)" strokeWidth="10" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="score-center">
        <div className="num" style={{ color, fontSize: size < 100 ? 22 : 28 }}>{score}</div>
        <div className="lbl">{label}</div>
      </div>
    </div>
  );
}

/* ── ProgressBar ── */
export function ProgressBar({ value, color = 'var(--accent)', label, right }) {
  return (
    <div>
      {(label || right) && (
        <div className="flex justify-between text-sm mb-4" style={{ marginBottom: 6 }}>
          {label && <span>{label}</span>}
          {right && <span style={{ color }}>{right}</span>}
        </div>
      )}
      <div className="progress-wrap">
        <div className="progress-bar" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

/* ── Chip ── */
export function Chip({ children, variant = 'accent', style }) {
  return <span className={`chip chip-${variant}`} style={style}>{children}</span>;
}

/* ── Skeleton ── */
export function Skeleton({ height = 20, width = '100%', style }) {
  return <div className="skeleton" style={{ height, width, marginBottom: 8, ...style }} />;
}

/* ── Spinner ── */
export function Spinner({ size = 20, color = 'var(--accent)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="3"
        strokeDasharray="31" strokeDashoffset="10" />
    </svg>
  );
}

/* ── SHAPBar ── */
export function SHAPBar({ label, contribution, maxAbs = 10 }) {
  const pct = Math.min(100, (Math.abs(contribution) / maxAbs) * 100);
  const pos = contribution >= 0;
  return (
    <div className="shap-row">
      <span className="shap-label">{label}</span>
      <div className="shap-track">
        <div className={pos ? 'shap-fill-pos' : 'shap-fill-neg'} style={{ width: `${pct}%` }} />
      </div>
      <span className="shap-val" style={{ color: pos ? 'var(--teal)' : 'var(--red)' }}>
        {pos ? '+' : ''}{contribution.toFixed(1)}
      </span>
    </div>
  );
}

/* ── StepJourney ── */
export function StepJourney({ steps, current }) {
  return (
    <div className="steps-row">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} className={`step-item ${done ? 'done' : ''}`}>
            <div className={`step-circle ${active ? 'active' : done ? 'done' : 'pending'}`}>
              {done ? '✓' : i + 1}
            </div>
            <div className="step-label">{s}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── StatCard ── */
export function StatCard({ title, value, sub, color }) {
  return (
    <div className="card card-sm">
      <div className="card-title">{title}</div>
      <div className="card-value" style={color ? { color } : {}}>
        {value}<span style={{ fontSize: 16, fontWeight: 400, color: 'var(--muted)' }}>/100</span>
      </div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  );
}

/* ── MetricCard (no /100) ── */
export function MetricCard({ title, value, sub, color }) {
  return (
    <div className="card card-sm">
      <div className="card-title">{title}</div>
      <div className="card-value" style={color ? { color } : {}}>{value}</div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  );
}

/* ── TypingIndicator ── */
export function TypingIndicator() {
  return (
    <div className="msg msg-ai">
      <div className="msg-avatar">🤖</div>
      <div>
        <div className="msg-body">
          <div className="typing">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── ErrorBox ── */
export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: 'var(--red-dim)', border: '1px solid rgba(255,95,95,.2)',
      borderRadius: 'var(--r)', padding: '12px 16px', fontSize: 13, color: 'var(--red)',
      marginTop: 12,
    }}>
      ⚠ {message}
    </div>
  );
}
