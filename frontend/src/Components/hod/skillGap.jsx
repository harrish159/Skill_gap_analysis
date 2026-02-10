import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  User,
  BookOpen,
  X,
  AlertCircle,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const SkillGapDashboard = () => {
  const [skillGaps, setSkillGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collapsedCards, setCollapsedCards] = useState({});

  const fetchSkillGaps = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/skillgaps");
      setSkillGaps(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load skill gaps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillGaps();
  }, []);

  const toggleCard = (id) => {
    setCollapsedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const severityConfig = (severity) => {
    switch (severity) {
      case "high":
        return {
          badge: "bg-red-100 text-red-700 border-red-200",
          bar: "bg-red-500",
          text: "text-red-600",
        };
      case "medium":
        return {
          badge: "bg-amber-100 text-amber-700 border-amber-200",
          bar: "bg-amber-500",
          text: "text-amber-600",
        };
      default:
        return {
          badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
          bar: "bg-emerald-500",
          text: "text-emerald-600",
        };
    }
  };

  const totalGapsAll = skillGaps.reduce((sum, g) => sum + g.totalGaps, 0);
  const highSeverityCount = skillGaps.reduce(
    (sum, g) => sum + g.gaps.filter((gap) => gap.gapSeverity === "high").length,
    0,
  );
  const mediumSeverityCount = skillGaps.reduce(
    (sum, g) =>
      sum + g.gaps.filter((gap) => gap.gapSeverity === "medium").length,
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading skill gaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Faculty Skill Gap Overview
          </h1>
          <p className="text-slate-600">
            Skill gaps identified from faculty assessments
          </p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Faculty with Gaps</div>
            <div className="text-3xl font-bold text-slate-900">
              {skillGaps.length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Total Gaps</div>
            <div className="text-3xl font-bold text-red-600">
              {totalGapsAll}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">High Severity</div>
            <div className="text-3xl font-bold text-amber-600">
              {highSeverityCount}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Medium Severity</div>
            <div className="text-3xl font-bold text-yellow-600">
              {mediumSeverityCount}
            </div>
          </div>
        </div>

        {/* Skill Gap Cards */}
        {skillGaps.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No skill gaps found
            </h3>
            <p className="text-slate-600">
              All faculty meet the required skill levels
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {skillGaps.map((gapRecord) => (
              <div
                key={gapRecord._id}
                className="bg-white border border-slate-200 rounded-lg shadow-sm hover:border-teal-300 hover:shadow-md transition-all duration-200"
              >
                {/* Faculty Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
                      <User className="text-teal-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {gapRecord.facultyId?.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {gapRecord.facultyId?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">
                        Total Gaps:
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        {gapRecord.totalGaps}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleCard(gapRecord._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-colors text-sm font-medium"
                    >
                      {collapsedCards[gapRecord._id] ? (
                        <>
                          Show <ChevronDown size={16} />
                        </>
                      ) : (
                        <>
                          Hide <ChevronUp size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Gap Table */}
                {!collapsedCards[gapRecord._id] && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Skill
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Required
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Current
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Gap
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Progress
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Severity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {gapRecord.gaps.map((gap, index) => {
                          const config = severityConfig(gap.gapSeverity);
                          const progressPercent = Math.round(
                            (gap.currentRating / gap.requiredRating) * 100,
                          );
                          return (
                            <tr
                              key={index}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              {/* Skill */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                                    <BookOpen
                                      size={14}
                                      className="text-blue-600"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-900">
                                      {gap.skillId?.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {gap.skillId?.category}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Required */}
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700">
                                  {gap.requiredRating}
                                </span>
                              </td>

                              {/* Current */}
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold border ${
                                    gap.currentRating >= gap.requiredRating
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-red-50 text-red-700 border-red-200"
                                  }`}
                                >
                                  {gap.currentRating}
                                </span>
                              </td>

                              {/* Gap Score */}
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`font-bold text-lg ${config.text}`}
                                >
                                  -{gap.gapScore}
                                </span>
                              </td>

                              {/* Progress Bar */}
                              <td className="px-6 py-4">
                                <div className="w-32 mx-auto">
                                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>{progressPercent}%</span>
                                    <span>100%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200">
                                    <div
                                      className={`${config.bar} h-2 rounded-full transition-all`}
                                      style={{
                                        width: `${Math.min(progressPercent, 100)}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* Severity Badge */}
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`inline-flex px-3 py-1 rounded-md text-xs font-semibold border ${config.badge}`}
                                >
                                  {gap.gapSeverity.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapDashboard;
