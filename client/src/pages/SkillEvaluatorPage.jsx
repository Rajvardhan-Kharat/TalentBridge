import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Brain, CheckCircle, XCircle, ChevronRight, RotateCcw, Trophy, Target, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner', color: '#10b981', desc: 'Basic concepts & definitions' },
  { id: 'intermediate', label: 'Intermediate', color: '#f59e0b', desc: 'Practical usage & patterns' },
  { id: 'advanced', label: 'Advanced', color: '#ef4444', desc: 'Deep internals & edge cases' },
];

const BADGE_MAP = {
  beginner: { text: 'Novice', color: '#94a3b8', emoji: '🌱' },
  intermediate: { text: 'Practitioner', color: '#f59e0b', emoji: '⚡' },
  advanced: { text: 'Expert', color: '#6366f1', emoji: '🚀' },
};

function ScoreCircle({ score, color }) {
  const r = 48, c = 2 * Math.PI * r;
  const pct = score / 100;
  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      <circle cx={60} cy={60} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
      <circle cx={60} cy={60} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${pct * c} ${c}`} strokeLinecap="round"
        transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x={60} y={55} textAnchor="middle" fill="#fff" fontSize={22} fontWeight={800}>{score}%</text>
      <text x={60} y={72} textAnchor="middle" fill="#94a3b8" fontSize={10}>Score</text>
    </svg>
  );
}

export default function SkillEvaluatorPage() {
  const { user } = useAuth();
  const userSkills = (user?.profile?.skills || []).map(s => s.name || s);

  const [phase, setPhase] = useState('setup');   // setup | loading | quiz | results
  const [skill, setSkill] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});  // { qIndex: 'A' }
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const activeSkill = skill === '__custom__' ? customSkill : skill;

  const startQuiz = async () => {
    if (!activeSkill.trim()) { toast.error('Please select or enter a skill'); return; }
    setPhase('loading');
    try {
      const { data } = await api.post('/ai/skill-quiz', { skill: activeSkill.trim(), difficulty, count: 10 });
      setQuiz(data.quiz);
      setCurrentQ(0);
      setAnswers({});
      setSelected(null);
      setShowExplanation(false);
      setPhase('quiz');
    } catch (e) {
      toast.error('Could not generate quiz. Please try again.');
      setPhase('setup');
    }
  };

  const handleAnswer = (opt) => {
    if (selected) return; // already answered this question
    setSelected(opt);
    setShowExplanation(true);
    setAnswers(a => ({ ...a, [currentQ]: opt }));
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= quiz.questions.length) {
      setPhase('results');
    } else {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  const getResults = () => {
    if (!quiz) return { correct: 0, score: 0, grade: '' };
    let correct = 0;
    quiz.questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    const score = Math.round((correct / quiz.questions.length) * 100);
    let grade = '';
    if (score >= 85) grade = 'advanced';
    else if (score >= 55) grade = 'intermediate';
    else grade = 'beginner';
    return { correct, total: quiz.questions.length, score, grade };
  };

  const question = quiz?.questions[currentQ];
  const results = getResults();
  const badge = BADGE_MAP[results.grade] || BADGE_MAP.beginner;
  const diffColor = DIFFICULTIES.find(d => d.id === difficulty)?.color || '#6366f1';

  // ─────────────────────────────────────────────────────
  // SETUP SCREEN
  // ─────────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div style={{ padding: '28px 32px', maxWidth: 740, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }} className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Brain size={18} color="#818cf8" />
          <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, letterSpacing: 1 }}>SKILL EVALUATOR</span>
        </div>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Test Your Skills</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Take a 10-question AI-generated MCQ test and get an honest assessment of your proficiency level.</p>
      </div>

      {/* Skill Selector */}
      <div className="glass animate-fade-in" style={{ padding: 24, borderRadius: 16, marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>Select Skill to Evaluate</p>

        {userSkills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {userSkills.slice(0, 12).map(s => (
              <button key={s} onClick={() => setSkill(s)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  border: `2px solid ${skill === s ? '#6366f1' : 'var(--border)'}`,
                  background: skill === s ? 'rgba(99,102,241,0.15)' : 'var(--bg-elevated)',
                  color: skill === s ? '#818cf8' : 'var(--text-secondary)',
                }}>
                {s}
              </button>
            ))}
            <button onClick={() => setSkill('__custom__')}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                border: `2px solid ${skill === '__custom__' ? '#6366f1' : 'var(--border)'}`,
                background: skill === '__custom__' ? 'rgba(99,102,241,0.15)' : 'var(--bg-elevated)',
                color: skill === '__custom__' ? '#818cf8' : 'var(--text-secondary)',
              }}>
              + Custom
            </button>
          </div>
        )}

        {(skill === '__custom__' || userSkills.length === 0) && (
          <input className="input" placeholder="e.g. React.js, Machine Learning, SQL..."
            value={customSkill} onChange={e => setCustomSkill(e.target.value)}
            style={{ marginBottom: 0 }} />
        )}
      </div>

      {/* Difficulty Selector */}
      <div className="glass animate-fade-in" style={{ padding: 24, borderRadius: 16, marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>Difficulty Level</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {DIFFICULTIES.map(d => (
            <button key={d.id} onClick={() => setDifficulty(d.id)}
              style={{
                flex: 1, minWidth: 140, padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                border: `2px solid ${difficulty === d.id ? d.color : 'var(--border)'}`,
                background: difficulty === d.id ? `${d.color}14` : 'var(--bg-elevated)',
              }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: difficulty === d.id ? d.color : 'var(--text-primary)', marginBottom: 3 }}>{d.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="glass animate-fade-in" style={{ padding: '14px 18px', borderRadius: 12, marginBottom: 20, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[{ icon: <Target size={14} />, text: '10 MCQ questions' }, { icon: <Zap size={14} />, text: 'AI-generated, unique each time' }, { icon: <Trophy size={14} />, text: 'Instant score + explanations' }].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span style={{ color: '#818cf8' }}>{f.icon}</span> {f.text}
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={startQuiz} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, fontWeight: 700 }}>
        <Brain size={16} /> Start Quiz — {activeSkill || 'Select a skill first'}
      </button>
    </div>
  );

  // ─────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────
  if (phase === 'loading') return (
    <div style={{ padding: '28px 32px', maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ padding: '80px 0' }}>
        <div className="loader" style={{ width: 44, height: 44, margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Generating your quiz...</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>AI is creating 10 personalized questions for <strong style={{ color: '#818cf8' }}>{activeSkill}</strong></p>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────
  // QUIZ SCREEN
  // ─────────────────────────────────────────────────────
  if (phase === 'quiz' && question) {
    const progress = ((currentQ) / quiz.questions.length) * 100;
    const isCorrect = selected === question.correctAnswer;

    return (
      <div style={{ padding: '28px 32px', maxWidth: 740, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }} className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600 }}>{quiz.skill}</span>
              <span style={{ margin: '0 8px', color: 'var(--border)' }}>·</span>
              <span style={{ fontSize: 12, color: diffColor, fontWeight: 600, textTransform: 'capitalize' }}>{quiz.difficulty}</span>
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              {currentQ + 1} / {quiz.questions.length}
            </span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Question */}
        <div className="glass animate-fade-in" style={{ padding: '28px 32px', borderRadius: 16, marginBottom: 16 }}>
          {question.topic && (
            <span style={{ fontSize: 10, fontWeight: 700, color: diffColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, display: 'block' }}>
              {question.topic}
            </span>
          )}
          <h2 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.55, color: 'var(--text-primary)', marginBottom: 24 }}>
            {question.question}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(question.options).map(([opt, text]) => {
              let bg = 'var(--bg-elevated)', border = 'var(--border)', color = 'var(--text-primary)';
              if (selected) {
                if (opt === question.correctAnswer) { bg = 'rgba(16,185,129,0.1)'; border = '#10b981'; color = '#10b981'; }
                else if (opt === selected && opt !== question.correctAnswer) { bg = 'rgba(239,68,68,0.08)'; border = '#ef4444'; color = '#ef4444'; }
              } else if (selected === opt) { bg = 'rgba(99,102,241,0.1)'; border = '#6366f1'; }

              return (
                <button key={opt} onClick={() => handleAnswer(opt)} disabled={!!selected}
                  style={{
                    padding: '13px 16px', borderRadius: 10, border: `2px solid ${border}`, background: bg,
                    cursor: selected ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = '#6366f1'; }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: border === 'var(--border)' ? 'rgba(99,102,241,0.1)' : border + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: border === 'var(--border)' ? '#818cf8' : border, flexShrink: 0 }}>{opt}</span>
                  <span style={{ fontSize: 13, color, lineHeight: 1.45 }}>{text}</span>
                  {selected && opt === question.correctAnswer && <CheckCircle size={16} color="#10b981" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  {selected && opt === selected && opt !== question.correctAnswer && <XCircle size={16} color="#ef4444" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="animate-fade-in glass" style={{ padding: '16px 20px', borderRadius: 12, marginBottom: 16, border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, background: isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: isCorrect ? '#10b981' : '#ef4444', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              {isCorrect ? <><CheckCircle size={13} /> Correct!</> : <><XCircle size={13} /> Incorrect — Correct answer: {question.correctAnswer}</>}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{question.explanation}</p>
          </div>
        )}

        {selected && (
          <button className="btn-primary animate-fade-in" onClick={nextQuestion} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14 }}>
            {currentQ + 1 >= quiz.questions.length ? '🏁 See Results' : <>Next Question <ChevronRight size={15} /></>}
          </button>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // RESULTS SCREEN
  // ─────────────────────────────────────────────────────
  if (phase === 'results') {
    const correctAnswers = quiz.questions.filter((q, i) => answers[i] === q.correctAnswer);
    return (
      <div style={{ padding: '28px 32px', maxWidth: 740, margin: '0 auto' }}>
        <div className="glass animate-fade-in" style={{ padding: '36px 32px', borderRadius: 20, textAlign: 'center', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${badge.color}, #8b5cf6)` }} />
          <div style={{ fontSize: 48, marginBottom: 8 }}>{badge.emoji}</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Quiz Complete!</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>You evaluated <strong style={{ color: '#818cf8' }}>{quiz.skill}</strong> at <strong style={{ color: diffColor }}>{quiz.difficulty}</strong> level</p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <ScoreCircle score={results.score} color={badge.color} />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 30, border: `2px solid ${badge.color}`, background: `${badge.color}14`, marginBottom: 24 }}>
            <Trophy size={14} color={badge.color} />
            <span style={{ fontSize: 14, fontWeight: 700, color: badge.color }}>{badge.text} Level</span>
          </div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ padding: '12px 20px', background: 'rgba(16,185,129,0.08)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{results.correct}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Correct</div>
            </div>
            <div style={{ padding: '12px 20px', background: 'rgba(239,68,68,0.08)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{results.total - results.correct}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Incorrect</div>
            </div>
            <div style={{ padding: '12px 20px', background: 'rgba(99,102,241,0.08)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#818cf8' }}>{results.total}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total</div>
            </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="glass animate-fade-in" style={{ padding: '20px 24px', borderRadius: 16, marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>Question Breakdown</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quiz.questions.map((q, i) => {
              const isCorrect = answers[i] === q.correctAnswer;
              return (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 8, background: isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
                  {isCorrect ? <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} /> : <XCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 4 }}>Q{i + 1}: {q.question}</div>
                    {!isCorrect && <div style={{ fontSize: 11, color: '#10b981' }}>✓ Correct: {q.correctAnswer} — {q.options[q.correctAnswer]}</div>}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{q.explanation}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" onClick={() => { setPhase('setup'); setQuiz(null); }} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
            <RotateCcw size={14} /> Try Another Skill
          </button>
          <button className="btn-secondary" onClick={startQuiz} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
            <Brain size={14} /> Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return null;
}
