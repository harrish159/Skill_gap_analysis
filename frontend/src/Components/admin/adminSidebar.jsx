import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  User,
  LogOut,
  Shield,
} from "lucide-react";

const AdminSidebar = () => {
  return (
    <aside className="w-[280px] h-screen bg-[#1e293b] border-r border-slate-700 flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Admin Panel</h1>
            <p className="text-xs text-slate-400">System Management</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <NavItem
          to="/admin/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
        />
        <NavItem to="/admin/users" icon={Users} label="Manage Users" />
        <NavItem to="/admin/analytics" icon={BarChart3} label="Analytics" />
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-slate-700 p-4 bg-slate-800/30">
        <div className="space-y-1">
          <NavItem to="/admin/profile" icon={User} label="Profile" />
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group">
            <LogOut
              size={18}
              className="transition-transform group-hover:translate-x-0.5"
            />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-slate-700 text-white"
          : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon
          size={18}
          className={`${
            isActive ? "text-amber-400" : "text-slate-400"
          } transition-colors flex-shrink-0`}
        />
        <span>{label}</span>
      </>
    )}
  </NavLink>
);

export default AdminSidebar;
