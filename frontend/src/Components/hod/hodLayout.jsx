import { Outlet } from "react-router-dom";
import HodSidebar from "./hodSidebar";
import NotificationDropdown from "./NotificationDropdown";

const HodLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Fixed */}
      <HodSidebar />

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        
        {/* Global HOD Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-6 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold shadow-sm">
              H
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default HodLayout;
