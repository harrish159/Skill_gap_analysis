import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Send, Timer, Sparkles, AlertCircle,
  Clock, BookOpen, Flag, Trash2, Eye, EyeOff,
  AlertTriangle, Award, ChevronLeft, ChevronRight,
  CheckCircle2, Settings, HelpCircle, LogOut, Diamond
} from "lucide-react";

const MCQTest = ({ skill, onComplete, onCancel }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [visited, setVisited] = useState({ 0: true });
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");

  const facultyName = JSON.parse(sessionStorage.getItem("user"))?.name || "Faculty";

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      generateQuestions();
    }
  }, []);

  // Start timer ONCE when loading completes — not on every tick
  const timerStarted = useRef(false);
  useEffect(() => {
    if (!loading && questions.length > 0 && !timerStarted.current) {
      timerStarted.current = true;
      setTimeLeft(questions.length * 120);
    }
  }, [loading, questions]);

  // Countdown tick
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-submit when time runs out (but only after test has started)
  useEffect(() => {
    if (timeLeft === 0 && timerStarted.current && questions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  useEffect(() => {
    setAutoSaveStatus("saving");
    const timeout = setTimeout(() => setAutoSaveStatus("saved"), 500);
    return () => clearTimeout(timeout);
  }, [answers]);

  useEffect(() => {
    const enterFullScreen = () => {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => { });
      }
    };
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'p'].includes(e.key)) e.preventDefault();
    };
    document.addEventListener("click", enterFullScreen);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", enterFullScreen);
      document.removeEventListener("keydown", handleKeyDown);
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => { });
    };
  }, []);

  const generateQuestions = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/api/ai/generate-test",
        { skillId: skill._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(res.data);
      // timer is started by a separate effect watching [loading, questions]
    } catch (err) {
      setError("AI generation failed. Please check your connection or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option) => {
    setAnswers({ ...answers, [currentQuestion]: option });
    setVisited({ ...visited, [currentQuestion]: true });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      const next = currentQuestion + 1;
      setCurrentQuestion(next);
      setVisited({ ...visited, [next]: true });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleMarkForReview = () => {
    setMarkedForReview({ ...markedForReview, [currentQuestion]: !markedForReview[currentQuestion] });
  };

  const handleClearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentQuestion];
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    setShowSubmitModal(false);
    if (submitting) return;
    let correctCount = 0;
    questions.forEach((q, index) => { if (answers[index] === q.correct_answer) correctCount++; });
    const score = Math.round((correctCount / questions.length) * 100);
    try {
      setSubmitting(true);
      const facultyId = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/assessments/save",
        { facultyId, ratings: [{ skillId: skill._id, hodRating: score }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTestResult({ score, correct: correctCount, total: questions.length });
    } catch (err) {
      alert("Failed to save your score. Please contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index) => {
    if (markedForReview[index]) return "review";
    if (answers[index]) return "answered";
    if (visited[index]) return "visited";
    return "not-visited";
  };

  const stats = {
    answered: Object.keys(answers).length,
    notAnswered: questions.length - Object.keys(answers).length,
    marked: Object.keys(markedForReview).filter(k => markedForReview[k]).length,
    notVisited: questions.length - Object.keys(visited).length,
  };

  /* ── RESULT SCREEN ── */
  if (testResult) {
    return (
      <div style={styles.overlay}>
        <div style={styles.resultCard}>
          <div style={styles.resultIconWrap}>
            <Award size={44} color="#fff" />
          </div>
          <h2 style={styles.resultTitle}>Assessment Complete!</h2>
          <p style={styles.resultSub}>
            Successfully submitted for <strong>{skill.name}</strong>
          </p>
          <div style={styles.scoreBox}>
            <p style={styles.scoreLabel}>YOUR SCORE</p>
            <p style={styles.scoreValue}>{testResult.score}%</p>
            <p style={styles.scoreDetail}>{testResult.correct} / {testResult.total} correct</p>
          </div>
          <button onClick={onComplete} style={styles.primaryBtn}>Continue to Dashboard</button>
        </div>
      </div>
    );
  }

  /* ── ERROR SCREEN ── */
  if (error) {
    return (
      <div style={styles.overlay}>
        <div style={{ ...styles.resultCard, borderTop: '4px solid #ef4444' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={styles.resultTitle}>Generation Failed</h2>
          <p style={{ color: '#6b7280', marginBottom: 24, textAlign: 'center' }}>{error}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => { setError(null); generateQuestions(); }} style={styles.primaryBtn}>Retry</button>
            <button onClick={onCancel} style={styles.secondaryBtn}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── LOADING SCREEN ── */
  if (loading) {
    return (
      <div style={styles.overlay}>
        <div style={{ textAlign: 'center' }}>
          <div style={styles.spinner}></div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Generating Your Assessment</h2>
          <p style={{ color: '#6b7280' }}>AI is crafting questions for {skill?.name}...</p>
        </div>
      </div>
    );
  }

  /* ── SUBMIT MODAL (Moved to render inside main return to keep background) ── */

  const q = questions[currentQuestion];
  const isLowTime = timeLeft < 300;

  return (
    <div
      style={styles.root}
      onContextMenu={e => e.preventDefault()}
      onCopy={e => e.preventDefault()}
      onCut={e => e.preventDefault()}
      onPaste={e => e.preventDefault()}
    >
      {/* ══ TOP NAVBAR ══ */}
      <header style={styles.navbar}>
        {/* Left: Logo + score */}
        <div style={styles.navLeft}>
          <div style={styles.logoBox}>
            <span style={styles.logoText}>h</span>
          </div>
          <div style={styles.navStat}>
            <CheckCircle2 size={14} color="#9ca3af" />
            <span style={styles.navStatText}>{stats.answered}/{questions.length}</span>
          </div>
          <div style={styles.navStat}>
            <Diamond size={14} color="#9ca3af" />
            <span style={styles.navStatText}>50</span>
          </div>
        </div>

        {/* Center: Timer */}
        <div style={{ ...styles.timerBox, ...(isLowTime ? styles.timerBoxDanger : {}) }}>
          <span style={{ ...styles.timerText, ...(isLowTime ? { color: '#ef4444' } : {}) }}>
            {formatTime(timeLeft)}
          </span>
          {focusMode ? (
            <Eye size={16} color={isLowTime ? '#ef4444' : '#374151'} style={{ cursor: 'pointer' }} onClick={() => setFocusMode(false)} />
          ) : (
            <EyeOff size={16} color="#374151" style={{ cursor: 'pointer' }} onClick={() => setFocusMode(true)} />
          )}
        </div>

        {/* Right: actions */}
        <div style={styles.navRight}>
          <button style={styles.navIcon} title="Help"><HelpCircle size={16} color="#6b7280" /></button>
          <button onClick={onCancel} style={{ ...styles.navIcon, background: '#fee2e2' }} title="Exit">
            <LogOut size={16} color="#ef4444" />
          </button>
        </div>
      </header>

      <div style={styles.body}>
        {/* ══ LEFT SIDEBAR: Question palette ══ */}
        {!focusMode && (
          <aside style={styles.sidebar}>
            {questions.map((_, index) => {
              const status = getQuestionStatus(index);
              const isCurrent = index === currentQuestion;
              return (
                <button
                  key={index}
                  onClick={() => { setCurrentQuestion(index); setVisited({ ...visited, [index]: true }); }}
                  style={{
                    ...styles.qBtn,
                    ...(isCurrent ? styles.qBtnActive : {}),
                    ...(status === 'answered' && !isCurrent ? styles.qBtnAnswered : {}),
                    ...(status === 'review' && !isCurrent ? styles.qBtnReview : {}),
                    ...(status === 'visited' && !isCurrent ? styles.qBtnVisited : {}),
                  }}
                >
                  {index + 1}
                  {markedForReview[index] && <Flag size={7} style={{ position: 'absolute', top: 2, right: 2, color: isCurrent ? '#fff' : '#d97706' }} />}
                </button>
              );
            })}
          </aside>
        )}

        {/* ══ CENTER: Question ══ */}
        <main style={styles.center}>
          {/* Question type badge */}
          <div style={styles.qMeta}>
            <span style={styles.qTypeBadge}>MCQ</span>
          </div>

          {/* Question text */}
          <div style={styles.questionBody}>
            {q.title && <h3 style={styles.questionTitle}>{q.title}</h3>}
            {q.problem && <p style={styles.questionProblem}>{q.problem}</p>}
            
            {/* Code block if question contains code — render pre-formatted */}
            {q.code && (
              <pre style={styles.codeBlock}><code>{q.code}</code></pre>
            )}
            
            <p style={styles.questionText}>{q.question}</p>
          </div>

          {/* Navigation arrows */}
          <div style={styles.qNavRow}>
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              style={{ ...styles.arrowBtn, opacity: currentQuestion === 0 ? 0.3 : 1 }}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentQuestion === questions.length - 1}
              style={{ ...styles.arrowBtn, opacity: currentQuestion === questions.length - 1 ? 0.3 : 1 }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </main>

        {/* ══ RIGHT: Options panel ══ */}
        <aside style={styles.optionsPanel}>
          <p style={styles.optionsPanelTitle}>Select your answer to the problem below</p>

          <div style={styles.optionsList}>
            {q.options.map((option, idx) => {
              const isSelected = answers[currentQuestion] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  style={{
                    ...styles.optionBtn,
                    ...(isSelected ? styles.optionBtnSelected : {}),
                  }}
                >
                  <div style={{ ...styles.optionRadio, ...(isSelected ? styles.optionRadioSelected : {}) }}>
                    {isSelected && <div style={styles.optionRadioDot} />}
                  </div>
                  <span style={{ fontSize: 14, color: isSelected ? '#1d4ed8' : '#111827', fontWeight: isSelected ? 600 : 400 }}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={styles.actionRow}>
            <button onClick={handleMarkForReview} style={{ ...styles.actionBtn, ...(markedForReview[currentQuestion] ? styles.actionBtnReview : {}) }}>
              <Flag size={13} style={{ marginRight: 4 }} />
              {markedForReview[currentQuestion] ? 'Unmark' : 'Mark'}
            </button>
            <button onClick={handleClearResponse} disabled={!answers[currentQuestion]} style={{ ...styles.actionBtn, opacity: answers[currentQuestion] ? 1 : 0.4 }}>
              <Trash2 size={13} style={{ marginRight: 4 }} />
              Clear
            </button>
          </div>

            {/* Submit button at last question */}
          {currentQuestion === questions.length - 1 && (
            <button onClick={() => setShowSubmitModal(true)} style={styles.submitBtn}>
              <Send size={14} style={{ marginRight: 6 }} />
              Submit Test
            </button>
          )}
        </aside>
      </div>

      {/* ── SUBMIT MODAL OVERLAY ── */}
      {showSubmitModal && (
        <div style={{ ...styles.overlay, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={styles.modal}>
            <div style={styles.modalIconWrap}>
              <AlertTriangle size={32} color="#d97706" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, textAlign: 'center', color: '#111827' }}>Submit Assessment?</h3>
            <p style={{ color: '#4b5563', textAlign: 'center', marginBottom: 24, fontSize: 15, lineHeight: 1.5 }}>
              You've answered <strong style={{ color: '#2563eb', fontSize: 16 }}>{stats.answered}</strong> of <strong>{questions.length}</strong> questions.
              {stats.notAnswered > 0 && <span style={{ display: 'block', color: '#d97706', marginTop: 8, fontWeight: 600 }}>⚠ {stats.notAnswered} question(s) left unanswered</span>}
            </p>
            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <button onClick={() => setShowSubmitModal(false)} style={{...styles.secondaryBtn, flex: 1}}>Review</button>
              <button onClick={handleSubmit} style={{...styles.primaryBtn, flex: 1}}>Confirm Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════
   STYLES — light mode, HackerEarth-style
══════════════════════════════════════ */
const styles = {
  root: {
    position: 'fixed', inset: 0, zIndex: 50,
    display: 'flex', flexDirection: 'column',
    background: '#f3f4f6',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    userSelect: 'none',
  },

  /* NAVBAR */
  navbar: {
    height: 48,
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px',
    flexShrink: 0,
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  logoBox: {
    width: 28, height: 28,
    background: '#111827',
    borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#fff', fontWeight: 900, fontSize: 14 },
  navStat: { display: 'flex', alignItems: 'center', gap: 4 },
  navStatText: { fontSize: 13, fontWeight: 600, color: '#374151' },
  timerBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '5px 14px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
  },
  timerBoxDanger: { background: '#fef2f2', border: '1px solid #fca5a5' },
  timerText: { fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: '#111827', letterSpacing: 1 },
  navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  navIcon: {
    width: 32, height: 32, borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  },

  /* BODY */
  body: {
    flex: 1, display: 'flex', overflow: 'hidden',
  },

  /* LEFT SIDEBAR */
  sidebar: {
    width: 56,
    background: '#fff',
    borderRight: '1px solid #e5e7eb',
    overflowY: 'auto',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '12px 0', gap: 6,
    flexShrink: 0,
  },
  qBtn: {
    position: 'relative',
    width: 36, height: 36,
    borderRadius: 50,
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#374151',
    fontWeight: 600, fontSize: 12,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  },
  qBtnActive: { background: '#2563eb', color: '#fff', border: '2px solid #2563eb' },
  qBtnAnswered: { background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' },
  qBtnReview: { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
  qBtnVisited: { background: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db' },

  /* CENTER */
  center: {
    flex: 1,
    display: 'flex', flexDirection: 'column',
    padding: '0',
    overflow: 'auto',
    borderRight: '1px solid #e5e7eb',
    background: '#fff',
  },
  qMeta: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 20px',
    borderBottom: '1px solid #f3f4f6',
    background: '#fafafa',
  },
  qTypeBadge: {
    fontSize: 11, fontWeight: 700, color: '#374151',
    background: '#e5e7eb', padding: '2px 8px', borderRadius: 4,
    letterSpacing: 0.5,
  },
  qPoints: {
    fontSize: 13, fontWeight: 600, color: '#6b7280',
    display: 'flex', alignItems: 'center', marginLeft: 'auto',
  },
  qDifficultyIcon: { cursor: 'pointer' },

  questionBody: {
    flex: 1,
    padding: '24px 24px 16px',
  },
  questionTitle: {
    fontSize: 18, fontWeight: 700, color: '#111827',
    marginBottom: 8,
  },
  questionProblem: {
    fontSize: 15, color: '#4b5563', lineHeight: 1.6,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 15, fontWeight: 600, color: '#111827',
    lineHeight: 1.7, marginTop: 16, marginBottom: 16,
  },
  codeBlock: {
    background: '#1f2937',
    color: '#f9fafb',
    borderRadius: 8,
    padding: '16px 20px',
    fontSize: 13,
    fontFamily: "'Fira Code', 'Courier New', monospace",
    lineHeight: 1.7,
    overflowX: 'auto',
    marginTop: 8,
    marginBottom: 16,
  },

  qNavRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 20px',
    borderTop: '1px solid #f3f4f6',
    background: '#fafafa',
  },
  arrowBtn: {
    height: 32, padding: '0 12px', borderRadius: 6,
    border: '1px solid #d1d5db',
    background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: 600, fontSize: 13,
  },

  /* RIGHT OPTIONS PANEL */
  optionsPanel: {
    flex: 1,
    flexShrink: 0,
    background: '#fff',
    display: 'flex', flexDirection: 'column',
    padding: '0',
    overflowY: 'auto',
  },
  optionsPanelTitle: {
    fontSize: 13, fontWeight: 600, color: '#374151',
    padding: '14px 20px',
    borderBottom: '1px solid #f3f4f6',
    background: '#fafafa',
    margin: 0,
  },
  optionsList: {
    flex: 1,
    display: 'flex', flexDirection: 'column',
    padding: '12px 0',
  },
  optionBtn: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 20px',
    background: '#fff',
    border: 'none',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.12s',
    width: '100%',
  },
  optionBtnSelected: { background: '#eff6ff' },
  optionRadio: {
    width: 18, height: 18, borderRadius: '50%',
    border: '2px solid #d1d5db',
    flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color 0.12s',
  },
  optionRadioSelected: { borderColor: '#2563eb' },
  optionRadioDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#2563eb',
  },

  actionRow: {
    display: 'flex', gap: 8,
    padding: '12px 20px',
    borderTop: '1px solid #f3f4f6',
  },
  actionBtn: {
    display: 'flex', alignItems: 'center',
    padding: '7px 14px', borderRadius: 6,
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    color: '#374151', fontSize: 12, fontWeight: 600,
    cursor: 'pointer',
  },
  actionBtnReview: { background: '#fef3c7', borderColor: '#fcd34d', color: '#92400e' },

  submitBtn: {
    margin: '0 20px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '10px 0',
    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
    color: '#fff', fontWeight: 700, fontSize: 13,
    border: 'none', borderRadius: 8, cursor: 'pointer',
  },

  /* OVERLAYS */
  overlay: {
    position: 'fixed', inset: 0, zIndex: 100,
    background: '#f9fafb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  resultCard: {
    background: '#fff',
    borderRadius: 20,
    padding: '48px 40px',
    maxWidth: 420, width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  resultIconWrap: {
    width: 80, height: 80,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  resultTitle: { fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 8, textAlign: 'center' },
  resultSub: { fontSize: 14, color: '#6b7280', marginBottom: 28, textAlign: 'center' },
  scoreBox: {
    background: '#f0f9ff',
    borderRadius: 12, padding: '24px 40px',
    marginBottom: 28, textAlign: 'center', width: '100%',
    border: '1px solid #bae6fd',
  },
  scoreLabel: { fontSize: 11, fontWeight: 800, color: '#6b7280', letterSpacing: 1, marginBottom: 4 },
  scoreValue: { fontSize: 56, fontWeight: 900, color: '#2563eb', lineHeight: 1.1 },
  scoreDetail: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  modal: {
    background: '#fff', borderRadius: 16, padding: '36px 32px',
    maxWidth: 380, width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  modalIconWrap: {
    width: 56, height: 56, borderRadius: '50%',
    background: '#fef3c7',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },

  primaryBtn: {
    width: '100%', padding: '12px 0',
    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
    color: '#fff', fontWeight: 700, fontSize: 14,
    border: 'none', borderRadius: 10, cursor: 'pointer',
  },
  secondaryBtn: {
    width: '100%', padding: '12px 0',
    background: '#f3f4f6', color: '#374151', fontWeight: 600, fontSize: 14,
    border: '1px solid #e5e7eb', borderRadius: 10, cursor: 'pointer',
  },

  spinner: {
    width: 48, height: 48, borderRadius: '50%',
    border: '4px solid #dbeafe',
    borderTopColor: '#2563eb',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 20px',
  },
};

export default MCQTest;