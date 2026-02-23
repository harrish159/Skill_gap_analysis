import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Filter,
  GraduationCap,
} from "lucide-react";
import axios from "axios";

const Approval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  const [actionModal, setActionModal] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  /* ============ FETCH ALL ============ */
  const fetchApproval = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/api/approval", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(res.data);
      setError("");
    } catch (error) {
      console.error("Error fetching approval requests", error);
      if (error.response?.status === 403 && error.response?.data?.missingDepartment) {
        setError(error.response.data.message);
      } else {
        setError("Failed to load approval requests");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApproval();
  }, []);

  /* ============ UPDATE STATUS ============ */
  const handleStatusUpdate = async () => {
    if (!actionModal) return;
    try {
      setSubmitting(true);
      const token = sessionStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/approval/${actionModal.id}`,
        {
          status: actionModal.type,
          reason: reason || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequests((prev) =>
        prev.map((r) =>
          r._id === actionModal.id
            ? { ...r, status: actionModal.type, reason: reason || "" }
            : r,
        ),
      );
      setActionModal(null);
      setReason("");
    } catch (err) {
      console.error("Error updating approval request:", err);
      setError("Failed to update request status");
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (id, type) => {
    setActionModal({ id, type });
    setReason("");
  };

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  /* ============ FILTER ============ */
  const filters = ["All", "Pending", "Accepted", "Rejected"];
  const filteredRequests =
    activeFilter === "All"
      ? requests
      : requests.filter((r) => r.status === activeFilter);

  /* ============ STATUS CONFIG ============ */
  const statusConfig = (status) => {
    switch (status) {
      case "Accepted":
        return {
          badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
          icon: <CheckCircle size={14} />,
          leftBorder: "border-l-4 border-l-emerald-500",
        };
      case "Rejected":
        return {
          badge: "bg-red-50 text-red-700 border border-red-200",
          icon: <XCircle size={14} />,
          leftBorder: "border-l-4 border-l-red-500",
        };
      default:
        return {
          badge: "bg-amber-50 text-amber-700 border border-amber-200",
          icon: <Clock size={14} />,
          leftBorder: "border-l-4 border-l-amber-400",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Loading approval requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Approval Requests
          </h1>
          <p className="text-slate-600">
            Review and respond to faculty training requests
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle
              className="text-red-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="text-sm font-medium text-slate-600 mb-1">Total Requests</div>
            <div className="text-3xl font-bold text-slate-900">
              {requests.length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="text-sm font-medium text-slate-600 mb-1">Pending</div>
            <div className="text-3xl font-bold text-amber-600">
              {requests.filter((r) => r.status === "Pending").length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="text-sm font-medium text-slate-600 mb-1">Accepted</div>
            <div className="text-3xl font-bold text-emerald-600">
              {requests.filter((r) => r.status === "Accepted").length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="text-sm font-medium text-slate-600 mb-1">Rejected</div>
            <div className="text-3xl font-bold text-red-600">
              {requests.filter((r) => r.status === "Rejected").length}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter size={18} />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === f
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
            >
              {f}
              <span className={`ml-2 ${activeFilter === f ? "text-teal-100" : "text-slate-500"}`}>
                {f === "All"
                  ? requests.length
                  : requests.filter((r) => r.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-slate-400" size={36} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No requests found
            </h3>
            <p className="text-slate-600">
              {activeFilter === "All"
                ? "There are no approval requests at the moment"
                : `No ${activeFilter.toLowerCase()} requests to display`}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredRequests.map((request) => {
              const sc = statusConfig(request.status);
              const initials = request.facultyId?.name
                ? request.facultyId.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
                : "??";

              return (
                <div
                  key={request._id}
                  className={`bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-all duration-200 ${sc.leftBorder}`}
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-teal-700 font-bold text-base">
                          {initials}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {request.facultyId?.name || "Unknown Faculty"}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${sc.badge}`}
                          >
                            {sc.icon}
                            {request.status}
                          </span>
                        </div>

                        {request.facultyId?.department && (
                          <p className="text-sm text-slate-500 mb-3">
                            {request.facultyId.department}
                          </p>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <BookOpen size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium text-slate-700">Course:</span>{" "}
                              <span className="text-sm text-slate-900 font-semibold">
                                {request.requestedCourse}
                              </span>
                              {request.trainingId && (
                                <div className="mt-1 flex flex-wrap gap-2">
                                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                    {request.trainingId.provider}
                                  </span>
                                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                                    {request.trainingId.type}
                                  </span>
                                  {request.trainingId.durationHours && (
                                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-teal-50 text-teal-600 rounded">
                                      {request.trainingId.durationHours}h · {request.trainingId.mode}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {request.requestedWorkshop && (
                            <div className="flex items-start gap-2">
                              <GraduationCap size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-sm font-medium text-slate-700">Workshop:</span>{" "}
                                <span className="text-sm text-slate-900 font-semibold">
                                  {request.requestedWorkshop}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-400" />
                            <span className="text-xs text-slate-500">
                              Requested on{" "}
                              {new Date(request.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {request.status === "Pending" && (
                          <>
                            <button
                              onClick={() => openModal(request._id, "Accepted")}
                              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-semibold"
                            >
                              <CheckCircle size={16} />
                              Approve
                            </button>
                            <button
                              onClick={() => openModal(request._id, "Rejected")}
                              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Skills Toggle */}
                    {request.requestedSkills?.length > 0 && (
                      <div className="mt-4">
                        <button
                          onClick={() => toggleExpand(request._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
                        >
                          <BookOpen size={16} />
                          View Skills ({request.requestedSkills.length})
                          {expandedCards[request._id] ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Status Banner */}
                  {request.status === "Accepted" && (
                    <div className="mx-6 mb-6 flex items-start gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-emerald-900">
                          Request Approved
                        </p>
                        {request.reason ? (
                          <p className="text-sm text-emerald-700 mt-1">
                            <span className="font-semibold">HOD Note:</span> {request.reason}
                          </p>
                        ) : (
                          <p className="text-sm text-emerald-600 mt-1 italic">
                            No additional comments provided
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {request.status === "Rejected" && (
                    <div className="mx-6 mb-6 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                      <XCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-900">
                          Request Rejected
                        </p>
                        {request.reason ? (
                          <p className="text-sm text-red-700 mt-1">
                            <span className="font-semibold">Reason:</span> {request.reason}
                          </p>
                        ) : (
                          <p className="text-sm text-red-600 mt-1 italic">
                            No reason provided
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expanded Skills */}
                  {expandedCards[request._id] && request.requestedSkills?.length > 0 && (
                    <div className="px-6 pb-6 border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                        Requested Skills
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {request.requestedSkills.map((skill, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <BookOpen size={14} className="text-blue-600" />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-slate-900">
                                  {skill.skillId?.name || "Unknown Skill"}
                                </span>
                                {skill.skillId?.category && (
                                  <p className="text-xs text-slate-500">
                                    {skill.skillId.category}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md">
                              Gap: {skill.gapScore}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div
              className={`px-6 py-5 ${actionModal.type === "Accepted" ? "bg-gradient-to-r from-emerald-600 to-emerald-500" : "bg-gradient-to-r from-red-600 to-red-500"}`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {actionModal.type === "Accepted" ? (
                    <>
                      <CheckCircle size={22} /> Approve Request
                    </>
                  ) : (
                    <>
                      <XCircle size={22} /> Reject Request
                    </>
                  )}
                </h2>
                <button
                  onClick={() => {
                    setActionModal(null);
                    setReason("");
                  }}
                  className="text-white/90 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 mb-5">
                Are you sure you want to{" "}
                <span
                  className={`font-bold ${actionModal.type === "Accepted" ? "text-emerald-700" : "text-red-700"}`}
                >
                  {actionModal.type === "Accepted" ? "approve" : "reject"}
                </span>{" "}
                this request?
              </p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {actionModal.type === "Rejected" ? (
                    <>
                      Reason for Rejection <span className="text-red-500">*</span>
                    </>
                  ) : (
                    <>
                      Comments <span className="text-slate-400 font-normal">(optional)</span>
                    </>
                  )}
                </label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 resize-none"
                  placeholder={
                    actionModal.type === "Accepted"
                      ? "Add any comments or notes for the faculty..."
                      : "Please provide a clear reason for rejection..."
                  }
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                {actionModal.type === "Rejected" && !reason.trim() && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />A reason helps the faculty understand the decision
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActionModal(null);
                    setReason("");
                  }}
                  className="flex-1 border-2 border-slate-300 text-slate-700 rounded-lg py-3 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={submitting}
                  className={`flex-1 text-white rounded-lg py-3 font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${actionModal.type === "Accepted"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                    }`}
                >
                  {submitting ? "Processing..." : actionModal.type === "Accepted" ? "Approve Request" : "Reject Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approval;