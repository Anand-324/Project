import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useAppContext';
import { generateQuestion, evaluateAnswer, getAriaFeedback } from '../utils/api';
import { Chip, ErrorBox, ProgressBar } from '../components/UI';

const TOTAL_QUESTIONS = 6;

export default function InterviewPage() {
  const navigate = useNavigate();
  const { profile, profileResult, interviewData, setInterviewData, markComplete } = useApp();

  const [phase, setPhase] = useState('intro'); // intro | active | done
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm ARIA, your AI HR Interviewer. I'll ask questions personalised to your profile using T5-based generation. Each answer you give will be evaluated by NLP for relevance, clarity, and depth. Click 'Begin Interview' when ready. Good luck! 🎯" }
  ]);
  const [currentQ, setCurrentQ] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qNum, setQNum] = useState(0);
  const [scores, setScores] = useState([]);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  function addMessage(role, text, meta) {
    setMessages(m => [...m, { role, text, meta }]);
  }

  async function startInterview() {
    setPhase('active');
    await fetchNextQuestion(1, []);
  }

  async function fetchNextQuestion(num, history) {
    setLoading(true);
    addMessage('ai', null, 'typing');
    try {
      const { data } = await generateQuestion({
        profile: { role: profile.role, skills: profile.skills, projects: profile.projects, cgpa: profile.cgpa },
        history,
        question_number: num,
      });
      setMessages(m => m.filter(x => x.meta !== 'typing'));
      addMessage('ai', data.question, { category: data.category, difficulty: data.difficulty, intent: data.intent });
      setCurrentQ(data);
      setQNum(num);
    } catch (e) {
      setMessages(m => m.filter(x => x.meta !== 'typing'));
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!answer.trim() || loading) return;
    const userAns = answer.trim();
    setAnswer('');
    addMessage('user', userAns);
    setLoading(true);

    try {
      // NLP evaluation
      const { data: nlp } = await evaluateAnswer({ question: currentQ.question, answer: userAns, role: profile.role });

      // ARIA feedback
      const { data: fb } = await getAriaFeedback({ question: currentQ.question, answer: userAns, nlp_scores: nlp });

      addMessage('ai', fb.feedback, { nlp });

      const newScores = [...scores, { ...nlp, question: currentQ.question }];
      setScores(newScores);

      const history = messages
        .filter(m => m.role === 'ai' && m.text && !m.meta?.nlp)
        .slice(-qNum)
        .map((m, i) => ({ question: m.text, answer: userAns }));

      if (qNum >= TOTAL_QUESTIONS) {
        setInterviewData({ history, scores: newScores });
        markComplete('interview');
        setPhase('done');
        addMessage('ai', "🎉 That's a wrap! You've completed your mock interview with ARIA. Your answers have been evaluated by NLP. Head to Results & SHAP to see your full performance breakdown.");
      } else {
        setTimeout(() => fetchNextQuestion(qNum + 1, history), 1200);
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSkip() {
    addMessage('user', '[Skipped]');
    const newScores = [...scores, { composite: 0, relevance_score: 0, clarity_score: 0, depth_score: 0, question: currentQ?.question }];
    setScores(newScores);
    if (qNum >= TOTAL_QUESTIONS) {
      markComplete('interview');
      setPhase('done');
    } else {
      await fetchNextQuestion(qNum + 1, []);
    }
  }

  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b.composite, 0) / scores.length) : 0;

  return (
    <div>
      <div className="page-header">
        <h1>HR Avatar Interview</h1>
        <p>Powered by <strong>T5 question generation</strong> + <strong>NLP answer evaluation</strong>.</p>
      </div>

      <div className="grid-2">
        {/* ARIA panel */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 12px' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2d2a5e, #1a1d3a)',
              border: '2px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            }}>🤖</div>
            {phase === 'active' && <div className="av-ring" />}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>ARIA</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>AI HR Interviewer · T5-Powered</div>
          <Chip variant={phase === 'active' ? 'red' : phase === 'done' ? 'green' : 'teal'}>
            {phase === 'active' ? '🔴 Live Interview' : phase === 'done' ? '✅ Complete' : '⏳ Ready'}
          </Chip>

          <div className="divider" />

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Session Stats</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Questions</span>
                <span>{qNum} / {TOTAL_QUESTIONS}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Avg. Score</span>
                <span style={{ color: 'var(--teal)' }}>{avgScore > 0 ? `${avgScore}%` : '—'}</span>
              </div>
            </div>
            {scores.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <ProgressBar value={(qNum / TOTAL_QUESTIONS) * 100} color="var(--accent)" />
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Progress</div>
              </div>
            )}
          </div>

          <div className="divider" />

          {/* Per-question NLP scores */}
          {scores.length > 0 && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>NLP Scores</div>
              {scores.map((s, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Q{i + 1}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Chip variant="teal" style={{ fontSize: 10, padding: '2px 6px' }}>R:{s.relevance_score}</Chip>
                    <Chip variant="accent" style={{ fontSize: 10, padding: '2px 6px' }}>C:{s.clarity_score}</Chip>
                    <Chip variant="amber" style={{ fontSize: 10, padding: '2px 6px' }}>D:{s.depth_score}</Chip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontWeight: 600 }}>Interview Session</div>

          <div className="chat-wrap" ref={chatRef}>
            {messages.map((m, i) => (
              <ChatMessage key={i} msg={m} />
            ))}
          </div>

          <ErrorBox message={error} />

          {phase === 'intro' && (
            <button className="btn btn-primary" onClick={startInterview}>▶ Begin Interview</button>
          )}

          {phase === 'active' && (
            <div>
              <textarea
                className="form-textarea"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                disabled={loading}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }}
                style={{ marginBottom: 10 }}
              />
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>Ctrl+Enter to submit</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline btn-sm" onClick={handleSkip} disabled={loading}>Skip</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !answer.trim()}>
                  {loading ? '⏳ Evaluating...' : 'Submit Answer →'}
                </button>
              </div>
            </div>
          )}

          {phase === 'done' && (
            <button className="btn btn-primary" onClick={() => navigate('/results')}>
              View Results & SHAP →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ msg }) {
  if (msg.meta === 'typing') {
    return (
      <div className="msg msg-ai">
        <div className="msg-avatar">🤖</div>
        <div><div className="msg-body"><div className="typing"><span /><span /><span /></div></div></div>
      </div>
    );
  }

  const isAi = msg.role === 'ai';
  return (
    <div className={`msg msg-${msg.role}`}>
      <div className="msg-avatar">{isAi ? '🤖' : 'You'}</div>
      <div>
        <div className="msg-body">
          {msg.text}
          {msg.meta?.category && (
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Chip variant="accent" style={{ fontSize: 10, padding: '2px 6px' }}>{msg.meta.category}</Chip>
              <Chip variant={msg.meta.difficulty === 'Hard' ? 'red' : msg.meta.difficulty === 'Medium' ? 'amber' : 'green'} style={{ fontSize: 10, padding: '2px 6px' }}>{msg.meta.difficulty}</Chip>
            </div>
          )}
          {msg.meta?.nlp && (
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Chip variant="teal" style={{ fontSize: 10, padding: '2px 6px' }}>Relevance: {msg.meta.nlp.relevance_score}</Chip>
              <Chip variant="accent" style={{ fontSize: 10, padding: '2px 6px' }}>Clarity: {msg.meta.nlp.clarity_score}</Chip>
              <Chip variant="amber" style={{ fontSize: 10, padding: '2px 6px' }}>Depth: {msg.meta.nlp.depth_score}</Chip>
            </div>
          )}
        </div>
        <div className="msg-meta">{isAi ? 'ARIA' : 'You'} · Now</div>
      </div>
    </div>
  );
}
