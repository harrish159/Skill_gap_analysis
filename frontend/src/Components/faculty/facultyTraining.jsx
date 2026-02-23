import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  BookOpen, AlertCircle, CheckCircle, X, RefreshCw,
  Clock, Send, Star, Zap, Target, TrendingDown,
  ChevronDown, ChevronUp, BarChart2, History, Info,
} from "lucide-react";

const FacultyTraining = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState({});
  const [expanded, setExpanded] = useState({});
  const [lastSynced, setLastSynced] = useState(null);
  const [polling, setPolling] = useState(false);
  const [activeTab, setActiveTab] = useState("recommendations");

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
      console.log(res.data);
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

  const handleRequest = async (skillId, trainingId = null) => {
    try {
      const uniqueId = trainingId ? `${skillId}-${trainingId}` : skillId;
      setRequesting((prev) => ({ ...prev, [uniqueId]: true }));
      await axios.post("http://localhost:3000/api/training-request", {
        facultyId,
        skillId,
        trainingId,
      });
      setRecommendations((prev) =>
        prev.map((item) => {
          if (item.skillId !== skillId) return item;

          // If it was a specific training request, update that training's status
          if (trainingId) {
            return {
              ...item,
              trainings: (item.trainings || []).map(t =>
                t._id === trainingId ? { ...t, status: "Pending" } : t
              )
            };
          }

          // Legacy skill-level request
          return { ...item, status: "Pending" };
        })
      );
      setTimeout(() => fetchData(true), 800);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send training request. Please try again.");
    } finally {
      const uniqueId = trainingId ? `${skillId}-${trainingId}` : skillId;
      setRequesting((prev) => ({ ...prev, [uniqueId]: false }));
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

  /* Check if training matches gap criteria */
  const trainingMatchesGap = (training, currentGap) => {
    const minGap = training.minGapScore || 1;
    const maxGap = training.maxGapScore || 5;
    return currentGap >= minGap && currentGap <= maxGap;
  };

  /* Partition */
  const sorted = [...recommendations].sort((a, b) => b.gap - a.gap);

  // A skill is "available" if it has NO requests at all (skill-level or training-level)
  const available = sorted.filter((r) =>
    !r.status && !(r.trainings || []).some(t => t.status)
  );

  // A skill is "pending" if it has ANY pending request (skill-level or training-level)
  const pending = sorted.filter((r) =>
    r.status === "Pending" || (r.trainings || []).some(t => t.status === "Pending")
  );

  // Flattened list of approved/rejected training courses (The "processed" courses)
  const history = [];
  sorted.forEach(r => {
    // Check specific trainings first
    (r.trainings || []).forEach(t => {
      if (["Accepted", "Rejected"].includes(t.status)) {
        history.push({
          ...t,
          skillName: r.skillName,
          skillIdByGap: r.skillId, // Keep for context
          gap: r.gap,
          currentRating: r.currentRating,
          requiredLevel: r.requiredLevel,
          isCourse: true
        });
      }
    });

    // Check legacy skill-level requests
    if (["Accepted", "Rejected"].includes(r.status)) {
      history.push({
        ...r,
        title: `Skill Training: ${r.skillName}`,
        provider: "Internal Training / External Resource",
        type: "Direct Skill Request",
        isCourse: false
      });
    }
  });

  // Count items for the stat cards (summarizing all requests)
  const getCount = (status) => {
    let count = 0;
    sorted.forEach(r => {
      if (r.status === status) count++;
      (r.trainings || []).forEach(t => {
        if (t.status === status) count++;
      });
    });
    return count;
  };

  const pendingTotal = getCount("Pending");
  const acceptedTotal = getCount("Accepted");
  const rejectedTotal = getCount("Rejected");
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

  /* ── History Item renderer ── */
  const renderHistoryItem = (item) => {
    const isAccepted = item.status === "Accepted";

    return (
      <div
        key={item._id || item.skillId}
        className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-l-4"
        style={{ borderLeftColor: isAccepted ? "#10b981" : "#ef4444" }}
      >
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isAccepted ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
              }`}>
              <BookOpen size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 truncate">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-slate-500">{item.provider}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-400">{item.skillName}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${isAccepted ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                  }`}>
                  {isAccepted ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                  {isAccepted ? "Approved Course" : "Rejected Course"}
                </span>
                {item.type && <span className="text-[10px] text-slate-400 font-medium">{item.type}</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end flex-shrink-0">
            {item.hodReason && (
              <div className="max-w-[200px]">
                <p className="text-[11px] text-slate-500 italic text-right mb-1">" {item.hodReason} "</p>
                <p className="text-[9px] text-slate-400 text-right">— HOD Comment</p>
              </div>
            )}
            {!item.hodReason && isAccepted && (
              <span className="text-[10px] text-emerald-600/70 font-medium italic">Ready to enroll</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ── Card renderer ── */
  const renderCard = (item, showAction = true) => {
    const sev = getSeverity(item.gap);
    const sb = getStatusBadge(item.status);
    const isReq = requesting[item.skillId];
    const btn = getButtonState(item, isReq);
    const isOpen = expanded[item.skillId];
    const pct = Math.min(Math.round((item.currentRating / item.requiredLevel) * 100), 100);

    // Use all trainings returned by backend as they are already filtered by dept and gap
    const matchingTrainings = item.trainings || [];
    const hasMatchingTrainings = matchingTrainings.length > 0;

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
                </div>
              </div>
            </div>

          </div>

          {/* Gap explanation banner */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <span className="font-semibold">Your gap: {item.gap} level{item.gap > 1 ? 's' : ''}</span>
                <span className="ml-1">— Trainings shown match gap range {item.gap}</span>
                {!hasMatchingTrainings && item.trainings?.length > 0 && (
                  <span className="block mt-1 text-blue-700">
                    ⚠️ {item.trainings.length} training{item.trainings.length > 1 ? 's' : ''} available but don't match your gap level
                  </span>
                )}
              </div>
            </div>
          </div>

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
          {hasMatchingTrainings && (
            <>
              <button
                onClick={() => toggleExpand(item.skillId)}
                className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors"
              >
                <BarChart2 size={13} />
                {isOpen ? "Hide" : "View"} Matching Programs ({matchingTrainings.length})
                {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              {isOpen && (
                <div className="mt-3 space-y-2">
                  {matchingTrainings.map((t, i) => {
                    const uniqueId = t._id ? `${item.skillId}-${t._id}` : null;
                    const isReqLocal = uniqueId ? requesting[uniqueId] : false;
                    const minGap = t.minGapScore || 1;
                    const maxGap = t.maxGapScore || 5;

                    return (
                      <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg hover:border-teal-300 transition-colors overflow-hidden">
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <BookOpen size={13} className="text-teal-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-800 truncate">{t.title}</p>
                              <p className="text-xs text-slate-500">{t.provider} · {t.type}</p>
                              {t.durationHours && <p className="text-xs text-slate-400">{t.durationHours}h · {t.mode}</p>}

                              {/* Gap range badge */}
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 border border-teal-200 rounded-md text-[10px] font-bold">
                                  <Target size={9} />
                                  Gap Range: {minGap}–{maxGap}
                                </span>
                                {t.improvesBy && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold">
                                    +{t.improvesBy} improvement
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {t._id && showAction && !item.status && (
                            <div className="flex items-center gap-2">
                              {t.status && (
                                <div className="flex flex-col items-end">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${t.status === "Pending" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                    t.status === "Accepted" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                      "bg-red-50 text-red-600 border-red-200"
                                    }`}>
                                    {t.status === "Pending" ? <Clock size={10} /> :
                                      t.status === "Accepted" ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                    {t.status}
                                  </span>
                                  {t.hodReason && (
                                    <span className="text-[9px] text-slate-400 mt-1 max-w-[120px] truncate block" title={t.hodReason}>
                                      {t.hodReason}
                                    </span>
                                  )}
                                </div>
                              )}
                              {!t.status && (
                                <button
                                  onClick={() => !isReqLocal && handleRequest(item.skillId, t._id)}
                                  disabled={isReqLocal}
                                  className="ml-3 flex-shrink-0 px-3 py-1.5 bg-white border-2 border-teal-200 text-teal-600 rounded-md text-xs font-bold hover:bg-teal-50 transition-colors flex items-center gap-1"
                                >
                                  {isReqLocal ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-teal-600 border-t-transparent" />
                                  ) : (
                                    <Send size={10} />
                                  )}
                                  {isReqLocal ? "Sending" : "Request"}
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Why this matches explanation */}
                        <div className="px-3 pb-3">
                          <div className="flex items-start gap-1.5 p-2 bg-white border border-teal-100 rounded-md">
                            <CheckCircle size={11} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-600">
                              <span className="font-semibold text-emerald-700">Perfect match!</span> This training targets gaps of {minGap}–{maxGap}, and your gap is <span className="font-bold">{item.gap}</span>.
                              {t.improvesBy && ` Completing this can improve your level by +${t.improvesBy}.`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* No matching trainings message */}
          {!hasMatchingTrainings && item.trainings?.length > 0 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-semibold mb-1">No trainings match your current gap level</p>
                  <p className="text-amber-700">
                    {item.trainings.length} training{item.trainings.length > 1 ? 's are' : ' is'} available for this skill, but {item.trainings.length > 1 ? 'they target' : 'it targets'} different gap ranges.
                    Your gap of <span className="font-bold">{item.gap}</span> doesn't fall within {item.trainings.length > 1 ? 'their' : 'its'} criteria.
                  </p>
                </div>
              </div>
            </div>
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
              <p className="text-slate-600">Training programs tailored to your specific skill gaps</p>
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
              { title: "Pending Review", value: pendingTotal, icon: Clock, color: "bg-amber-100 text-amber-600", borderColor: "border-amber-200" },
              { title: "Accepted", value: acceptedTotal, icon: CheckCircle, color: "bg-emerald-100 text-emerald-600", borderColor: "border-emerald-200" },
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

                {history.filter(h => h.status === "Accepted").length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center">
                        <CheckCircle className="text-emerald-600" size={16} />
                      </div>
                      <h2 className="text-base font-bold text-slate-900">Approved Courses</h2>
                      <span className="text-xs text-slate-400">({acceptedTotal})</span>
                    </div>
                    <div className="space-y-3">
                      {history.filter(h => h.status === "Accepted").map((item) => renderHistoryItem(item))}
                    </div>
                  </div>
                )}

                {history.filter(h => h.status === "Rejected").length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center">
                        <AlertCircle className="text-red-600" size={16} />
                      </div>
                      <h2 className="text-base font-bold text-slate-900">Rejected Courses</h2>
                      <span className="text-xs text-slate-400">({rejectedTotal})</span>
                    </div>
                    <div className="space-y-3">
                      {history.filter(h => h.status === "Rejected").map((item) => renderHistoryItem(item))}
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