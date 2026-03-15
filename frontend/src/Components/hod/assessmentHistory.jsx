import React, { useState, useEffect } from "react";
import axios from "axios";
import { History, FileText, User, BookOpen } from "lucide-react";

const AssessmentHistory = () => {
  const [assessmentsData, setAssessmentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/api/assessments/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssessmentsData(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load assessment history.");
    } finally {
      setLoading(false);
    }
  };

  // Derive unique faculty list from assessments
  const faculties = assessmentsData
    .filter(a => a.facultyId)
    .map(a => a.facultyId)
    // Basic deduplication by ID, though normally 1 assessment doc per faculty
    .filter((v, i, a) => a.findIndex(t => t._id === v._id) === i);

  // Get the selected faculty's assessment document
  const selectedAssessment = assessmentsData.find(
    a => a.facultyId?._id === selectedFacultyId
  );

  // Derive unique skills evaluated for the selected faculty (from their attemptsHistory)
  const availableSkillsForFaculty = selectedAssessment?.attemptsHistory
    ? selectedAssessment.attemptsHistory
        .map(h => h.skillId)
        .filter((v, i, a) => v && a.findIndex(t => t._id === v._id) === i)
    : [];

  // Get the filtered attempts to display
  let displayAttempts = [];
  if (selectedAssessment && selectedSkillId) {
    displayAttempts = selectedAssessment.attemptsHistory.filter(
      h => h.skillId?._id === selectedSkillId
    );
    // Sort by attempt number
    displayAttempts.sort((a, b) => a.attemptNumber - b.attemptNumber);
  }

  // Auto-reset skill selection when faculty changes
  useEffect(() => {
    setSelectedSkillId("");
  }, [selectedFacultyId]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
              <History size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Assessment History</h1>
              <p className="text-slate-500">Select a faculty member and skill to view detailed attempt histories.</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Faculty Selection */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <User size={16} />
              Select Faculty
            </label>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm bg-slate-50 outline-none"
              disabled={loading}
            >
              <option value="">-- Choose a Faculty Member --</option>
              {faculties.map(f => (
                <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
              ))}
            </select>
          </div>

          {/* Skill Selection */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <BookOpen size={16} />
              Select Evaluated Skill
            </label>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm bg-slate-50 outline-none disabled:opacity-50"
              disabled={!selectedFacultyId || availableSkillsForFaculty.length === 0}
            >
              <option value="">
                {!selectedFacultyId 
                  ? "Select a faculty first" 
                  : availableSkillsForFaculty.length === 0 
                    ? "No test attempts available" 
                    : "-- Choose a Skill --"}
              </option>
              {availableSkillsForFaculty.map(s => (
                <option key={s._id} value={s._id}>{s.category} - {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-semibold text-slate-700">Attempt Records</h2>
            {selectedSkillId && (
              <span className="text-sm font-medium px-3 py-1 bg-teal-50 text-teal-700 rounded-full">
                Total Attempts: {displayAttempts.length}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-slate-500 text-sm border-b border-slate-100">
                  <th className="font-medium py-4 px-6 w-24 text-center">Attempt #</th>
                  <th className="font-medium py-4 px-6">Date Taken</th>
                  <th className="font-medium py-4 px-6 text-right w-32">Score</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-12 text-slate-500">
                      Loading history records...
                    </td>
                  </tr>
                ) : !selectedFacultyId ? (
                  <tr>
                    <td colSpan="3" className="text-center py-16 text-slate-400 bg-slate-50/30">
                      <User size={32} className="mx-auto mb-3 opacity-50" />
                      <p>Please select a faculty member to view their history.</p>
                    </td>
                  </tr>
                ) : !selectedSkillId ? (
                  <tr>
                    <td colSpan="3" className="text-center py-16 text-slate-400 bg-slate-50/30">
                      <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
                      <p>Please select a skill to see the attempt breakdown.</p>
                    </td>
                  </tr>
                ) : displayAttempts.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-16 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText size={32} className="text-slate-300" />
                        <p>No logged attempts for this skill.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayAttempts.map((attempt) => (
                    <tr key={attempt._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-sm font-bold shadow-inner">
                          {attempt.attemptNumber}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                        {new Date(attempt.date).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-block px-4 py-1.5 bg-teal-50 text-teal-700 rounded-full text-base font-bold border border-teal-100 shadow-sm">
                          {attempt.score}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentHistory;
