import React, { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, Play, CheckCircle, AlertCircle, Clock } from "lucide-react";
import MCQTest from "./MCQTest";

const FacultyAssessmentPage = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showTest, setShowTest] = useState(false);
  const [assessments, setAssessments] = useState({});
  const [retakeRequests, setRetakeRequests] = useState({});
  const [requesting, setRequesting] = useState(false);

  const facultyId = sessionStorage.getItem("userId");

  useEffect(() => {
    fetchSkillsAndAssessments();
  }, []);

  const fetchSkillsAndAssessments = async () => {
    try {
      setLoading(true);
      // Fetch skills assigned to the department (assuming faculty sees all dept skills they can take)
      const skillsRes = await axios.get("https://skill-gap-analysis-aetw.onrender.com/api/skills");
      setSkills(skillsRes.data.filter(s => s.isActive));

      // Fetch existing assessments for this faculty to show scores
      const token = sessionStorage.getItem("token");
      const assessmentRes = await axios.get(`https://skill-gap-analysis-aetw.onrender.com/api/assessments/faculty/${facultyId}`, {
         headers: { Authorization: `Bearer ${token}` }
      });
      
      if (assessmentRes.data) {
        if (assessmentRes.data.skillRatings) {
          const ratingMap = {};
          assessmentRes.data.skillRatings.forEach(r => {
            ratingMap[r.skillId._id || r.skillId] = r.hodRating;
          });
          setAssessments(ratingMap);
        }
        if (assessmentRes.data.retakeRequests) {
          const reqMap = {};
          assessmentRes.data.retakeRequests.forEach(req => {
            reqMap[req.skillId._id || req.skillId] = req.status;
          });
          setRetakeRequests(reqMap);
        }
      }
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load assessments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (skill) => {
    setSelectedSkill(skill);
    setShowTest(true);
  };

  const handleTestComplete = () => {
    setShowTest(false);
    setSelectedSkill(null);
    fetchSkillsAndAssessments();
  };

  const handleRequestRetake = async (skill) => {
    try {
      setRequesting(true);
      const token = sessionStorage.getItem("token");
      await axios.post("https://skill-gap-analysis-aetw.onrender.com/api/assessments/request-retake", {
        skillId: skill._id
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Retake request submitted to HOD successfully.");
      fetchSkillsAndAssessments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit retake request.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  if (showTest && selectedSkill) {
    return (
      <MCQTest 
        skill={selectedSkill} 
        onComplete={handleTestComplete} 
        onCancel={() => setShowTest(false)}
      />
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 font-outfit">Skill Assessments</h1>
          <p className="text-slate-600">Complete AI-generated MCQ tests to evaluate your skills and identify gaps.</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skill) => {
            const score = assessments[skill._id];
            const isCompleted = score !== undefined && score !== null;

            return (
              <div key={skill._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                      <BookOpen size={24} />
                    </div>
                    {isCompleted ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                        <CheckCircle size={16} />
                        <span>Completed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-100">
                        <Clock size={16} />
                        <span>Pending</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{skill.name}</h3>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-2">
                    {skill.description || "No description available for this skill."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      {isCompleted ? (
                        <div className="text-sm font-medium text-slate-500">
                          Score: <span className="text-slate-900 font-bold">{score}%</span>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">
                          Target: <span className="font-semibold">{skill.targetScore || 80}%</span>
                        </div>
                      )}
                    </div>

                    {!isCompleted ? (
                      <button
                        onClick={() => handleStartTest(skill)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200"
                      >
                        Take Test
                        <Play size={16} fill="currentColor" />
                      </button>
                    ) : score >= (skill.targetScore || 80) ? (
                      <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle size={16} />
                        Skill Mastered
                      </div>
                    ) : retakeRequests[skill._id] === "pending" ? (
                      <button
                        disabled
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all bg-amber-50 text-amber-600 border border-amber-200 cursor-not-allowed"
                      >
                        <Clock size={16} />
                        Retake Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRequestRetake(skill)}
                        disabled={requesting}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                      >
                        {requesting ? "Requesting..." : "Request Retake"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FacultyAssessmentPage;
