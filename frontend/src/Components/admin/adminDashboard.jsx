import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Users, Wrench, ClipboardList, AlertTriangle, CheckCircle,
  BookOpen, X, AlertCircle as AlertCircleIcon, RefreshCw,
  Target, Award, TrendingUp, BarChart2,
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

      const facultyCount = usersRes.data.filter((u) => u.role === "FACULTY").length;
      const hodCount = usersRes.data.filter((u) => u.role === "HOD").length;

      setStats({
        totalUsers: usersRes.data.length,
        totalSkills: skillsRes.data.length,
        totalAssessments: assessmentsRes.data.length,
        totalSkillGaps: skillGapRes.data.reduce((sum, g) => sum + g.totalGaps, 0),
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
        }))
      );
      const sorted = allGaps.sort((a, b) => b.gapScore - a.gapScore).slice(0, 8);
      setTopSkillGaps(sorted);

      // Category breakdown for chart
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
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-100 text-blue-600 border-blue-200" },
    { title: "Total Skills", value: stats.totalSkills, icon: Wrench, color: "bg-teal-100 text-teal-600 border-teal-200" },
    { title: "Assessments", value: stats.totalAssessments, icon: ClipboardList, color: "bg-purple-100 text-purple-600 border-purple-200" },
    { title: "Skill Gaps", value: stats.totalSkillGaps, icon: AlertTriangle, color: "bg-red-100 text-red-600 border-red-200" },
    { title: "Pending Approvals", value: stats.pendingApprovals, icon: CheckCircle, color: "bg-amber-100 text-amber-600 border-amber-200" },
    { title: "Training Programs", value: stats.totalTraining, icon: BookOpen, color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  ];

  // Chart data
  const userPieData = [
    { name: "Faculty", value: stats.facultyCount, color: "#0ea5e9" },
    { name: "HODs", value: stats.hodCount, color: "#14b8a6" },
  ];

  const gapChartData = topSkillGaps.slice(0, 6).map(g => ({
    skill: g.skill.length > 15 ? g.skill.substring(0, 15) + "..." : g.skill,
    gap: g.gapScore,
  }));

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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
              <p className="text-slate-600">System analytics and performance overview</p>
            </div>
            <div className="text-right">
              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium shadow-sm"
              >
                <RefreshCw size={16} /> Refresh
              </button>
              <p className="text-xs text-slate-500 mt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircleIcon className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError("")} className="text-red-600 hover:text-red-800">
              <X size={18} />
            </button>
          </div>
        )}

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {statCards.map((stat, i) => (
            <div key={i}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} border flex items-center justify-center`}>
                  <stat.icon size={22} />
                </div>
              </div>
              <h3 className="text-sm text-slate-600 font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Charts Row 1 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Skills by Category Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="text-teal-600" size={20} />
                Skills by Category
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Skill Gaps Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-red-600" size={20} />
                Top Skill Gaps
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gapChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis dataKey="skill" type="category" width={120} tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="gap" fill="#ef4444" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Charts Row 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* User Distribution Pie Chart */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Users className="text-blue-600" size={20} />
              User Distribution
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={userPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* System Summary */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Target className="text-teal-600" size={20} />
              System Summary
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-5 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.totalUsers > 0 ? Math.round((stats.totalAssessments / stats.totalUsers) * 100) : 0}%
                </p>
                <p className="text-xs text-slate-600 font-medium">Assessment Rate</p>
              </div>
              <div className="text-center p-5 bg-teal-50 rounded-lg border border-teal-200">
                <p className="text-3xl font-bold text-teal-600 mb-1">{stats.totalSkills}</p>
                <p className="text-xs text-slate-600 font-medium">Total Skills</p>
              </div>
              <div className="text-center p-5 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-3xl font-bold text-amber-600 mb-1">{stats.pendingApprovals}</p>
                <p className="text-xs text-slate-600 font-medium">Pending Review</p>
              </div>
              <div className="text-center p-5 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-3xl font-bold text-emerald-600 mb-1">{stats.totalTraining}</p>
                <p className="text-xs text-slate-600 font-medium">Active Programs</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;