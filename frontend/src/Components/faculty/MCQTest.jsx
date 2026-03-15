import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronRight, ChevronLeft, Send, Timer, X, Sparkles, AlertCircle,
  CheckCircle2, Clock, User, BookOpen, Flag, Trash2, Eye, EyeOff,
  ChevronUp, ChevronDown, AlertTriangle, Award,
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

  useEffect(() => {
    generateQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !loading) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !loading && questions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft, loading]);

  useEffect(() => {
    setAutoSaveStatus("saving");
    const timeout = setTimeout(() => setAutoSaveStatus("saved"), 500);
    return () => clearTimeout(timeout);
  }, [answers]);

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
      setTimeLeft(res.data.length * 120);
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
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleMarkForReview = () => {
    setMarkedForReview({
      ...markedForReview,
      [currentQuestion]: !markedForReview[currentQuestion],
    });
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
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) correctCount++;
    });

    const score = Math.round((correctCount / questions.length) * 100);

    try {
      setSubmitting(true);
      const facultyId = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/api/assessments/save",
        {
          facultyId,
          ratings: [{ skillId: skill._id, hodRating: score }],
        },
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
    marked: Object.keys(markedForReview).filter((k) => markedForReview[k]).length,
    notVisited: questions.length - Object.keys(visited).length,
  };

  /* ── RESULT SCREEN ── */
  if (testResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full border border-slate-200">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Award size={48} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-3 text-center">Assessment Complete!</h2>
          <p className="text-slate-600 mb-8 text-center">
            You've successfully submitted your assessment for <span className="font-semibold">{skill.name}</span>
          </p>

          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 mb-8 border border-slate-200">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Your Score
            </p>
            <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-center">
              {testResult.score}%
            </p>
            <p className="text-sm text-slate-500 mt-3 text-center">
              {testResult.correct} out of {testResult.total} questions correct
            </p>
          </div>

          <button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-4 font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ── ERROR SCREEN ── */
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full border border-red-200">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center">Generation Failed</h2>
          <p className="text-slate-600 mb-8 text-center">{error}</p>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setError(null);
                generateQuestions();
              }}
              className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-bold hover:bg-blue-700 transition-all"
            >
              Retry
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-slate-200 text-slate-700 rounded-xl py-3 font-bold hover:bg-slate-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── LOADING SCREEN ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={32} className="text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Generating Your Assessment</h2>
          <p className="text-slate-600">AI is crafting questions for {skill.name}...</p>
        </div>
      </div>
    );
  }

  /* ── SUBMIT CONFIRMATION MODAL ── */
  if (showSubmitModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">Submit Assessment?</h3>
          <p className="text-slate-600 mb-6 text-center">
            You have answered <span className="font-bold text-blue-600">{stats.answered}</span> out of{" "}
            <span className="font-bold">{questions.length}</span> questions.
            {stats.notAnswered > 0 && (
              <span className="block mt-2 text-amber-600 font-medium">
                {stats.notAnswered} question{stats.notAnswered > 1 ? "s" : ""} left unanswered
              </span>
            )}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="flex-1 bg-slate-200 text-slate-700 rounded-xl py-3 font-bold hover:bg-slate-300 transition-all"
            >
              Review
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-bold hover:bg-blue-700 transition-all"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const timePercent = (timeLeft / (questions.length * 120)) * 100;
  const isLowTime = timeLeft < 300;

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* ═══════════ TOP HEADER - COMPACT ═══════════ */}
      <header className="bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {skill.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900">{skill.name} Assessment</h1>
                <p className="text-xs text-slate-500">Faculty Skill Evaluation</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-500">Candidate</p>
                <p className="text-xs font-bold text-slate-900">{facultyName}</p>
              </div>

              <div
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${isLowTime
                    ? "bg-red-50 border-red-300 text-red-700 animate-pulse"
                    : "bg-blue-50 border-blue-200 text-blue-700"
                  }`}
              >
                <Clock size={16} />
                <span className="font-mono text-sm font-bold">{formatTime(timeLeft)}</span>
                <div
                  className="absolute bottom-0 left-0 h-0.5 bg-blue-600 rounded-full transition-all"
                  style={{ width: `${timePercent}%` }}
                ></div>
              </div>

              <button
                onClick={() => setFocusMode(!focusMode)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
              >
                {focusMode ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-600">
                Question <span className="font-bold text-blue-600">{currentQuestion + 1}</span> of {questions.length}
              </span>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${autoSaveStatus === "saved" ? "bg-emerald-500" : "bg-amber-500"}`}
                ></div>
                <span className="text-xs text-slate-500">
                  {autoSaveStatus === "saved" ? "Auto-saved" : "Saving..."}
                </span>
              </div>
            </div>

            <div className="h-1.5 flex-1 max-w-md bg-slate-200 rounded-full overflow-hidden mx-4">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* ═══════════ LEFT NAVIGATION PANEL - COMPACT ═══════════ */}
        {!focusMode && (
          <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
            <div className="p-3 sticky top-0 bg-white border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">QUESTION PALETTE</h3>

              <div className="grid grid-cols-2 gap-1.5 text-xs mb-3">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded bg-emerald-500"></div>
                  <span className="text-slate-600 text-xs">Answered</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded bg-slate-300"></div>
                  <span className="text-slate-600 text-xs">Not Answered</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded bg-amber-500"></div>
                  <span className="text-slate-600 text-xs">Review</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded border-2 border-slate-300"></div>
                  <span className="text-slate-600 text-xs">Not Visited</span>
                </div>
              </div>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentQuestion(index);
                        setVisited({ ...visited, [index]: true });
                      }}
                      className={`relative w-10 h-10 rounded-lg font-bold text-xs transition-all ${index === currentQuestion
                          ? "ring-2 ring-blue-600 scale-105"
                          : "hover:scale-105"
                        } ${status === "answered"
                          ? "bg-emerald-500 text-white"
                          : status === "review"
                            ? "bg-amber-500 text-white"
                            : status === "visited"
                              ? "bg-slate-300 text-slate-700"
                              : "bg-white border-2 border-slate-300 text-slate-600"
                        }`}
                    >
                      {index + 1}
                      {markedForReview[index] && (
                        <Flag size={8} className="absolute top-0.5 right-0.5 text-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">SUMMARY</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Answered</span>
                    <span className="font-bold text-emerald-600">{stats.answered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Not Answered</span>
                    <span className="font-bold text-slate-900">{stats.notAnswered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Marked for Review</span>
                    <span className="font-bold text-amber-600">{stats.marked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Not Visited</span>
                    <span className="font-bold text-slate-400">{stats.notVisited}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ═══════════ MAIN QUESTION AREA - COMPACT ═══════════ */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-5xl mx-auto h-full flex flex-col">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5 mb-3 flex-1 flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      Question {currentQuestion + 1}
                    </span>
                    {markedForReview[currentQuestion] && (
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
                        <Flag size={10} /> Marked
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 leading-relaxed">{q.question}</h2>
                </div>
              </div>

              <div className="space-y-2.5 flex-1">
                {q.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion] === option;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      className={`w-full p-3.5 text-left rounded-lg border-2 transition-all flex items-center gap-3 group ${isSelected
                          ? "border-blue-600 bg-blue-50 shadow-sm"
                          : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                        }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm flex-shrink-0 ${isSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 text-slate-600 group-hover:border-blue-400"
                          }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`text-sm ${isSelected ? "text-blue-900 font-semibold" : "text-slate-700"}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ═══════════ ACTION BAR - COMPACT ═══════════ */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handleMarkForReview}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${markedForReview[currentQuestion]
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    }`}
                >
                  <Flag size={14} />
                  {markedForReview[currentQuestion] ? "Unmark" : "Mark"}
                </button>

                <button
                  onClick={handleClearResponse}
                  disabled={!answers[currentQuestion]}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Trash2 size={14} />
                  Clear
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  {currentQuestion === questions.length - 1 ? (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md transition-all"
                    >
                      Submit Test
                      <Send size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MCQTest;