import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Loader2, Target, CheckCircle, Search, Users, RefreshCw } from "lucide-react";

// --- Detail Component ---
const AssessmentDetail = ({ facultyId, onBack }) => {
  const [data, setData] = useState(null);
  const [hodRatings, setHodRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/assessments/faculty/${facultyId}`,
        );
        setData(res.data);

        // Initialize the local state with existing ratings
        const initial = {};
        res.data.skillRatings.forEach((sr) => {
          initial[sr.skillId._id] = sr.hodRating;
        });
        setHodRatings(initial);
      } catch (err) {
        alert("Error fetching skills");
      } finally {
        setLoading(false);
      }
    };
    if (facultyId) fetchSkills();
  }, [facultyId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        facultyId: facultyId,
        ratings: Object.keys(hodRatings).map((sId) => ({
          skillId: sId,
          hodRating: hodRatings[sId],
        })),
      };
      await axios.post("http://localhost:3000/api/assessments/save", payload);
      alert("Assessment saved successfully!");
      onBack();
    } catch (err) {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-10 text-center">Loading Assessment Data...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-slate-500 hover:text-black"
      >
        <ArrowLeft size={20} /> Back to List
      </button>

      <div className="bg-white rounded-3xl shadow-xl border p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black">{data.facultyId.name}</h1>
            <p className="text-slate-500">
              Evaluating against Master Skill Mappings
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Assessment
          </button>
        </div>

        <div className="space-y-4">
          {data.skillRatings.map((sr) => {
            const currentRating = hodRatings[sr.skillId._id] || 0;
            const required = sr.requiredRating;
            const gap = currentRating > 0 ? currentRating - required : null;

            let gapColor = "text-slate-400";
            let gapBg = "bg-slate-50";
            let gapText = "Pending";

            if (gap !== null) {
              if (gap < 0) {
                gapColor = "text-red-600";
                gapBg = "bg-red-50 border-red-200";
                gapText = `Gap: ${gap}`;
              } else if (gap === 0) {
                gapColor = "text-teal-600";
                gapBg = "bg-teal-50 border-teal-200";
                gapText = "Standard Met";
              } else {
                gapColor = "text-blue-600";
                gapBg = "bg-blue-50 border-blue-200";
                gapText = `Exceeds: +${gap}`;
              }
            }

            return (
              <div
                key={sr.skillId._id}
                className="p-6 border rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-all"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-teal-600 bg-teal-50 px-2 py-1 rounded">
                    {sr.skillId.category}
                  </span>
                  <h3 className="text-xl font-bold mt-1">{sr.skillId.name}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                      <Target size={14} /> Required: {required}
                    </div>
                    {/* Gap Indicator */}
                    <div className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${gapBg} ${gapColor}`}>
                      {gapText}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2 bg-white p-1 rounded-lg border">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() =>
                          setHodRatings((prev) => ({
                            ...prev,
                            [sr.skillId._id]: num,
                          }))
                        }
                        className={`w-10 h-10 rounded-md font-bold transition-all ${hodRatings[sr.skillId._id] === num
                            ? "bg-teal-600 text-white shadow-lg scale-105"
                            : "hover:bg-slate-100 text-slate-400"
                          }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  {hodRatings[sr.skillId._id] > 0 && (
                    <span className="text-[10px] font-black text-teal-600 flex items-center gap-1">
                      <CheckCircle size={12} /> RATED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- List Component ---
const FacultySelectionList = ({ onSelect }) => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    setLoading(true);
    try {
      // Reusing the same endpoint as FacultyList, or ideally a dedicated one
      const res = await axios.get("http://localhost:3000/api/allusers");
      setFaculties(res.data.filter((u) => u.role === "FACULTY"));
    } catch (err) {
      console.error("Error fetching faculty", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = faculties.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Faculty Assessments</h1>

      <div className="flex justify-between mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Search faculty..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={fetchFaculties} className="p-3 bg-white border rounded-xl hover:bg-slate-50">
          <RefreshCw size={20} className="text-slate-600" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((faculty) => (
            <div
              key={faculty._id}
              onClick={() => onSelect(faculty._id)}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg hover:border-teal-500 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-teal-50">
                  <Users className="text-slate-500 group-hover:text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{faculty.name}</h3>
                  <p className="text-sm text-slate-500">{faculty.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  Evaluate Now →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Wrapper ---
const Assessments = () => {
  const { facultyId } = useParams();
  const navigate = useNavigate();

  if (facultyId) {
    return (
      <AssessmentDetail
        facultyId={facultyId}
        onBack={() => navigate("/hod/assessments")}
      />
    );
  }

  return <FacultySelectionList onSelect={(id) => navigate(`/hod/assessment/${id}`)} />;
};

export default Assessments;
