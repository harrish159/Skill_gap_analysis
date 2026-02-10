import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

const Analytics = () => {
  const [skillGaps, setSkillGaps] = useState([]);
  const [stats, setStats] = useState({
    avgCoverage: 0,
    criticalGaps: 0,
    inProgressTraining: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch skill gaps
      const gapsRes = await axios.get("http://localhost:3000/api/skillgaps");

      // Aggregate gaps by skill
      const skillGapMap = {};
      gapsRes.data.forEach((facultyGap) => {
        facultyGap.gaps.forEach((gap) => {
          if (!skillGapMap[gap.skillId]) {
            skillGapMap[gap.skillId] = {
              skillId: gap.skillId,
              skillName: gap.skillName || "Unknown Skill",
              totalGap: 0,
              count: 0,
              severity: gap.gapSeverity,
            };
          }
          skillGapMap[gap.skillId].totalGap += gap.gapScore;
          skillGapMap[gap.skillId].count += 1;
        });
      });

      // Convert to array and calculate averages
      const aggregatedGaps = Object.values(skillGapMap)
        .map((gap) => ({
          skill: gap.skillName,
          gap: Math.round((gap.totalGap / gap.count) * 20), // Convert to percentage
          trend:
            gap.severity === "high"
              ? "up"
              : gap.severity === "medium"
                ? "stable"
                : "down",
        }))
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 5);

      setSkillGaps(aggregatedGaps);

      // Calculate stats
      const criticalGaps = gapsRes.data.reduce(
        (sum, gap) =>
          sum + gap.gaps.filter((g) => g.gapSeverity === "high").length,
        0,
      );

      const trainingRes = await axios.get("http://localhost:3000/api/training");
      const activeTraining = trainingRes.data.filter((t) => t.isActive).length;

      const assessmentRes = await axios.get(
        "http://localhost:3000/api/assessments",
      );
      const totalAssessments = assessmentRes.data.length;
      const completedAssessments = assessmentRes.data.filter(
        (a) => a.status === "submitted" || a.status === "reviewed",
      ).length;

      setStats({
        avgCoverage:
          totalAssessments > 0
            ? Math.round((completedAssessments / totalAssessments) * 100)
            : 0,
        criticalGaps: criticalGaps,
        inProgressTraining: activeTraining,
        completionRate:
          totalAssessments > 0
            ? Math.round((completedAssessments / totalAssessments) * 100)
            : 0,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const departmentStats = [
    {
      label: "Avg Skill Coverage",
      value: `${stats.avgCoverage}%`,
      change: "+5%",
      positive: true,
    },
    {
      label: "Critical Gaps",
      value: stats.criticalGaps,
      change: "-2",
      positive: true,
    },
    {
      label: "In-Progress Training",
      value: stats.inProgressTraining,
      change: "+3",
      positive: true,
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      change: "+8%",
      positive: true,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="text-teal-500" size={28} />
          Skill Gap Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track and analyze department skill gaps
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {departmentStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-slate-200 rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 font-semibold uppercase">
                {stat.label}
              </p>
              <span
                className={`text-xs font-medium ${
                  stat.positive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Skill Gap Analysis */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Top Skill Gaps
        </h2>
        {skillGaps.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No skill gaps data available
          </div>
        ) : (
          <div className="space-y-4">
            {skillGaps.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700">
                      {item.skill}
                    </span>
                    {item.trend === "up" ? (
                      <TrendingUp className="text-red-500" size={16} />
                    ) : item.trend === "down" ? (
                      <TrendingDown className="text-emerald-500" size={16} />
                    ) : (
                      <AlertTriangle className="text-amber-500" size={16} />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {item.gap}% Gap
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.gap > 60
                        ? "bg-red-500"
                        : item.gap > 40
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${item.gap}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
