import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Users,
  Mail,
  RefreshCw,
  Filter,
  UserCircle,
} from "lucide-react";

const FacultyList = () => {
  const [faculties, setFaculties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFaculties = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/allusers");
      // Filter only faculty members
      const facultyMembers = res.data.filter((user) => user.role === "FACULTY");
      console.log("Faculties fetched:", facultyMembers);
      setFaculties(facultyMembers);
    } catch (error) {
      console.error("Error fetching faculties", error);
      if (error.response?.status === 403 && error.response?.data?.missingDepartment) {
        alert(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const filteredFaculties = faculties.filter(
    (faculty) =>
      faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-teal-500" size={28} />
              Faculty List
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage and view all faculty members
            </p>
          </div>
          <button
            onClick={fetchFaculties}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                Total Faculty
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {faculties.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <Users className="text-teal-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                Active
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {faculties.filter((f) => f.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <UserCircle className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                Search Results
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {filteredFaculties.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Filter className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent"></div>
          </div>
        ) : filteredFaculties.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500 font-medium">
              No faculty members found
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredFaculties.map((faculty) => (
                  <tr
                    key={faculty._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <span className="text-teal-600 font-semibold text-sm">
                            {faculty.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {faculty.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {faculty.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {faculty.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${faculty.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-800"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${faculty.isActive ? "bg-emerald-500" : "bg-slate-500"
                            }`}
                        ></span>
                        {faculty.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {!loading && filteredFaculties.length > 0 && (
        <div className="mt-4 text-sm text-slate-500 text-center">
          Showing {filteredFaculties.length} of {faculties.length} faculty
          members
        </div>
      )}
    </div>
  );
};

export default FacultyList;
