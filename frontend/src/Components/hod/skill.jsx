import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Code,
  Database,
  Globe,
  BookOpen,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const Skill = () => {
  const [skills, setSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "",
    description: "",
    createdBy: "HOD",
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/skills");
      setSkills(res.data.filter((skill) => skill.isActive));
      setError("");
    } catch (error) {
      console.error("Error fetching skills:", error);
      if (error.response?.status === 403 && error.response?.data?.missingDepartment) {
        setError(error.response.data.message);
      } else {
        setError("Failed to load skills");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddSkill = async () => {
    if (!newSkill.name || !newSkill.category) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      if (editMode) {
        await axios.put(
          `http://localhost:3000/api/skills/${editingId}`,
          newSkill,
        );
        setSkills(
          skills.map((skill) =>
            skill._id === editingId ? { ...skill, ...newSkill } : skill,
          ),
        );
      } else {
        const res = await axios.post(
          "http://localhost:3000/api/skills",
          newSkill,
        );
        setSkills([...skills, res.data.skill]);
      }

      setNewSkill({
        name: "",
        category: "",
        description: "",
        createdBy: "HOD",
      });
      setShowModal(false);
      setEditMode(false);
      setEditingId(null);
      setError("");
    } catch (error) {
      console.error("Error saving skill:", error);
      setError("Failed to save skill");
    }
  };

  const handleEditSkill = (skill) => {
    setNewSkill({
      name: skill.name,
      category: skill.category,
      description: skill.description || "",
      createdBy: skill.createdBy,
    });
    setEditingId(skill._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/skills/${id}`);
      setSkills(skills.filter((skill) => skill._id !== id));
      setError("");
    } catch (error) {
      console.error("Error deleting skill:", error);
      setError("Failed to delete skill");
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Technical":
        return <Code size={20} />;
      case "Research":
        return <Database size={20} />;
      case "Teaching":
        return <BookOpen size={20} />;
      case "Soft Skill":
        return <Globe size={20} />;
      default:
        return <Globe size={20} />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Technical: "bg-blue-100 text-blue-700 border-blue-200",
      Research: "bg-purple-100 text-purple-700 border-purple-200",
      Teaching: "bg-teal-100 text-teal-700 border-teal-200",
      "Soft Skill": "bg-amber-100 text-amber-700 border-amber-200",
    };
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getCategoryIconColor = (category) => {
    const colors = {
      Technical: "text-blue-600 bg-blue-50",
      Research: "text-purple-600 bg-purple-50",
      Teaching: "text-teal-600 bg-teal-50",
      "Soft Skill": "text-amber-600 bg-amber-50",
    };
    return colors[category] || "text-gray-600 bg-gray-50";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Manage Skills
              </h1>
              <p className="text-slate-600">
                Add, edit, and organize department skills
              </p>
            </div>

            <button
              onClick={() => {
                setShowModal(true);
                setEditMode(false);
                setNewSkill({
                  name: "",
                  category: "",
                  description: "",
                  createdBy: "HOD",
                });
              }}
              className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-teal-700 transition-colors"
            >
              <Plus size={20} />
              Add New Skill
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Total Skills</div>
            <div className="text-3xl font-bold text-slate-900">
              {skills.length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Technical</div>
            <div className="text-3xl font-bold text-slate-900">
              {skills.filter((s) => s.category === "Technical").length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Research</div>
            <div className="text-3xl font-bold text-slate-900">
              {skills.filter((s) => s.category === "Research").length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Teaching</div>
            <div className="text-3xl font-bold text-slate-900">
              {skills.filter((s) => s.category === "Teaching").length}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search skills by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Skills Grid */}
        {filteredSkills.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm ? "No skills found" : "No skills yet"}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm
                ? "Try adjusting your search term"
                : "Get started by adding your first skill"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setShowModal(true);
                  setEditMode(false);
                }}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus size={18} />
                Add Skill
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill) => (
              <div
                key={skill._id}
                className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md hover:border-teal-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-11 h-11 ${getCategoryIconColor(skill.category)} rounded-lg flex items-center justify-center flex-shrink-0 border`}
                    >
                      {getCategoryIcon(skill.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {skill.name}
                      </h3>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium border ${getCategoryColor(skill.category)}`}
                      >
                        {skill.category}
                      </span>
                    </div>
                  </div>
                </div>

                {skill.description && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                    {skill.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-bold">
                      {skill.createdBy.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {skill.createdBy}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSkill(skill)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit skill"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete skill"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Skill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl">
            {/* Modal Header */}
            <div className="bg-teal-600 px-6 py-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {editMode ? "Edit Skill" : "Add New Skill"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditMode(false);
                    setEditingId(null);
                    setError("");
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Skill Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Skill Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSkill.name}
                    onChange={(e) =>
                      setNewSkill({ ...newSkill, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 transition-all"
                    placeholder="e.g., React.js, Machine Learning, Public Speaking"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newSkill.category}
                    onChange={(e) =>
                      setNewSkill({ ...newSkill, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 transition-all bg-white"
                  >
                    <option value="">Select category</option>
                    <option value="Technical">Technical</option>
                    <option value="Teaching">Teaching</option>
                    <option value="Research">Research</option>
                    <option value="Soft Skill">Soft Skill</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newSkill.description}
                    onChange={(e) =>
                      setNewSkill({ ...newSkill, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 transition-all resize-none"
                    placeholder="Brief description of the skill..."
                    rows="4"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditMode(false);
                    setEditingId(null);
                    setError("");
                  }}
                  className="flex-1 border border-slate-300 text-slate-700 rounded-lg py-2.5 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSkill}
                  className="flex-1 bg-teal-600 text-white rounded-lg py-2.5 font-medium hover:bg-teal-700 transition-colors"
                >
                  {editMode ? "Update Skill" : "Add Skill"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skill;
