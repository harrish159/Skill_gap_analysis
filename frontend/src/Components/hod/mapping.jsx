import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link2, Plus, X, Trash2, AlertCircle } from "lucide-react";

const Mapping = () => {
  const [skills, setSkills] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newMapping, setNewMapping] = useState({
    skillId: "",
    requiredRating: "",
  });

  /* ================= FETCH DATA ================= */

  const fetchSkills = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/skills");
      setSkills(res.data);
    } catch (err) {
      setError("Failed to load skills");
    }
  };

  const fetchMappings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/mappingSkill");
      setMappings(res.data);
    } catch (err) {
      setError("Failed to load mappings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchMappings();
  }, []);

  /* ================= ADD MAPPING ================= */

  const handleAddMapping = async () => {
    if (!newMapping.skillId || !newMapping.requiredRating) {
      setError("Please fill all fields");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/mappingSkill", {
        skillId: newMapping.skillId,
        requiredRating: Number(newMapping.requiredRating),
      });

      setNewMapping({ skillId: "", requiredRating: "" });
      setShowModal(false);
      setError("");
      fetchMappings();
    } catch (err) {
      setError("Failed to add mapping");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this mapping?"))
      return;

    try {
      await axios.delete(`http://localhost:3000/api/mappingSkill/${id}`);
      fetchMappings();
    } catch (err) {
      setError("Failed to delete mapping");
    }
  };

  /* ================= RATING STARS ================= */

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? "text-amber-400" : "text-gray-300"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  /* ================= CATEGORY BADGE ================= */

  const getCategoryColor = (category) => {
    const colors = {
      Technical: "bg-blue-100 text-blue-700",
      Soft: "bg-purple-100 text-purple-700",
      Leadership: "bg-green-100 text-green-700",
      Design: "bg-pink-100 text-pink-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2.5 rounded-xl shadow-lg">
                  <Link2 className="text-white" size={28} />
                </div>
                Skill Mapping
              </h1>
              <p className="text-slate-600 ml-1">
                Manage required skill levels for performance benchmarks
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-300 hover:scale-105 transition-all duration-200"
            >
              <Plus size={20} />
              Add Mapping
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Total Mappings</div>
            <div className="text-3xl font-bold text-slate-900">
              {mappings.length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Available Skills</div>
            <div className="text-3xl font-bold text-slate-900">
              {skills.length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">
              Avg Required Rating
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {mappings.length > 0
                ? (
                    mappings.reduce((sum, m) => sum + m.requiredRating, 0) /
                    mappings.length
                  ).toFixed(1)
                : "0"}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Loading mappings...</p>
            </div>
          ) : mappings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link2 className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No mappings yet
              </h3>
              <p className="text-slate-600 mb-4">
                Get started by adding your first skill mapping
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus size={18} />
                Add Mapping
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Skill Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Required Level
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {mappings.map((map, index) => (
                    <tr
                      key={map._id}
                      className="hover:bg-slate-50 transition-colors duration-150"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {map.skillId?.name || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                            map.skillId?.category,
                          )}`}
                        >
                          {map.skillId?.category || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-teal-600">
                            {map.requiredRating}
                          </span>
                          <span className="text-sm text-slate-500">/ 5</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderStars(map.requiredRating)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(map._id)}
                          className="inline-flex items-center gap-2 text-red-600 hover:text-white hover:bg-red-600 px-3 py-2 rounded-lg transition-all duration-200 group"
                        >
                          <Trash2
                            size={16}
                            className="group-hover:scale-110 transition-transform"
                          />
                          <span className="text-sm font-medium">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-5 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  Add Skill Mapping
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError("");
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Skill Selection */}
              <div className="mb-5">
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Select Skill
                </label>
                <select
                  className="w-full border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 p-3 rounded-lg transition-all outline-none bg-white text-slate-900 font-medium"
                  value={newMapping.skillId}
                  onChange={(e) =>
                    setNewMapping({ ...newMapping, skillId: e.target.value })
                  }
                >
                  <option value="">Choose a skill...</option>
                  {skills.map((skill) => (
                    <option key={skill._id} value={skill._id}>
                      {skill.name} ({skill.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Selection */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Required Rating Level
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        setNewMapping({
                          ...newMapping,
                          requiredRating: String(rating),
                        })
                      }
                      className={`p-3 rounded-lg border-2 font-bold transition-all ${
                        newMapping.requiredRating === String(rating)
                          ? "bg-teal-600 text-white border-teal-600 shadow-lg scale-105"
                          : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                {newMapping.requiredRating && (
                  <div className="mt-3 flex justify-center">
                    {renderStars(Number(newMapping.requiredRating))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError("");
                  }}
                  className="flex-1 border-2 border-slate-200 text-slate-700 rounded-lg py-3 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMapping}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg py-3 font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Add Mapping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Mapping;
