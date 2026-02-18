import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "../Components/ProtectedRoute";

// Auth Pages
import Login from "../Pages/login";

// Admin Components
import AdminLayout from "../Components/admin/adminLayout";
import AdminDashboard from "../Components/admin/adminDashboard";
import AdminUsers from "../Components/admin/adminUsers";

// Faculty Components
import FacultyLayout from "../Components/faculty/facultyLayout";
import FacultyDashboard from "../Components/faculty/facultyDashboard";

import FacultyAssessment from "../Components/faculty/facultyAssessment";
import FacultyGaps from "../Components/faculty/facultyGaps";
import FacultyTraining from "../Components/faculty/facultyTraining";
// import FacultySettings from "../Components/faculty/facultySettings";

// HOD Components
import HodLayout from "../Components/hod/hodLayout";
import HodDashboard from "../Components/hod/hodDashboard";
import FacultyList from "../Components/hod/facultyList";
import Skill from "../Components/hod/skill";
import Mapping from "../Components/hod/mapping";
import Assessments from "../Components/hod/assessments";
import SkillGapDashboard from "../Components/hod/skillGap";
import TrainingHod from "../Components/hod/training_hod";
import Approval from "../Components/hod/approval";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Faculty Routes */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'admin']}>
              <FacultyLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/faculty/dashboard" replace />} />
          <Route path="dashboard" element={<FacultyDashboard />} />

          <Route path="assessment" element={<FacultyAssessment />} />
          <Route path="gaps" element={<FacultyGaps />} />
          <Route path="training" element={<FacultyTraining />} />
          {/* <Route path="settings" element={<FacultySettings />} /> */}
        </Route>

        {/* HOD Routes */}
        <Route
          path="/hod"
          element={
            <ProtectedRoute allowedRoles={['hod', 'admin']}>
              <HodLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/hod/dashboard" replace />} />
          <Route path="dashboard" element={<HodDashboard />} />
          <Route path="skills" element={<Skill />} />
          <Route path="mapping" element={<Mapping />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="assessment/:facultyId" element={<Assessments />} />
          <Route path="analytics" element={<SkillGapDashboard />} />
          <Route path="training" element={<TrainingHod />} />
          <Route path="faculty" element={<FacultyList />} />
          <Route path="approval" element={<Approval />} />
          {/* <Route path="reports" element={<Approval />} /> */}
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
