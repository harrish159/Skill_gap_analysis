import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Wrench,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BookOpen,
  X,
  AlertCircle as AlertCircleIcon,
  RefreshCw,
  Target,
  Award,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSkills: 0,
    totalAssessments: 0,
    totalSkillGaps: 0,
    pendingApprovals: 0,
    totalTraining: 0,
    facultyCount: 0,
    hodCount: 0,
  });
  const [topSkillGaps, setTopSkillGaps] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        usersRes,
        skillsRes,
        assessmentsRes,
        skillGapRes,
        approvalRes,
        trainingRes,
      ] = await Promise.all([
        axios.get("http://localhost:3000/api/allusers"),
        axios.get("http://localhost:3000/api/skills"),
        axios.get("http://localhost:3000/api/assessments"),
        axios.get("http://localhost:3000/api/skillgaps"),
        axios.get("http://localhost:3000/api/approval/pending"),
        axios.get("http://localhost:3000/api/training"),
      ]);

      const facultyCount = usersRes.data.filter(
        (u) => u.role === "FACULTY",
      ).length;
      const hodCount = usersRes.data.filter((u) => u.role === "HOD").length;

      setStats({
        totalUsers: usersRes.data.length,
        totalSkills: skillsRes.data.length,
        totalAssessments: assessmentsRes.data.length,
        totalSkillGaps: skillGapRes.data.reduce(
          (sum, g) => sum + g.totalGaps,
          0,
        ),
        pendingApprovals: approvalRes.data.length,
        totalTraining: trainingRes.data.length,
        facultyCount,
        hodCount,
      });

      // Top skill gaps
      const allGaps = skillGapRes.data.flatMap((record) =>
        record.gaps.map((gap) => ({
          skill: gap.skillId?.name || "Unknown",
          gapScore: gap.gapScore,
          faculty: record.facultyId?.name || "Unknown",
          severity: gap.gapSeverity || "medium",
        })),
      );
      const sorted = allGaps
        .sort((a, b) => b.gapScore - a.gapScore)
        .slice(0, 8);
      setTopSkillGaps(sorted);

      // Category breakdown
      const categories = ["Technical", "Research", "Teaching", "Soft Skill"];
      const breakdown = categories.map((cat) => ({
        name: cat,
        count: skillsRes.data.filter((s) => s.category === cat).length,
      }));
      setCategoryBreakdown(breakdown);

      setError("");
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-100 text-blue-600 border-blue-200",
    },
    {
      title: "Total Skills",
      value: stats.totalSkills,
      icon: Wrench,
      color: "bg-teal-100 text-teal-600 border-teal-200",
    },
    {
      title: "Assessments",
      value: stats.totalAssessments,
      icon: ClipboardList,
      color: "bg-purple-100 text-purple-600 border-purple-200",
    },
    {
      title: "Skill Gaps",
      value: stats.totalSkillGaps,
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600 border-red-200",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: CheckCircle,
      color: "bg-amber-100 text-amber-600 border-amber-200",
    },
    {
      title: "Training Programs",
      value: stats.totalTraining,
      icon: BookOpen,
      color: "bg-emerald-100 text-emerald-600 border-emerald-200",
    },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      default:
        return "bg-emerald-500";
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
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-slate-600">
                Overview of system analytics and activity
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium shadow-sm"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <p className="text-xs text-slate-500 mt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircleIcon
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-teal-300 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg ${stat.color} border flex items-center justify-center`}
                >
                  <stat.icon size={24} />
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium mb-1">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Skill Gaps */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-red-600" size={22} />
                Top Skill Gaps
              </h2>
              <AlertTriangle className="text-red-400" size={20} />
            </div>
            <div className="space-y-3">
              {topSkillGaps.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="text-slate-400" size={24} />
                  </div>
                  <p className="text-slate-600 text-sm">No skill gaps found</p>
                </div>
              ) : (
                topSkillGaps.map((gap, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {gap.skill}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {gap.faculty}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="text-lg font-bold text-red-600">
                        -{gap.gapScore}
                      </span>
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div
                          className={`${getSeverityColor(gap.severity)} h-2 rounded-full transition-all`}
                          style={{ width: `${(gap.gapScore / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Skills by Category */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Target className="text-teal-600" size={22} />
                Skills by Category
              </h2>
              <Wrench className="text-teal-400" size={20} />
            </div>
            <div className="space-y-4">
              {categoryBreakdown.map((cat, index) => {
                const colors = [
                  "bg-blue-500",
                  "bg-purple-500",
                  "bg-teal-500",
                  "bg-amber-500",
                ];
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-700">
                        {cat.name}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {cat.count}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className={`${colors[index]} h-3 rounded-full transition-all`}
                        style={{
                          width: `${(cat.count / stats.totalSkills) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Breakdown */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Users className="text-blue-600" size={22} />
              User Breakdown
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-5 bg-blue-50 border border-blue-200 rounded-lg">
                <Users className="text-blue-600 mx-auto mb-2" size={28} />
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.facultyCount}
                </p>
                <p className="text-sm text-slate-600 font-medium">
                  Faculty Members
                </p>
              </div>
              <div className="text-center p-5 bg-teal-50 border border-teal-200 rounded-lg">
                <Award className="text-teal-600 mx-auto mb-2" size={28} />
                <p className="text-3xl font-bold text-teal-600 mb-1">
                  {stats.hodCount}
                </p>
                <p className="text-sm text-slate-600 font-medium">HODs</p>
              </div>
            </div>
          </div>

          {/* System Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <ClipboardList className="text-teal-600" size={22} />
              System Summary
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-5 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.totalUsers > 0
                    ? Math.round(
                        (stats.totalAssessments / stats.totalUsers) * 100,
                      )
                    : 0}
                  %
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  Assessment Completion
                </p>
              </div>
              <div className="text-center p-5 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-3xl font-bold text-teal-600 mb-1">
                  {stats.totalSkills}
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  Available Skills
                </p>
              </div>
              <div className="text-center p-5 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-3xl font-bold text-amber-600 mb-1">
                  {stats.pendingApprovals}
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  Awaiting Review
                </p>
              </div>
              <div className="text-center p-5 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-3xl font-bold text-emerald-600 mb-1">
                  {stats.totalTraining}
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  Active Programs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
