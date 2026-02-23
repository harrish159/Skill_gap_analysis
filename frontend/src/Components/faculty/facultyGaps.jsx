import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  BarChart2,
  AlertTriangle,
  Target,
  Star,
  Filter,
} from "lucide-react";

const FacultyGaps = () => {
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const facultyId = sessionStorage.getItem("userId");

  const fetchGaps = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `http://localhost:3000/api/skillgaps/${facultyId}`
      );
      setGapData(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(
          "No skill gap analysis found. Please complete your assessment first."
        );
      } else {
        setError("Failed to load skill gap data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (facultyId) fetchGaps();
  }, [facultyId]);

  /* ── Helpers ── */
  const getSeverity = (sev) => {
    switch (sev) {
      case "high":
        return {
          label: "Critical",
          badge: "bg-red-100 text-red-700 border border-red-200",
          bar: "bg-gradient-to-r from-red-500 to-red-400",
          dot: "bg-red-500",
          cardBg: "bg-red-50/40",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          gapColor: "text-red-600",
          topBorder: "border-t-2 border-t-red-400",
        };
      case "medium":
        return {
          label: "Moderate",
          badge: "bg-amber-100 text-amber-700 border border-amber-200",
          bar: "bg-gradient-to-r from-amber-500 to-amber-400",
          dot: "bg-amber-500",
          cardBg: "bg-amber-50/40",
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
          gapColor: "text-amber-600",
          topBorder: "border-t-2 border-t-amber-400",
        };
      default:
        return {
          label: "Low",
          badge: "bg-yellow-100 text-yellow-700 border border-yellow-200",
          bar: "bg-gradient-to-r from-yellow-400 to-yellow-300",
          dot: "bg-yellow-400",
          cardBg: "bg-yellow-50/40",
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
          gapColor: "text-yellow-600",
          topBorder: "border-t-2 border-t-yellow-400",
        };
    }
  };

  const renderStars = (value, max = 5) => (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={
            i < value
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }
        />
      ))}
    </div>
  );

  const catIcons = {
    Technical: "💻",
    Research: "🔬",
    Teaching: "📚",
    "Soft Skill": "🤝",
    Other: "📌",
  };

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading skill gaps...</p>
        </div>
      </div>
    );
  }

  /* ── ERROR ── */
  if (error || !gapData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="text-amber-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            No Data Available
          </h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            {error || "No gaps recorded yet."}
          </p>
          <button
            onClick={fetchGaps}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors shadow-sm"
          >
            <RefreshCw size={15} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const { gaps = [], totalGaps } = gapData;
  const highCount = gaps.filter((g) => g.gapSeverity === "high").length;
  const medCount = gaps.filter((g) => g.gapSeverity === "medium").length;
  const lowCount = gaps.filter((g) => g.gapSeverity === "low").length;

  const filtered =
    filter === "Critical"
      ? gaps.filter((g) => g.gapSeverity === "high")
      : filter === "Moderate"
        ? gaps.filter((g) => g.gapSeverity === "medium")
        : filter === "Low"
          ? gaps.filter((g) => g.gapSeverity === "low")
          : gaps;

  const sorted = [...filtered].sort((a, b) => {
    const o = { high: 0, medium: 1, low: 2 };
    return (o[a.gapSeverity] || 2) - (o[b.gapSeverity] || 2);
  });

  /* ── NO GAPS ── */
  if (gaps.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-14 shadow-sm text-center max-w-md w-full">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="text-emerald-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            No Skill Gaps! 🎉
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            You are meeting all required proficiency levels. Keep it up!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ── */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                My Skill Gap Analysis
              </h1>
              <p className="text-slate-600">
                Skills where improvement is recommended
              </p>
            </div>
            <button
              onClick={fetchGaps}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                title: "Total Gaps",
                value: totalGaps,
                icon: BarChart2,
                bg: "bg-blue-600",
                light: "bg-blue-50",
                text: "text-blue-700",
              },
              {
                title: "Critical",
                value: highCount,
                icon: AlertCircle,
                bg: "bg-red-500",
                light: "bg-red-50",
                text: "text-red-700",
              },
              {
                title: "Moderate",
                value: medCount,
                icon: AlertTriangle,
                bg: "bg-amber-500",
                light: "bg-amber-50",
                text: "text-amber-700",
              },
              {
                title: "Low Priority",
                value: lowCount,
                icon: TrendingUp,
                bg: "bg-emerald-500",
                light: "bg-emerald-50",
                text: "text-emerald-700",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 ${stat.light} rounded-lg flex items-center justify-center mb-3`}>
                  <stat.icon className={stat.text} size={20} />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* ── Gap Distribution Bar ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="text-teal-600" size={18} />
                Gap Distribution
              </h2>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {gaps.length} skills need improvement
              </span>
            </div>

            {/* Stacked Bar */}
            <div className="flex w-full rounded-full h-3 overflow-hidden bg-slate-100 mb-4">
              {highCount > 0 && (
                <div
                  className="bg-red-500 h-full transition-all"
                  style={{ width: `${(highCount / gaps.length) * 100}%` }}
                />
              )}
              {medCount > 0 && (
                <div
                  className="bg-amber-400 h-full transition-all"
                  style={{ width: `${(medCount / gaps.length) * 100}%` }}
                />
              )}
              {lowCount > 0 && (
                <div
                  className="bg-yellow-300 h-full transition-all"
                  style={{ width: `${(lowCount / gaps.length) * 100}%` }}
                />
              )}
            </div>

            <div className="flex gap-6 flex-wrap">
              {[
                { label: "Critical", count: highCount, dot: "bg-red-500" },
                { label: "Moderate", count: medCount, dot: "bg-amber-400" },
                { label: "Low", count: lowCount, dot: "bg-yellow-300" },
              ].map(({ label, count, dot }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-slate-600">
                  <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                  <span className="text-slate-500">{label}:</span>
                  <span className="font-bold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Filter Tabs ── */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-500 mr-1">
              <Filter size={14} />
              <span className="text-xs font-semibold uppercase tracking-wide">Filter:</span>
            </div>
            {[
              { label: "All", count: gaps.length },
              { label: "Critical", count: highCount },
              { label: "Moderate", count: medCount },
              { label: "Low", count: lowCount },
            ].map(({ label, count }) => (
              <button
                key={label}
                onClick={() => setFilter(label)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === label
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  }`}
              >
                {label}
                <span className={`ml-2 text-xs ${filter === label ? "text-teal-100" : "text-slate-400"}`}>
                  ({count})
                </span>
              </button>
            ))}
          </div>

          {/* ── Gap Cards ── */}
          {sorted.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
              <div className="bg-slate-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="text-slate-400" size={28} />
              </div>
              <p className="text-slate-600 font-semibold">No gaps match this filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((gap) => {
                const sc = getSeverity(gap.gapSeverity);
                const profPct = Math.min(
                  Math.round((gap.currentRating / gap.requiredRating) * 100),
                  100
                );
                const gapPct = Math.round(
                  (gap.gapScore / gap.requiredRating) * 100
                );
                const cat = gap.skillId?.category || "Other";

                return (
                  <div
                    key={gap._id}
                    className={`bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${sc.topBorder}`}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">

                        {/* Category Icon */}
                        <div className={`w-12 h-12 ${sc.iconBg} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                          {catIcons[cat] || "📌"}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">

                          {/* Title Row */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="text-base font-bold text-slate-900">
                                  {gap.skillId?.name || "Unknown Skill"}
                                </h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.badge}`}>
                                  {sc.label}
                                </span>
                                <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                  {cat}
                                </span>
                              </div>
                            </div>

                            {/* Gap % Badge */}
                            <div className={`flex-shrink-0 text-center px-4 py-2 rounded-xl ${sc.cardBg} border border-slate-200`}>
                              <p className={`text-2xl font-black leading-none ${sc.gapColor}`}>
                                {gapPct}%
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 font-medium">gap</p>
                            </div>
                          </div>

                          {/* Stars Row */}
                          <div className="flex items-center gap-6 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="text-center">
                              <p className="text-xs text-slate-500 font-medium mb-1">Current</p>
                              <div className="flex items-center gap-1.5">
                                {renderStars(gap.currentRating)}
                                <span className="text-xs font-bold text-slate-700">
                                  {gap.currentRating}/5
                                </span>
                              </div>
                            </div>

                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1 h-px bg-slate-200"></div>
                              <span className={`text-sm font-black ${sc.gapColor} bg-white border border-slate-200 px-2 py-1 rounded-lg`}>
                                +{gap.gapScore}
                              </span>
                              <div className="flex-1 h-px bg-slate-200"></div>
                            </div>

                            <div className="text-center">
                              <p className="text-xs text-slate-500 font-medium mb-1">Required</p>
                              <div className="flex items-center gap-1.5">
                                {renderStars(gap.requiredRating)}
                                <span className="text-xs font-bold text-slate-700">
                                  {gap.requiredRating}/5
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                              <span>Proficiency toward target</span>
                              <span className="font-bold text-slate-700">{profPct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                              <div
                                className={`${sc.bar} h-2.5 rounded-full transition-all duration-700`}
                                style={{ width: `${profPct}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                              <span>Current: {gap.currentRating}</span>
                              <span>Target: {gap.requiredRating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyGaps;