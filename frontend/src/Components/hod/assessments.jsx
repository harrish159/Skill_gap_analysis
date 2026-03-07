import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Save, Loader2, Users, Search, ChevronRight, UserCircle, CheckCircle2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

/* ── List View Component ── */
const AssessmentList = ({ onSelect }) => {
  const [faculties, setFaculties] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch all faculty in department
        const facultyRes = await axios.get("http://localhost:3000/api/allusers");
        const list = facultyRes.data.filter(u => u.role === "FACULTY");
        setFaculties(list);

        // 2. Fetch all assessments to show status
        const assessmentRes = await axios.get("http://localhost:3000/api/assessments");
        setAssessments(assessmentRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load department faculty");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatus = (fId) => {
    const found = assessments.find(a => a.facultyId?._id === fId);
    return found ? found.status : "pending";
  };

  const filteredFaculties = faculties.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={s.loadingScreen}>
      <div style={s.loadingSpinner} />
      <p style={s.loadingText}>Fetching Faculty Records…</p>
    </div>
  );

  return (
    <div style={s.page}>
      <style>{cssText}</style>
      <div style={s.container}>
        <div style={{ ...s.header, justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
          <div style={s.headerMid}>
            <h1 style={{ ...s.facultyName, textAlign: 'left' }}>Department Assessments</h1>
            <p style={{ ...s.subLabel, textAlign: 'left' }}>Review and evaluate faculty skill levels</p>
          </div>
        </div>

        {error && <div style={s.errorAlert}>{error}</div>}

        {/* Search */}
        <div style={s.searchWrap}>
          <Search size={18} style={s.searchIcon} />
          <input
            style={s.searchInput}
            placeholder="Search faculty by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List */}
        <div style={s.listGrid}>
          {filteredFaculties.length === 0 ? (
            <div style={s.emptyState}>
              <Users size={48} color="#cbd5e1" />
              <p>No faculty members found</p>
            </div>
          ) : (
            filteredFaculties.map(f => {
              const status = getStatus(f._id);
              return (
                <div key={f._id} style={s.memberCard} onClick={() => onSelect(f._id)}>
                  <div style={s.memberLeft}>
                    <div style={s.memberAvatar}>{f.name.charAt(0)}</div>
                    <div>
                      <h3 style={s.memberName}>{f.name}</h3>
                      <p style={s.memberEmail}>{f.email}</p>
                    </div>
                  </div>
                  <div style={s.memberRight}>
                    {status === "reviewed" ? (
                      <span style={s.statusDone}><CheckCircle2 size={14} /> Reviewed</span>
                    ) : (
                      <span style={s.statusPending}>Needs Review</span>
                    )}
                    <ChevronRight size={18} color="#94a3b8" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Detail View Component ── */
const AssessmentDetail = ({ facultyId: propId, onBack }) => {
  const { facultyId: paramId } = useParams();
  const facultyId = propId || paramId;
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [hodRatings, setHodRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const goBack = onBack || (() => navigate("/hod/assessments"));

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/assessments/faculty/${facultyId}`
        );
        setData(res.data);
        const initial = {};
        res.data.skillRatings.forEach((sr) => {
          initial[sr.skillId._id] = sr.hodRating;
        });
        setHodRatings(initial);
      } catch (err) {
        console.error("Fetch Error:", err);
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
        facultyId,
        ratings: Object.keys(hodRatings).map((sId) => ({
          skillId: sId,
          hodRating: hodRatings[sId],
        })),
      };
      await axios.post("http://localhost:3000/api/assessments/save", payload);
      alert("Assessment saved successfully!");
      goBack();
    } catch (err) {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const ratedCount = Object.values(hodRatings).filter((v) => v > 0).length;
  const totalCount = data?.skillRatings?.length || 0;
  const progressPct = totalCount > 0 ? Math.round((ratedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div style={s.loadingScreen}>
        <div style={s.loadingSpinner} />
        <p style={s.loadingText}>Loading Assessment…</p>
        <style>{cssText}</style>
      </div>
    );
  }

  if (!data?.facultyId) return <div>Faculty not found</div>;

  return (
    <div style={s.page}>
      <style>{cssText}</style>

      <div style={s.container}>

        {/* ── Header ── */}
        <div style={s.header}>
          <button onClick={goBack} style={s.backBtn} className="back-btn">
            <ArrowLeft size={15} strokeWidth={2.5} />
            <span>Back</span>
          </button>

          <div style={s.headerMid}>
            <span style={s.evalChip}>HOD EVALUATION</span>
            <h1 style={s.facultyName}>{data.facultyId.name}</h1>
            <p style={s.subLabel}>Skill Assessment · Department Standards</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{ ...s.saveBtn, ...(saving ? s.saveBtnDisabled : {}) }}
            className="save-btn"
          >
            {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
            <span>{saving ? "Saving…" : "Save Assessment"}</span>
          </button>
        </div>

        {/* ── Progress strip ── */}
        <div style={s.progressCard}>
          <div style={s.progressLeft}>
            <span style={s.progressTitle}>Evaluation Progress</span>
            <span style={s.progressSub}>{ratedCount} of {totalCount} skills rated</span>
          </div>
          <div style={s.progressTrack}>
            <div style={{ ...s.progressFill, width: `${progressPct}%` }} />
          </div>
          <span style={s.progressPct}>{progressPct}%</span>
        </div>

        {/* ── Skill Cards ── */}
        <div style={s.grid}>
          {data.skillRatings.map((sr, idx) => {
            const current = hodRatings[sr.skillId._id] || 0;
            const required = sr.requiredRating;
            const gap = current > 0 ? current - required : null;

            let badge = { label: "Not Rated", color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0" };
            if (gap !== null) {
              if (gap < 0) badge = { label: `Gap ${gap}`, color: "#ef4444", bg: "#fff5f5", border: "#fecaca" };
              else if (gap === 0) badge = { label: "Meets Standard", color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" };
              else badge = { label: `Exceeds +${gap}`, color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" };
            }

            return (
              <div
                key={sr.skillId._id}
                style={{
                  ...s.card,
                  borderColor: current > 0 ? badge.border : "#e2e8f0",
                  animationDelay: `${idx * 55}ms`,
                }}
                className="skill-card"
              >
                {/* Card header */}
                <div style={s.cardTop}>
                  <div>
                    <span style={s.categoryTag}>{sr.skillId.category}</span>
                    <h3 style={s.skillName}>{sr.skillId.name}</h3>
                  </div>
                  <span style={{ ...s.gapBadge, color: badge.color, background: badge.bg, borderColor: badge.border }}>
                    {badge.label}
                  </span>
                </div>

                {/* Required row */}
                <div style={s.reqRow}>
                  <span style={s.reqLabel}>Required level</span>
                  <div style={s.pipRow}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} style={{ ...s.pip, background: n <= required ? "#0d9488" : "#e2e8f0" }} />
                    ))}
                    <span style={s.reqNum}>{required}</span>
                  </div>
                </div>

                <div style={s.divider} />

                {/* Rating buttons */}
                <div style={s.ratingRow}>
                  <span style={s.ratingLabel}>Your Rating</span>
                  <div style={s.btnGroup}>
                    {[1, 2, 3, 4, 5].map(num => {
                      const selected = current === num;
                      const filled = num < current;
                      return (
                        <button
                          key={num}
                          onClick={() => setHodRatings(prev => ({ ...prev, [sr.skillId._id]: num }))}
                          style={{
                            ...s.ratingBtn,
                            ...(selected ? s.ratingSelected : {}),
                            ...(filled && !selected ? s.ratingFilled : {}),
                          }}
                          className={selected ? "rating-selected" : "rating-btn-item"}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div style={s.footer}>
          <span style={s.footerNote}>{totalCount - ratedCount} skills remaining</span>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ ...s.saveBtn, ...s.saveBtnLg, ...(saving ? s.saveBtnDisabled : {}) }}
            className="save-btn"
          >
            {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
            <span>{saving ? "Saving…" : "Save & Submit Assessment"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

/* ── Main Entry ── */
const Assessments = () => {
  const { facultyId } = useParams();
  const navigate = useNavigate();

  if (facultyId) {
    return <AssessmentDetail facultyId={facultyId} onBack={() => navigate("/hod/assessments")} />;
  }

  return <AssessmentList onSelect={(id) => navigate(`/hod/assessment/${id}`)} />;
};

/* ── Styles ────────────────────────────────────── */
const s = {
  page: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    minHeight: "100vh",
    background: "#f0f4f3",
    color: "#0f2a25",
  },
  container: {
    maxWidth: "950px",
    margin: "0 auto",
    padding: "36px 24px 80px",
  },

  /* loading */
  loadingScreen: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: "100vh",
    background: "#f0f4f3",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
  },
  loadingSpinner: {
    width: "34px",
    height: "34px",
    border: "3px solid #ccebe7",
    borderTop: "3px solid #0d9488",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "#64748b",
    fontSize: "13px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    margin: 0,
  },

  /* header */
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "28px",
    gap: "16px",
    flexWrap: "wrap",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#fff",
    border: "1.5px solid #e2e8f0",
    color: "#475569",
    padding: "8px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "500",
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.18s",
  },
  headerMid: {
    flex: 1,
    textAlign: "center",
    minWidth: "180px",
  },
  evalChip: {
    display: "inline-block",
    fontSize: "10px",
    letterSpacing: "0.18em",
    fontWeight: "600",
    color: "#0d9488",
    background: "#f0fdfa",
    border: "1px solid #99f6e4",
    borderRadius: "20px",
    padding: "3px 10px",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  facultyName: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f2a25",
    margin: "0 0 3px",
    letterSpacing: "-0.02em",
  },
  subLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: 0,
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#0d9488",
    border: "none",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "inherit",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 12px rgba(13,148,136,0.25)",
    transition: "all 0.18s",
  },
  saveBtnLg: {
    padding: "12px 28px",
    fontSize: "14px",
    borderRadius: "12px",
  },
  saveBtnDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  /* Search */
  searchWrap: {
    position: 'relative',
    marginBottom: '20px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
  },
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    background: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
  },

  /* list */
  listGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  memberCard: {
    background: '#fff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '16px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  memberLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  memberAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: '#f0fdfa',
    border: '1px solid #99f6e4',
    color: '#0d9488',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '18px',
  },
  memberName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f2a25',
    margin: 0,
  },
  memberEmail: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: 0,
  },
  memberRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statusPending: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    background: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: '8px',
  },
  statusDone: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#0d9488',
    background: '#f0fdfa',
    padding: '4px 10px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },

  /* progress */
  progressCard: {
    background: "#fff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "14px",
    padding: "16px 22px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  progressLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: "160px",
  },
  progressTitle: {
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#94a3b8",
    fontWeight: "600",
  },
  progressSub: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },
  progressTrack: {
    flex: 1,
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "99px",
    overflow: "hidden",
    minWidth: "80px",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #0d9488, #14b8a6)",
    borderRadius: "99px",
    transition: "width 0.4s ease",
  },
  progressPct: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0d9488",
    minWidth: "36px",
    textAlign: "right",
  },

  /* grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
    gap: "14px",
  },

  /* card */
  card: {
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "16px",
    padding: "22px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    transition: "box-shadow 0.2s, border-color 0.2s, transform 0.15s",
    animation: "fadeUp 0.38s ease both",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "14px",
    gap: "12px",
  },
  categoryTag: {
    display: "block",
    fontSize: "10px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#0d9488",
    fontWeight: "600",
    marginBottom: "4px",
  },
  skillName: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f2a25",
    margin: 0,
    letterSpacing: "-0.01em",
    lineHeight: "1.35",
  },
  gapBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "7px",
    border: "1.5px solid",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  /* required pips */
  reqRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "14px",
  },
  reqLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    letterSpacing: "0.04em",
  },
  pipRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  pip: {
    width: "20px",
    height: "4px",
    borderRadius: "2px",
    transition: "background 0.2s",
  },
  reqNum: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#0d9488",
    marginLeft: "8px",
  },

  divider: {
    height: "1px",
    background: "#f1f5f9",
    marginBottom: "16px",
  },

  /* rating */
  ratingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  ratingLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    letterSpacing: "0.04em",
    flexShrink: 0,
  },
  btnGroup: {
    display: "flex",
    gap: "6px",
  },
  ratingBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.15s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  ratingFilled: {
    background: "#f0fdfa",
    borderColor: "#99f6e4",
    color: "#0d9488",
  },
  ratingSelected: {
    background: "#0d9488",
    borderColor: "#0d9488",
    color: "#fff",
    boxShadow: "0 2px 10px rgba(13,148,136,0.3)",
    transform: "scale(1.1)",
  },

  /* footer */
  footer: {
    marginTop: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "20px",
    borderTop: "1.5px solid #e2e8f0",
    paddingTop: "26px",
  },
  footerNote: {
    fontSize: "13px",
    color: "#94a3b8",
  },
};

const cssText = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .spin { animation: spin 0.8s linear infinite; }
  .back-btn:hover            { background:#f0fdfa !important; border-color:#0d9488 !important; color:#0d9488 !important; }
  .save-btn:hover            { background:#0f766e !important; box-shadow:0 4px 16px rgba(13,148,136,0.35) !important; }
  .skill-card:hover          { box-shadow:0 6px 24px rgba(13,148,136,0.1) !important; transform:translateY(-2px); }
  .rating-btn-item:hover     { background:#f0fdfa !important; border-color:#0d9488 !important; color:#0d9488 !important; }
  .rating-selected:hover     { background:#0f766e !important; }
  .member-card:hover         { border-color:#0d9488 !important; box-shadow:0 2px 12px rgba(13,148,136,0.1) !important; }
`;

export default Assessments;
