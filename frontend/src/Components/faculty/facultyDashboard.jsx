import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  BookOpen,
  CheckSquare,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Zap,
  Target,
  ArrowRight,
  User,
  Clock,
  Award,
  TrendingUp,
  X,
  Activity,
} from "lucide-react";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalGaps: 0,
    highGaps: 0,
    acceptedTrainings: 0,
    pendingTrainings: 0,
    avgProficiency: 0,
    criticalGapSkills: [],
  });

  const facultyId = sessionStorage.getItem("userId");

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    // Parse stored user
    try {
      const stored = sessionStorage.getItem("user");
      if (stored) setUserData(JSON.parse(stored));
    } catch { }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [gapsRes, trainingRes, assessRes] = await Promise.allSettled([
          axios.get(`http://localhost:3000/api/skillgaps/${facultyId}`),
          axios.get(`http://localhost:3000/api/training/recommend/${facultyId}`),
          axios.get(`http://localhost:3000/api/assessments/faculty/${facultyId}`),
        ]);

        const gaps = gapsRes.status === "fulfilled" ? (gapsRes.value.data.gaps || []) : [];
        const trainings = trainingRes.status === "fulfilled" ? (trainingRes.value.data || []) : [];
        const assessments = assessRes.status === "fulfilled" ? (assessRes.value.data.skillRatings || []) : [];

        const avgProf = assessments.length > 0
          ? (assessments.reduce((a, c) => a + (c.hodRating || 0), 0) / assessments.length).toFixed(1)
          : 0;

        setStats({
          totalGaps: gaps.length,
          highGaps: gaps.filter(g => g.gapSeverity === "high").length,
          acceptedTrainings: trainings.filter(t => t.status === "Accepted").length,
          pendingTrainings: trainings.filter(t => t.status === "Pending").length,
          avgProficiency: avgProf,
          criticalGapSkills: gaps.filter(g => g.gapSeverity === "high").slice(0, 3).map(g => g.skillId?.name || "Unknown"),
        });
        setError("");
      } catch {
        setError("Failed to load some dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    if (facultyId) fetchAllData();
  }, [facultyId]);

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Avg Proficiency",
      value: `${stats.avgProficiency}/5`,
      icon: Target,
      color: "bg-blue-100 text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Skill Gaps",
      value: stats.totalGaps,
      icon: AlertCircle,
      color: "bg-red-100 text-red-600",
      borderColor: "border-red-200",
      badge: stats.highGaps > 0 ? `${stats.highGaps} Critical` : null,
      badgeCls: "bg-red-50 text-red-700 border-red-200",
    },
    {
      title: "Pending Review",
      value: stats.pendingTrainings,
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
      borderColor: "border-amber-200",
    },
    {
      title: "Trainings Accepted",
      value: stats.acceptedTrainings,
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-600",
      borderColor: "border-emerald-200",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {getTimeGreeting()}, {userData?.name || "Faculty Member"}
            </h1>
            <p className="text-slate-600">
              Overview of your skill development progress
            </p>
          </div>
          {/* User badge */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm flex-shrink-0">
            <div className="w-10 h-10 bg-teal-100 border border-teal-200 rounded-lg flex items-center justify-center">
              <User className="text-teal-600" size={20} />
            </div>
            <div>
              <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider mb-0.5">{userData?.departmentName || "Faculty Member"}</p>
              <p className="text-sm font-bold text-slate-900">{userData?.name || "Faculty"}</p>
            </div>
          </div>
        </div>

        {/* ── Error Alert ── */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError("")} className="ml-auto text-red-600 hover:text-red-800">
              <X size={18} />
            </button>
          </div>
        )}

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {dashboardStats.map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} border ${stat.borderColor} flex items-center justify-center`}>
                  <stat.icon size={24} />
                </div>
                {stat.badge && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${stat.badgeCls}`}>
                    {stat.badge}
                  </span>
                )}
              </div>
              <h3 className="text-sm text-slate-600 font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Focus Areas */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Zap className="text-teal-600" size={22} />
                Critical Focus Areas
              </h2>
              <button
                onClick={() => navigate("/faculty/gaps")}
                className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                View All <ArrowRight size={15} />
              </button>
            </div>

            <div className="space-y-4">
              {stats.criticalGapSkills.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="text-emerald-600" size={24} />
                  </div>
                  <p className="text-slate-900 font-bold mb-1">No Critical Gaps!</p>
                  <p className="text-slate-500 text-sm">You're meeting all priority skill benchmarks.</p>
                </div>
              ) : (
                stats.criticalGapSkills.map((skill, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="text-red-600" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900">{skill}</p>
                      <p className="text-sm text-slate-600">Critical skill gap identified</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 flex-shrink-0">
                      Critical
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <LayoutDashboard className="text-teal-600" size={22} />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/faculty/assessment")}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all hover:shadow-sm text-left group"
              >
                <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckSquare className="text-blue-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Take Assessment</p>
                  <p className="text-xs text-slate-600">Complete your skill proficiency quiz</p>
                </div>
                <ArrowRight size={16} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => navigate("/faculty/gaps")}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-all hover:shadow-sm text-left group"
              >
                <div className="w-10 h-10 bg-teal-100 border border-teal-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="text-teal-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">View Skill Gaps</p>
                  <p className="text-xs text-slate-600">See where improvement is needed</p>
                </div>
                <ArrowRight size={16} className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => navigate("/faculty/training")}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all hover:shadow-sm text-left group"
              >
                <div className="w-10 h-10 bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="text-amber-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Recommended Training</p>
                  <p className="text-xs text-slate-600">Browse courses curated for you</p>
                </div>
                <ArrowRight size={16} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>


            </div>
          </div>
        </div>

        {/* ── Performance Overview ── */}
        <div className="mt-6 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-teal-600" size={20} />
            Performance Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-2xl font-bold text-slate-900 mb-1">{stats.avgProficiency}/5</p>
              <p className="text-sm text-slate-600">Avg Proficiency</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-2xl font-bold text-slate-900 mb-1">{stats.totalGaps}</p>
              <p className="text-sm text-slate-600">Skill Gaps</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-2xl font-bold text-slate-900 mb-1">{stats.acceptedTrainings}</p>
              <p className="text-sm text-slate-600">Trainings Accepted</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-2xl font-bold text-slate-900 mb-1">{stats.pendingTrainings}</p>
              <p className="text-sm text-slate-600">Awaiting Review</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboard;