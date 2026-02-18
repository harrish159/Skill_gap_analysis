import React from "react";
import { Outlet } from "react-router-dom";
import FacultySidebar from "./facultySidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <FacultySidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
