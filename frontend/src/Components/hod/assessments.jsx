import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ClipboardList,
  User,
  Star,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  const fetchAllAssessments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/assessments");
      setAssessments(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAssessments();
  }, []);

  const toggleRow = (assessmentId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [assessmentId]: !prev[assessmentId],
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "reviewed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "draft":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading assessments...</p>
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
            Assessments Overview
          </h1>
          <p className="text-slate-600">
            View skill assessments submitted by faculty
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Total Assessments</div>
            <div className="text-3xl font-bold text-slate-900">
              {assessments.length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Submitted</div>
            <div className="text-3xl font-bold text-emerald-600">
              {assessments.filter((a) => a.status === "submitted").length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">
              Total Skills Rated
            </div>
            <div className="text-3xl font-bold text-teal-600">
              {assessments.reduce(
                (sum, a) => sum + (a.skillRatings?.length || 0),
                0,
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {assessments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No assessments yet
              </h3>
              <p className="text-slate-600">
                Assessment submissions will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Skills Assessed
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Submitted Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {assessments.map((assessment) => (
                    <React.Fragment key={assessment._id}>
                      {/* Main Row */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        {/* Faculty */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 border border-teal-200 rounded-lg flex items-center justify-center">
                              <User size={18} className="text-teal-600" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {assessment.facultyId?.name || "N/A"}
                              </div>
                              <div className="text-xs text-slate-500">
                                {assessment.facultyId?.email || ""}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Skills Count */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-teal-600">
                              {assessment.skillRatings?.length || 0}
                            </span>
                            <span className="text-sm text-slate-600">
                              {assessment.skillRatings?.length === 1
                                ? "skill"
                                : "skills"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                              assessment.status,
                            )}`}
                          >
                            {assessment.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 font-medium">
                            {assessment.submittedAt
                              ? new Date(
                                  assessment.submittedAt,
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "-"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {assessment.submittedAt
                              ? new Date(
                                  assessment.submittedAt,
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </div>
                        </td>

                        {/* Expand Button */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleRow(assessment._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 rounded-lg transition-colors text-sm font-medium"
                          >
                            {expandedRows[assessment._id] ? (
                              <>
                                Hide Details
                                <ChevronUp size={16} />
                              </>
                            ) : (
                              <>
                                View Details
                                <ChevronDown size={16} />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row - Skill Ratings */}
                      {expandedRows[assessment._id] && (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 bg-slate-50">
                            <div className="space-y-2">
                              <h4 className="text-sm font-bold text-slate-900 mb-3">
                                Skill Ratings:
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {assessment.skillRatings?.map((rating) => (
                                  <div
                                    key={rating._id}
                                    className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between"
                                  >
                                    <div className="flex-1">
                                      <div className="font-semibold text-slate-900 mb-1">
                                        {rating.skillId?.name ||
                                          "Unknown Skill"}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        {rating.skillId?.category || "N/A"}
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-teal-600">
                                          {rating.selfRating}
                                        </span>
                                        <span className="text-sm text-slate-500">
                                          / 5
                                        </span>
                                      </div>
                                      {renderStars(rating.selfRating)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assessments;
