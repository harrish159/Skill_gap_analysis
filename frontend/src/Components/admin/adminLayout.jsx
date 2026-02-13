import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./adminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;