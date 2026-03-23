import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useAppContext';
import { getAptitudeQuestions, evaluateAptitude } from '../utils/api';
import { ScoreRing, Chip, ProgressBar, Skeleton, ErrorBox } from '../components/UI';

export default function AptitudePage() {
  const navigate = useNavigate();
  const { profile, aptitudeResult, setAptitudeResult, markComplete } = useApp();

  const [phase, setPhase] = useState('intro'); // intro | loading | quiz | evaluating | result
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState([]);       // {id, selected_index, time_taken_seconds}
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(45);
  const [startTime, setStartTime] = useState(null);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  async function loadQuestions() {
    setPhase('loading'); setError('');
    try {
      const { data } = await getAptitudeQuestions(profile.role);
      setQuestions(data.questions);
      setQIdx(0); setAnswers([]); setSelected(null);
      setPhase('quiz');
      startTimer();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
      setPhase('intro');
    }
  }

  function startTimer() {
    setTimeLeft(45);
    setStartTime(Date.now());
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleNext(null); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  function handleSelect(idx) { setSelected(idx); }

  function handleNext(forcedIdx) {
    clearInterval(timerRef.current);
    const q = questions[qIdx];
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const chosenIdx = forcedIdx !== undefined ? forcedIdx : selected;
    const newAnswers = [...answers, { id: q.id, selected_index: chosenIdx, time_taken_seconds: timeTaken }];
    setAnswers(newAnswers);
    setSelected(null);

    if (qIdx + 1 >= questions.length) {
      submitEvaluation(newAnswers);
    } else {
      setQIdx(i => i + 1);
      startTimer();
    }
  }

  async function submitEvaluation(finalAnswers) {
    setPhase('evaluating');
    try {
      const { data } = await evaluateAptitude({ role: profile.role, answers: finalAnswers });
      setAptitudeResult(data);
      markComplete('aptitude');
      setPhase('result');
    } catch (e) {
      setError(e.response?.data?.error || e.message);
      setPhase('quiz');
    }
  }

  /* ── Intro ── */
  if (phase === 'intro' || phase === 'loading') {
    return (
      <div>
        <div className="page-header">
          <h1>Aptitude & Cognitive Test</h1>
          <p>Evaluated by <strong>Gradient Boosting Classifier (GBC)</strong> — logical, quantitative & verbal reasoning.</p>
        </div>
        <div className="card" style={{ maxWidth: 560 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Test Overview</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[['📊 Questions', '10 AI-generated, role-specific'],
              ['⏱ Time per question', '45 seconds'],
              ['🧠 Categories', 'Quantitative · Logical · Verbal'],
              ['🤖 Evaluation', 'GBC analyses accuracy, speed & error patterns']
            ].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', gap: 12, fontSize: 13.5 }}>
                <span style={{ width: 160, color: 'var(--muted)' }}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
          <ErrorBox message={error} />
          <button className="btn btn-primary" onClick={loadQuestions} disabled={phase === 'loading'}>
            {phase === 'loading' ? '⏳ Generating questions...' : '▶ Start Test'}
          </button>
          {aptitudeResult && (
            <button className="btn btn-outline" style={{ marginLeft: 12 }} onClick={() => setPhase('result')}>
              View Previous Result
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── Quiz ── */
  if (phase === 'quiz' && questions.length > 0) {
    const q = questions[qIdx];
    const pct = ((qIdx + 1) / questions.length) * 100;
    return (
      <div>
        <div className="page-header">
          <h1>Aptitude Test</h1>
          <p>Question {qIdx + 1} of {questions.length}</p>
        </div>
        <div className="card" style={{ maxWidth: 700 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Chip variant="accent">Q{qIdx + 1} / {questions.length}</Chip>
              <Chip variant={q.category === 'Quantitative' ? 'teal' : q.category === 'Logical' ? 'accent' : 'amber'}>
                {q.category}
              </Chip>
              <Chip variant={q.difficulty === 'Hard' ? 'red' : q.difficulty === 'Medium' ? 'amber' : 'green'}>
                {q.difficulty}
              </Chip>
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              ⏱ <span style={{ color: timeLeft <= 10 ? 'var(--red)' : 'var(--amber)', fontWeight: 600 }}>{timeLeft}s</span>
            </div>
          </div>

          <ProgressBar value={pct} color="var(--accent)" />
          <div style={{ height: 20 }} />

          <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.7, marginBottom: 24 }}>{q.question}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map((opt, i) => (
              <div
                key={i}
                onClick={() => handleSelect(i)}
                style={{
                  padding: '12px 16px', borderRadius: 'var(--r)', cursor: 'pointer',
                  border: `1px solid ${selected === i ? 'var(--accent)' : 'var(--border)'}`,
                  background: selected === i ? 'var(--accent-glow)' : 'var(--bg3)',
                  fontSize: 14, transition: 'all 0.2s',
                }}
              >
                <strong style={{ color: 'var(--muted)', marginRight: 10 }}>{String.fromCharCode(65 + i)}.</strong>
                {opt}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button className="btn btn-outline" onClick={() => handleNext(null)}>Skip</button>
            <button className="btn btn-primary" onClick={() => handleNext(selected)} disabled={selected === null}>
              {qIdx + 1 === questions.length ? 'Submit Test' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Evaluating ── */
  if (phase === 'evaluating') {
    return (
      <div>
        <div className="page-header"><h1>Aptitude Test</h1></div>
        <div className="card" style={{ maxWidth: 500, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🧠</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>GBC Model Running...</div>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Gradient Boosting Classifier is analysing your accuracy, response time, and error patterns.</p>
          <Skeleton height={10} style={{ marginTop: 24 }} />
        </div>
      </div>
    );
  }

  /* ── Result ── */
  if (phase === 'result' && aptitudeResult) {
    const d = aptitudeResult;
    const col = d.aptitude_score >= 80 ? 'var(--teal)' : d.aptitude_score >= 60 ? 'var(--accent)' : 'var(--amber)';
    return (
      <div>
        <div className="page-header">
          <h1>Aptitude Results</h1>
          <p>GBC analysis complete — cognitive performance profile generated.</p>
        </div>

        <div className="grid-2 mb-16">
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <ScoreRing score={d.aptitude_score} color={col} size={130} label="Aptitude" />
            <div style={{ marginTop: 16 }}>
              <Chip variant={d.aptitude_score >= 80 ? 'teal' : d.aptitude_score >= 60 ? 'accent' : 'amber'}>
                {d.cognitive_grade}
              </Chip>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10 }}>
              Top {100 - d.percentile}% of candidates · Percentile: {d.percentile}
            </p>
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 16 }}>Category Breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ProgressBar label="Quantitative" right={`${d.category_scores?.quantitative}%`} value={d.category_scores?.quantitative} color="var(--teal)" />
              <ProgressBar label="Logical" right={`${d.category_scores?.logical}%`} value={d.category_scores?.logical} color="var(--accent)" />
              <ProgressBar label="Verbal" right={`${d.category_scores?.verbal}%`} value={d.category_scores?.verbal} color="var(--amber)" />
            </div>
            <div className="divider" />
            <div style={{ fontWeight: 600, marginBottom: 10 }}>GBC Feature Inputs</div>
            {d.gbc_features && Object.entries(d.gbc_features).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--muted)' }}>{k.replace(/_/g, ' ')}</span>
                <span>{typeof v === 'number' ? v.toFixed ? v.toFixed(2) : v : v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>GBC Cognitive Insights</div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--muted)', marginBottom: 16 }}>{d.insights}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--green)', marginBottom: 8, textTransform: 'uppercase' }}>✓ Strengths</div>
              {d.strengths?.map((s, i) => <div key={i} style={{ fontSize: 13, padding: '4px 0' }}>• {s}</div>)}
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 8, textTransform: 'uppercase' }}>⚠ Weaknesses</div>
              {d.weaknesses?.map((s, i) => <div key={i} style={{ fontSize: 13, padding: '4px 0' }}>• {s}</div>)}
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/coding')}>Proceed to Coding Test →</button>
        <button className="btn btn-outline" style={{ marginLeft: 12 }} onClick={() => setPhase('intro')}>Retake Test</button>
      </div>
    );
  }

  return null;
}
