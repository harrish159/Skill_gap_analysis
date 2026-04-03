import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  ArrowUp,
  ArrowDown,
  X,
  LayoutDashboard,
} from "lucide-react";

const HodDashboard = () => {
  const [stats, setStats] = useState({
    totalFaculty: 0,
    activeTraining: 0,
    skillGaps: 0,
    completedAssessments: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);

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

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch faculty count
      const facultyRes = await axios.get("https://skill-gap-analysis-aetw.onrender.com/api/allusers");
      const facultyCount = facultyRes.data.filter(
        (u) => u.role === "FACULTY",
      ).length;

      // Fetch training programs
      const trainingRes = await axios.get("https://skill-gap-analysis-aetw.onrender.com/api/training");
      const activeTraining = trainingRes.data.filter((t) => t.isActive).length;

      // Fetch skill gaps
      const gapsRes = await axios.get("https://skill-gap-analysis-aetw.onrender.com/api/skillgaps");
      const totalGaps = gapsRes.data.reduce(
        (sum, gap) => sum + gap.totalGaps,
        0,
      );

      // Fetch assessments
      const assessmentsRes = await axios.get(
        "https://skill-gap-analysis-aetw.onrender.com/api/assessments",
      );
      const completedAssessments = assessmentsRes.data.filter(
        (a) => a.status === "submitted" || a.status === "reviewed",
      ).length;

      setStats({
        totalFaculty: facultyCount,
        activeTraining: activeTraining,
        skillGaps: totalGaps,
        completedAssessments: completedAssessments,
      });

      // Mock recent activities (replace with actual API)
      setRecentActivities([
        {
          name: "Faculty Assessment",
          action: "Completed self-assessment",
          time: "2 hours ago",
          type: "assessment",
        },
        {
          name: "Training Program",
          action: "New course added",
          time: "5 hours ago",
          type: "training",
        },
        {
          name: "Skill Mapping",
          action: "Updated skill requirements",
          time: "1 day ago",
          type: "skill",
        },
        {
          name: "Gap Analysis",
          action: "Generated new report",
          time: "2 days ago",
          type: "analysis",
        },
      ]);

      setError("");
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 403 && error.response?.data?.missingDepartment) {
        setError(error.response.data.message);
      } else {
        setError("Failed to load dashboard data. Please ensure you are logged in and have a department assigned.");
      }
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    {
      title: "Total Faculty",
      value: stats.totalFaculty,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      borderColor: "border-blue-200",
      change: "+5%",
      isPositive: true,
    },
    {
      title: "Active Training",
      value: stats.activeTraining,
      icon: BookOpen,
      color: "bg-teal-100 text-teal-600",
      borderColor: "border-teal-200",
      change: "+2",
      isPositive: true,
    },
    {
      title: "Skill Gaps Identified",
      value: stats.skillGaps,
      icon: AlertCircle,
      color: "bg-amber-100 text-amber-600",
      borderColor: "border-amber-200",
      change: "-3",
      isPositive: true,
    },
    {
      title: "Completed Assessments",
      value: stats.completedAssessments,
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-600",
      borderColor: "border-emerald-200",
      change: "+12%",
      isPositive: true,
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "assessment":
        return "📝";
      case "training":
        return "📚";
      case "skill":
        return "⚡";
      case "analysis":
        return "📊";
      default:
        return "📌";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {getTimeGreeting()}, {userData?.name || "HOD"}
            </h1>
            <p className="text-slate-600">
              Overview of department skill development and faculty progress
            </p>
          </div>
          {/* User badge */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm flex-shrink-0">
            <div className="w-10 h-10 bg-teal-100 border border-teal-200 rounded-lg flex items-center justify-center">
              <Users className="text-teal-600" size={20} />
            </div>
            <div>
              <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider mb-0.5">{userData?.departmentName || "Head of Department"}</p>
              <p className="text-sm font-bold text-slate-900">{userData?.name || "HOD"}</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle
              className="text-red-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {dashboardStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg ${stat.color} border ${stat.borderColor} flex items-center justify-center`}
                >
                  <stat.icon size={24} />
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${stat.isPositive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                >
                  {stat.isPositive ? (
                    <ArrowUp size={12} />
                  ) : (
                    <ArrowDown size={12} />
                  )}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-sm text-slate-600 font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="text-teal-600" size={22} />
                Recent Activities
              </h2>
              <Clock className="text-slate-400" size={20} />
            </div>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="text-slate-400" size={24} />
                  </div>
                  <p className="text-slate-600 text-sm">No recent activities</p>
                </div>
              ) : (
                recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                  >
                    <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0 text-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900">
                        {activity.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {activity.action}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {activity.time}
                      </p>
                    </div>
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
              <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all hover:shadow-sm text-left group">
                <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    Add New Faculty
                  </p>
                  <p className="text-xs text-slate-600">
                    Register new faculty member
                  </p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-all hover:shadow-sm text-left group">
                <div className="w-10 h-10 bg-teal-100 border border-teal-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="text-teal-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    Create Training Program
                  </p>
                  <p className="text-xs text-slate-600">
                    Launch new skill development course
                  </p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all hover:shadow-sm text-left group">
                <div className="w-10 h-10 bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="text-amber-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    View Analytics
                  </p>
                  <p className="text-xs text-slate-600">
                    Check department performance
                  </p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all hover:shadow-sm text-left group">
                <div className="w-10 h-10 bg-purple-100 border border-purple-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="text-purple-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    Review Assessments
                  </p>
                  <p className="text-xs text-slate-600">
                    Evaluate faculty submissions
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-6 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Performance Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-2xl font-bold text-slate-900 mb-1">
                {stats.totalFaculty > 0
                  ? Math.round(
                    (stats.completedAssessments / stats.totalFaculty) * 100,
                  )
                  : 0}
                %
              </p>
              <p className="text-sm text-slate-600">Assessment Completion</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-2xl font-bold text-slate-900 mb-1">
                {stats.activeTraining}
              </p>
              <p className="text-sm text-slate-600">Active Programs</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-2xl font-bold text-slate-900 mb-1">
                {stats.skillGaps}
              </p>
              <p className="text-sm text-slate-600">Areas for Improvement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;
