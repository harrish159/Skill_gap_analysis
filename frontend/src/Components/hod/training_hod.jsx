import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import {
  GraduationCap,
  Clock,
  Plus,
  X,
  AlertCircle,
  Trash2,
  BookOpen,
  Monitor,
  Wifi,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";


const TrainingHod = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [skills, setSkills] = useState([]);

  const [newProgram, setNewProgram] = useState({
    title: "",
    description: "",
    provider: "",
    type: "",
    mode: "",
    durationHours: "",
    targetProficiencyLevel: "",
    startDate: "",
    deadline: "",
    skillsCovered: [
      { skillId: "", minGapScore: "10", maxGapScore: "100", improvesBy: "20" },
    ],
  });

  /* ============ FETCH ============ */
  const fetchAllPrograms = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://skill-gap-analysis-aetw.onrender.com/api/training");
      setPrograms(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching training programs:", err);
      if (err.response?.status === 403 && err.response?.data?.missingDepartment) {
        setError(err.response.data.message);
      } else {
        setError("Failed to load training programs");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await axios.get("https://skill-gap-analysis-aetw.onrender.com/api/skills");
      setSkills(res.data);
    } catch (err) {
      console.error("Error fetching skills:", err);
    }
  };

  useEffect(() => {
    fetchAllPrograms();
    fetchSkills();
  }, []);

  /* ============ ADD ============ */
  const handleAddProgram = async () => {
    if (
      !newProgram.title ||
      !newProgram.provider ||
      !newProgram.type ||
      !newProgram.mode ||
      !newProgram.startDate ||
      !newProgram.deadline
    ) {
      setError("Please fill in all required fields (including Dates)");
      return;
    }

    // Smart Filter: Ignore rows that have no skill selected
    const validSkills = newProgram.skillsCovered.filter((s) => s.skillId !== "");

    if (validSkills.length === 0) {
      setError("Please select at least one valid skill for the training.");
      return;
    }

    // Validation for non-empty Skill Rows
    for (const s of validSkills) {
      if (!s.minGapScore || Number(s.minGapScore) < 1) {
        setError("Min Gap Score must be at least 1 for all selected skills.");
        return;
      }
      if (!s.improvesBy || Number(s.improvesBy) < 1) {
        setError("Improves By score must be at least 1 for all selected skills.");
        return;
      }
    }

    try {
      const res = await axios.post("https://skill-gap-analysis-aetw.onrender.com/api/training", {
        ...newProgram,
        durationHours: Number(newProgram.durationHours),
        skillsCovered: validSkills.map((s) => ({
          ...s,
          minGapScore: Number(s.minGapScore),
          maxGapScore: s.maxGapScore ? Number(s.maxGapScore) : undefined,
          improvesBy: Number(s.improvesBy),
        })),
      });
      setPrograms([...programs, res.data.training]);
      setShowModal(false);
      setNewProgram({
        title: "",
        description: "",
        provider: "",
        type: "",
        mode: "",
        durationHours: "",
        targetProficiencyLevel: "",
        startDate: "",
        deadline: "",
        skillsCovered: [
          { skillId: "", minGapScore: "1", maxGapScore: "", improvesBy: "1" },
        ],
      });
      setError("");
    } catch (err) {
      console.error("DEBUG: Add Training Error:", err.response?.data || err);
      const msg = err.response?.data?.message || "Failed to add training program";
      setError(msg);
    }
  };

  /* ============ DELETE ============ */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this training program?")) return;
    try {
      await axios.delete(`https://skill-gap-analysis-aetw.onrender.com/api/training/${id}`);
      setPrograms(programs.filter((p) => p._id !== id));
    } catch (err) {
      setError("Failed to delete training program");
    }
  };

  /* ============ SKILLS COVERED ============ */
  const addSkillRow = () => {
    setNewProgram((prev) => ({
      ...prev,
      skillsCovered: [
        ...prev.skillsCovered,
        { skillId: "", minGapScore: "10", maxGapScore: "100", improvesBy: "20" },
      ],
    }));
  };

  const removeSkillRow = (index) => {
    setNewProgram((prev) => ({
      ...prev,
      skillsCovered: prev.skillsCovered.filter((_, i) => i !== index),
    }));
  };

  const updateSkillRow = (index, field, value) => {
    setNewProgram((prev) => {
      const updated = [...prev.skillsCovered];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, skillsCovered: updated };
    });
  };

  /* ============ HELPERS ============ */
  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const typeConfig = (type) => {
    const map = {
      workshop: {
        color: "bg-purple-100 text-purple-700 border-purple-200",
        icon: "🛠️",
      },
      course: {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: "📘",
      },
      certification: {
        color: "bg-amber-100 text-amber-700 border-amber-200",
        icon: "🏅",
      },
      webinar: {
        color: "bg-teal-100 text-teal-700 border-teal-200",
        icon: "🎙️",
      },
    };
    return (
      map[type] || {
        color: "bg-slate-100 text-slate-700 border-slate-200",
        icon: "📄",
      }
    );
  };

  const modeIcon = (mode) => {
    if (mode === "online") return <Wifi size={14} className="text-blue-500" />;
    if (mode === "offline")
      return <Monitor size={14} className="text-slate-500" />;
    return <Layers size={14} className="text-purple-500" />;
  };

  const levelColor = (level) => {
    const map = {
      beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
      intermediate: "bg-amber-100 text-amber-700 border-amber-200",
      advanced: "bg-red-100 text-red-700 border-red-200",
    };
    return map[level] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Loading training programs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Training Programs
              </h1>
              <p className="text-slate-600">
                Manage and monitor training initiatives
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-teal-700 transition-colors"
            >
              <Plus size={20} />
              Create Program
            </button>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Total Programs</div>
            <div className="text-3xl font-bold text-slate-900">
              {programs.length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Online</div>
            <div className="text-3xl font-bold text-blue-600">
              {programs.filter((p) => p.mode === "online").length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Certifications</div>
            <div className="text-3xl font-bold text-amber-600">
              {programs.filter((p) => p.type === "certification").length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Total Hours</div>
            <div className="text-3xl font-bold text-teal-600">
              {programs.reduce((sum, p) => sum + (p.durationHours || 0), 0)}
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        {programs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No training programs yet
            </h3>
            <p className="text-slate-600 mb-4">
              Get started by creating your first program
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus size={18} />
              Create Program
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {programs.map((program) => {
              const tc = typeConfig(program.type);
              return (
                <div
                  key={program._id}
                  className="bg-white border border-slate-200 rounded-lg hover:shadow-md hover:border-teal-300 transition-all duration-200"
                >
                  {/* Card Header */}
                  <div className="px-5 py-4 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {program.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {program.provider}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-xs px-2 py-1 rounded-md font-medium border ${tc.color}`}
                        >
                          {tc.icon} {program.type}
                        </span>
                        <button
                          onClick={() => handleDelete(program._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-5 py-4">
                    {program.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {program.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock size={15} className="text-slate-400" />
                        <span>{program.durationHours}h duration</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        {modeIcon(program.mode)}
                        <span className="capitalize">{program.mode}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <BookOpen size={15} className="text-slate-400" />
                        <span>
                          {program.skillsCovered?.length || 0} skills covered
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Monitor size={15} className="text-slate-400" />
                        <span className="text-xs">
                          {new Date(program.startDate).toLocaleDateString()} – {new Date(program.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Award size={15} className="text-slate-400" />
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${levelColor(program.targetProficiencyLevel)}`}
                        >
                          {program.targetProficiencyLevel}
                        </span>
                      </div>
                    </div>

                    {/* Skills Covered - Expandable */}
                    {program.skillsCovered?.length > 0 && (
                      <div>
                        <button
                          onClick={() => toggleExpand(program._id)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-sm text-slate-700 font-medium"
                        >
                          <span>Skills Covered</span>
                          {expandedCards[program._id] ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>

                        {expandedCards[program._id] && (
                          <div className="mt-2 space-y-2">
                            {program.skillsCovered.map((sc, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                              >
                                <div>
                                  <span className="font-semibold text-slate-900">
                                    {sc.skillId?.name || "Unknown Skill"}
                                  </span>
                                  <span className="text-xs text-slate-500 ml-2">
                                    {sc.skillId?.category}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-600">
                                  <span>
                                    Gap targets: {sc.minGapScore}%–{sc.maxGapScore || "100"}%
                                  </span>
                                  <span className="text-emerald-600 font-semibold">
                                    +{sc.improvesBy}% improvement
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Program Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl my-6">
            {/* Modal Header */}
            <div className="bg-teal-600 px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                Create Training Program
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Title + Provider */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                    placeholder="e.g., React Masterclass"
                    value={newProgram.title}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Provider <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                    placeholder="e.g., Coursera"
                    value={newProgram.provider}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, provider: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 resize-none"
                  placeholder="Brief description..."
                  value={newProgram.description}
                  onChange={(e) =>
                    setNewProgram({
                      ...newProgram,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Type + Mode + Duration + Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-slate-900"
                    value={newProgram.type}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, type: e.target.value })
                    }
                  >
                    <option value="">Select type</option>
                    <option value="workshop">Workshop</option>
                    <option value="course">Course</option>
                    <option value="certification">Certification</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-slate-900"
                    value={newProgram.mode}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, mode: e.target.value })
                    }
                  >
                    <option value="">Select mode</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Duration (hours) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                    placeholder="e.g., 20"
                    value={newProgram.durationHours}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        durationHours: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Target Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-slate-900"
                    value={newProgram.targetProficiencyLevel}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        targetProficiencyLevel: e.target.value,
                      })
                    }
                  >
                    <option value="">Select level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Start Date + Deadline */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                    value={newProgram.startDate}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                    value={newProgram.deadline}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, deadline: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Skills Covered */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Skills Covered <span className="text-red-500">*</span>
                    <span className="ml-2 inline-block px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] rounded border border-amber-100 font-normal">
                      Target 1% to 100% gap to reach all faculty
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={addSkillRow}
                    className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Skill
                  </button>
                </div>

                <div className="space-y-2">
                  {newProgram.skillsCovered.map((sc, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <div className="col-span-4 md:col-span-1">
                        <select
                          className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-900"
                          value={sc.skillId}
                          onChange={(e) =>
                            updateSkillRow(index, "skillId", e.target.value)
                          }
                        >
                          <option value="">Skill</option>
                          {skills.map((skill) => (
                            <option key={skill._id} value={skill._id}>
                              {skill.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                        placeholder="Min Gap % (e.g. 10)"
                        value={sc.minGapScore}
                        onChange={(e) =>
                          updateSkillRow(index, "minGapScore", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                        placeholder="Max Gap % (e.g. 100)"
                        value={sc.maxGapScore}
                        onChange={(e) =>
                          updateSkillRow(index, "maxGapScore", e.target.value)
                        }
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                          placeholder="+ Improv % (e.g. 20)"
                          value={sc.improvesBy}
                          onChange={(e) =>
                            updateSkillRow(index, "improvesBy", e.target.value)
                          }
                        />
                        {newProgram.skillsCovered.length > 1 && (
                          <button
                            onClick={() => removeSkillRow(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError("");
                  }}
                  className="flex-1 border border-slate-300 text-slate-700 rounded-lg py-2.5 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProgram}
                  className="flex-1 bg-teal-600 text-white rounded-lg py-2.5 font-medium hover:bg-teal-700 transition-colors"
                >
                  Create Program
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingHod;
