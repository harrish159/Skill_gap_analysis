// HodLayout.jsx
import { Outlet } from "react-router-dom";
import HodSidebar from "./hodSidebar";

const HodLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Fixed */}
      <HodSidebar />

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
};

export default HodLayout;
