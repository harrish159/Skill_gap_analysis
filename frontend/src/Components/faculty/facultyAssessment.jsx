import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  Award,
  Target,
  User,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

/* ─── Helpers for Styling ─── */
const ratingLabel = (r) =>
  ["N/A", "Beginner", "Elementary", "Intermediate", "Advanced", "Expert"][
  r || 0
  ];

const ratingColor = (r) =>
  [
    "text-slate-400",
    "text-red-500",
    "text-orange-500",
    "text-amber-500",
    "text-blue-500",
    "text-emerald-500",
  ][r || 0];

const ratingBg = (r) =>
  [
    "bg-slate-50 border-slate-200",
    "bg-red-50 border-red-200",
    "bg-orange-50 border-orange-200",
    "bg-amber-50 border-amber-200",
    "bg-blue-50 border-blue-200",
    "bg-emerald-50 border-emerald-200",
  ][r || 0];

const Assessment = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const facultyId = sessionStorage.getItem("userId");

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        // Use the same endpoint as HOD to get the merged view (Required vs HOD Rating)
        const res = await axios.get(`https://skill-gap-analysis-aetw.onrender.com/api/assessments/faculty/${facultyId}`);
        // The API returns { facultyId, skillRatings: [...] }
        console.log("--> Faculty Assessment API Response:", res.data);
        setSkills(res.data.skillRatings || []);
      } catch (err) {
        console.error("--> Error fetching assessments:", err);
        setError("Failed to load assessment data.");
      } finally {
        setLoading(false);
      }
    };
    if (facultyId) fetchAssessments();
    else console.warn("--> No facultyId found in sessionStorage");
  }, [facultyId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Skill Proficiency Dashboard
            </h1>
            <p className="text-slate-500">
              View your required vs. achieved marks as assessed by the HOD.
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">
                Faculty ID
              </p>
              <p className="text-sm font-bold text-slate-700">
                {facultyId || "Not Logged In"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Skills Mapped</p>
            <p className="text-3xl font-bold text-slate-900">{skills.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">
              Proficiency Met
            </p>
            <p className="text-3xl font-bold text-emerald-600">
              {
                skills.filter((s) => (s.hodRating || 0) >= s.requiredRating)
                  .length
              }
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">Pending Review</p>
            <p className="text-3xl font-bold text-amber-500">
              {skills.filter((s) => !s.hodRating).length}
            </p>
          </div>
        </div>

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((mapping, index) => {
            const skill = mapping.skillId;

            // Safety Check: If skill is null (deleted reference), skip or show error
            if (!skill) {
              console.warn(`--> Missing skill data for mapping index ${index}`, mapping);
              return null;
            }

            const hodScore = mapping.hodRating || 0;
            const target = mapping.requiredRating;
            const isMet = hodScore >= target && hodScore > 0;

            return (
              <div
                key={mapping._id || index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 bg-purple-50 px-2 py-1 rounded">
                        {skill.category || "General"}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-2">
                        {skill.name || "Unknown Skill"}
                      </h3>
                    </div>
                    {hodScore > 0 && (
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${isMet ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                      >
                        {isMet ? (
                          <ShieldCheck size={14} />
                        ) : (
                          <AlertCircle size={14} />
                        )}
                        {isMet ? "Target Met" : "Below Target"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Progress Bar logic */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500 font-bold uppercase text-xs">
                          Assessed Score
                        </span>
                        <span className={`font-bold ${ratingColor(hodScore)}`}>
                          {hodScore > 0 ? `${hodScore} / 5` : "Pending"}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ${hodScore >= target ? "bg-emerald-500" : "bg-amber-500"}`}
                          style={{ width: `${(hodScore / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Comparison Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <Target size={14} />
                          <span className="text-[10px] font-bold uppercase">
                            Required
                          </span>
                        </div>
                        <p className="text-lg font-bold text-slate-700">
                          {target}/5
                        </p>
                      </div>
                      <div
                        className={`${ratingBg(hodScore)} p-3 rounded-xl border`}
                      >
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <Award size={14} />
                          <span className="text-[10px] font-bold uppercase">
                            Achieved
                          </span>
                        </div>
                        <p
                          className={`text-lg font-bold ${ratingColor(hodScore)}`}
                        >
                          {hodScore > 0 ? ratingLabel(hodScore) : "---"}
                        </p>
                      </div>
                    </div>

                    {hodScore === 0 && (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <TrendingUp size={16} className="animate-pulse" />
                        <p className="text-xs font-medium">
                          Awaiting manual entry from HOD
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {skills.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-medium">
              No skills have been mapped to your profile yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessment;
