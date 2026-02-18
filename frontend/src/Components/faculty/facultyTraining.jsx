import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  BookOpen, AlertCircle, CheckCircle, X, RefreshCw,
  Clock, Send, Star, Zap, Target, TrendingDown,
  ChevronDown, ChevronUp, BarChart2, History,
} from "lucide-react";

const FacultyTraining = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState({});
  const [expanded, setExpanded] = useState({});
  const [lastSynced, setLastSynced] = useState(null);
  const [polling, setPolling] = useState(false);
  const [activeTab, setActiveTab] = useState("recommendations"); // "recommendations" | "history"

  const facultyId = sessionStorage.getItem("userId");

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setPolling(true);
      const res = await axios.get(
        `http://localhost:3000/api/training/recommend/${facultyId}`
      );
      setRecommendations(res.data || []);
      setLastSynced(new Date());
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load training recommendations");
    } finally {
      setLoading(false);
      setPolling(false);
    }
  }, [facultyId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRequest = async (skillId) => {
    try {
      setRequesting((prev) => ({ ...prev, [skillId]: true }));
      await axios.post("http://localhost:3000/api/training-request", {
        facultyId,
        skillId,
      });
      setRecommendations((prev) =>
        prev.map((item) =>
          item.skillId === skillId ? { ...item, status: "Pending" } : item
        )
      );
      setTimeout(() => fetchData(true), 800);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send training request. Please try again.");
    } finally {
      setRequesting((prev) => ({ ...prev, [skillId]: false }));
    }
  };

  const toggleExpand = (skillId) =>
    setExpanded((prev) => ({ ...prev, [skillId]: !prev[skillId] }));

  /* ── Helpers ── */
  const getSeverity = (gap) => {
    if (gap >= 3) return { label: "High", bar: "bg-red-500", badge: "bg-red-100 text-red-700 border-red-200", leftColor: "#ef4444" };
    if (gap === 2) return { label: "Medium", bar: "bg-amber-500", badge: "bg-amber-100 text-amber-700 border-amber-200", leftColor: "#f59e0b" };
    return { label: "Low", bar: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700 border-yellow-200", leftColor: "#facc15" };
  };

  const renderStars = (value, max = 5) => (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={13}
          className={i < value ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
      ))}
    </div>
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending": return { label: "Pending Review", Icon: Clock, cls: "bg-blue-100 text-blue-700 border-blue-200" };
      case "Accepted": return { label: "Accepted by HOD", Icon: CheckCircle, cls: "bg-emerald-100 text-emerald-700 border-emerald-200" };
      case "Rejected": return { label: "Rejected by HOD", Icon: AlertCircle, cls: "bg-red-100 text-red-700 border-red-200" };
      default: return null;
    }
  };

  const getButtonState = (item, isReq) => {
    if (isReq) return { disabled: true, cls: "bg-teal-400 text-white cursor-wait" };
    switch (item.status) {
      case "Pending": return { disabled: true, cls: "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed" };
      case "Accepted": return { disabled: true, cls: "bg-emerald-100 text-emerald-600 border border-emerald-200 cursor-not-allowed" };
      case "Rejected": return { disabled: true, cls: "bg-red-100 text-red-600 border border-red-200 cursor-not-allowed" };
      default: return { disabled: false, cls: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm" };
    }
  };

  /* Partition */
  const sorted = [...recommendations].sort((a, b) => b.gap - a.gap);
  const available = sorted.filter((r) => !r.status);
  const pending = sorted.filter((r) => r.status === "Pending");
  const history = sorted.filter((r) => r.status === "Accepted" || r.status === "Rejected");

  const acceptedCount = history.filter((h) => h.status === "Accepted").length;
  const rejectedCount = history.filter((h) => h.status === "Rejected").length;
  const highPriority = sorted.filter((r) => r.gap >= 3).length;

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  /* ── Card renderer ── */
  const renderCard = (item, showAction = true) => {
    const sev = getSeverity(item.gap);
    const sb = getStatusBadge(item.status);
    const isReq = requesting[item.skillId];
    const btn = getButtonState(item, isReq);
    const isOpen = expanded[item.skillId];
    const pct = Math.min(Math.round((item.currentRating / item.requiredLevel) * 100), 100);

    return (
      <div
        key={item.skillId}
        className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200 overflow-hidden border-l-4"
        style={{ borderLeftColor: sev.leftColor }}
      >
        <div className="p-5">
          {/* Title + badges + button */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="text-slate-500" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 mb-1.5 truncate">{item.skillName}</h3>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${sev.badge}`}>
                    <TrendingDown size={10} /> {sev.label} Priority
                  </span>
                  {sb && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${sb.cls}`}>
                      <sb.Icon size={10} /> {sb.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Button */}
            {showAction && (
              <button
                onClick={() => !btn.disabled && handleRequest(item.skillId)}
                disabled={btn.disabled}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold text-sm transition-all ${btn.cls}`}
              >
                {isReq ? (
                  <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /> Sending</>
                ) : item.status === "Pending" ? <><Clock size={14} /> Pending</>
                  : item.status === "Accepted" ? <><CheckCircle size={14} /> Approved</>
                    : item.status === "Rejected" ? <><AlertCircle size={14} /> Rejected</>
                      : <><Send size={14} /> Request</>}
              </button>
            )}
          </div>

          {/* HOD decision banner */}
          {(item.status === "Accepted" || item.status === "Rejected") && (
            <div className={`mb-4 p-3 rounded-lg border text-sm ${item.status === "Accepted"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
              }`}>
              <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                {item.status === "Accepted"
                  ? <><CheckCircle size={14} /> Request Approved</>
                  : <><AlertCircle size={14} /> Request Rejected</>}
              </div>
              <p className="text-xs opacity-80">
                {item.hodReason || (item.status === "Accepted"
                  ? "Your training request has been approved by your HOD."
                  : "No reason provided.")}
              </p>
            </div>
          )}

          {/* Ratings */}
          <div className="flex items-center gap-5 mb-3">
            <div>
              <p className="text-xs text-slate-400 mb-1">Current</p>
              <div className="flex items-center gap-1.5">
                {renderStars(item.currentRating)}
                <span className="text-xs font-bold text-slate-700">{item.currentRating}/5</span>
              </div>
            </div>
            <div className="w-px h-7 bg-slate-200" />
            <div>
              <p className="text-xs text-slate-400 mb-1">Required</p>
              <div className="flex items-center gap-1.5">
                {renderStars(item.requiredLevel)}
                <span className="text-xs font-bold text-slate-700">{item.requiredLevel}/5</span>
              </div>
            </div>
            <div className="w-px h-7 bg-slate-200" />
            <div>
              <p className="text-xs text-slate-400 mb-1">Gap</p>
              <span className={`text-sm font-bold ${item.gap >= 3 ? "text-red-600" : item.gap === 2 ? "text-amber-600" : "text-yellow-600"}`}>
                -{item.gap} level{item.gap > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Proficiency toward target</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className={`${sev.bar} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Current: {item.currentRating}</span>
              <span>Target: {item.requiredLevel}</span>
            </div>
          </div>

          {/* Matching programs */}
          {item.trainings?.length > 0 && (
            <>
              <button
                onClick={() => toggleExpand(item.skillId)}
                className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors"
              >
                <BarChart2 size={13} />
                {isOpen ? "Hide" : "View"} Matching Programs ({item.trainings.length})
                {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              {isOpen && (
                <div className="mt-3 space-y-2">
                  {item.trainings.map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-teal-300 transition-colors">
                      <BookOpen size={13} className="text-teal-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{t.title}</p>
                        <p className="text-xs text-slate-500">{t.provider} · {t.type}</p>
                        {t.durationHours && <p className="text-xs text-slate-400">{t.durationHours}h · {t.mode}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Recommended Training</h1>
              <p className="text-slate-600">Training programs tailored to close your skill gaps</p>
            </div>
            <div className="flex items-center gap-3">
              {lastSynced && (
                <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${polling ? "bg-teal-50 text-teal-600 border-teal-200" : "bg-white text-slate-400 border-slate-200"
                  }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${polling ? "bg-teal-500 animate-pulse" : "bg-slate-300"}`} />
                  {polling ? "Syncing..." : `Synced ${lastSynced.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                </div>
              )}
              <button
                onClick={() => fetchData()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
              >
                <RefreshCw size={15} className={polling ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError("")} className="text-red-600 hover:text-red-800"><X size={18} /></button>
          </div>
        )}

        {/* ── Stat Cards ── */}
        {recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { title: "Total Recommended", value: recommendations.length, icon: BookOpen, color: "bg-blue-100 text-blue-600", borderColor: "border-blue-200" },
              { title: "High Priority", value: highPriority, icon: Zap, color: "bg-red-100 text-red-600", borderColor: "border-red-200" },
              { title: "Pending Review", value: pending.length, icon: Clock, color: "bg-amber-100 text-amber-600", borderColor: "border-amber-200" },
              { title: "Accepted", value: acceptedCount, icon: CheckCircle, color: "bg-emerald-100 text-emerald-600", borderColor: "border-emerald-200" },
            ].map((stat, i) => (
              <div key={i}
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} border ${stat.borderColor} flex items-center justify-center`}>
                    <stat.icon size={22} />
                  </div>
                </div>
                <h3 className="text-sm text-slate-600 font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab Navigation ── */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === "recommendations"
                ? "border-teal-600 text-teal-600 bg-teal-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
            >
              <BookOpen size={16} />
              Recommendations
              {(available.length + pending.length) > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "recommendations" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600"
                  }`}>
                  {available.length + pending.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === "history"
                ? "border-teal-600 text-teal-600 bg-teal-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
            >
              <History size={16} />
              History
              {history.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "history" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600"
                  }`}>
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════
             TAB: RECOMMENDATIONS
        ══════════════════════════════════════════ */}
        {activeTab === "recommendations" && (
          <div className="space-y-6">

            {/* All clear */}
            {available.length === 0 && pending.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-16 text-center">
                <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-emerald-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">You're All Caught Up! 🎉</h2>
                <p className="text-slate-600 max-w-sm mx-auto text-sm">
                  You've requested all available recommendations. Check the History tab for updates.
                </p>
              </div>
            )}

            {/* Pending sub-section */}
            {pending.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center">
                    <Clock className="text-amber-600" size={16} />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Awaiting HOD Approval</h2>
                  <span className="text-xs text-slate-400">({pending.length})</span>
                </div>
                <div className="space-y-3">
                  {pending.map((item) => renderCard(item, true))}
                </div>
              </div>
            )}

            {/* Available sub-section */}
            {available.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center">
                    <Zap className="text-blue-600" size={16} />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Action Required</h2>
                  <span className="text-xs text-slate-400">({available.length} skills need training)</span>
                </div>
                <div className="space-y-3">
                  {available.map((item) => renderCard(item, true))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
             TAB: HISTORY
        ══════════════════════════════════════════ */}
        {activeTab === "history" && (
          <div>
            {history.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-16 text-center">
                <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <History className="text-slate-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No history yet</h3>
                <p className="text-slate-500 text-sm">
                  Approved or rejected training requests will appear here once your HOD responds.
                </p>
              </div>
            ) : (
              <>
                {/* History summary */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-teal-300 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center">
                        <CheckCircle className="text-emerald-600" size={22} />
                      </div>
                    </div>
                    <h3 className="text-sm text-slate-600 font-medium mb-1">Approved</h3>
                    <p className="text-3xl font-bold text-slate-900">{acceptedCount}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-teal-300 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center">
                        <AlertCircle className="text-red-600" size={22} />
                      </div>
                    </div>
                    <h3 className="text-sm text-slate-600 font-medium mb-1">Rejected</h3>
                    <p className="text-3xl font-bold text-slate-900">{rejectedCount}</p>
                  </div>
                </div>

                {/* Accepted section */}
                {history.filter(h => h.status === "Accepted").length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center">
                        <CheckCircle className="text-emerald-600" size={16} />
                      </div>
                      <h2 className="text-base font-bold text-slate-900">Approved</h2>
                      <span className="text-xs text-slate-400">({acceptedCount})</span>
                    </div>
                    <div className="space-y-3">
                      {history.filter(h => h.status === "Accepted").map((item) => renderCard(item, false))}
                    </div>
                  </div>
                )}

                {/* Rejected section */}
                {history.filter(h => h.status === "Rejected").length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center">
                        <AlertCircle className="text-red-600" size={16} />
                      </div>
                      <h2 className="text-base font-bold text-slate-900">Rejected</h2>
                      <span className="text-xs text-slate-400">({rejectedCount})</span>
                    </div>
                    <div className="space-y-3">
                      {history.filter(h => h.status === "Rejected").map((item) => renderCard(item, false))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default FacultyTraining;