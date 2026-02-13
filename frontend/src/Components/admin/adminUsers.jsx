import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  AlertCircle,
  Key,
  Shield,
  Power,
  ArrowUp,
} from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add | edit | password | promote
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "FACULTY",
    isActive: true,
  });

  /* ============ FETCH USERS ============ */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/allusers");
      setUsers(res.data);
      setFilteredUsers(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ============ FILTER & SEARCH ============ */
  useEffect(() => {
    let result = users;

    // Role filter
    if (roleFilter !== "All") {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Search
    if (searchTerm) {
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  /* ============ ADD USER ============ */
  const handleAddUser = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      setError("Please fill in all required fields");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      const res = await axios.post("http://localhost:3000/api/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setUsers([...users, res.data.user]);
      closeModal();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user");
    }
  };

  /* ============ EDIT USER ============ */
  const handleEditUser = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      setError("Please fill in all required fields");
      return;
    }
    try {
      const res = await axios.put(
        `http://localhost:3000/api/users/${selectedUser._id}`,
        {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        },
      );
      setUsers(users.map((u) => (u._id === selectedUser._id ? res.data : u)));
      closeModal();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  /* ============ DELETE USER ============ */
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      setError("");
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  /* ============ RESET PASSWORD ============ */
  const handleResetPassword = async () => {
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      await axios.put(
        `http://localhost:3000/api/users/${selectedUser._id}/password`,
        {
          password: formData.password,
        },
      );
      closeModal();
      setError("");
      alert("Password reset successfully");
    } catch (err) {
      setError("Failed to reset password");
    }
  };

  /* ============ TOGGLE ACTIVE ============ */
  const handleToggleActive = async (user) => {
    try {
      const res = await axios.put(
        `http://localhost:3000/api/users/${user._id}`,
        {
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: !user.isActive,
        },
      );
      setUsers(users.map((u) => (u._id === user._id ? res.data : u)));
      setError("");
    } catch (err) {
      setError("Failed to update user status");
    }
  };

  /* ============ PROMOTE TO HOD ============ */
  const handlePromoteToHOD = async () => {
    try {
      const res = await axios.put(
        `http://localhost:3000/api/users/${selectedUser._id}`,
        {
          name: selectedUser.name,
          email: selectedUser.email,
          role: "HOD",
          isActive: selectedUser.isActive,
        },
      );
      setUsers(users.map((u) => (u._id === selectedUser._id ? res.data : u)));
      closeModal();
      setError("");
    } catch (err) {
      setError("Failed to promote user");
    }
  };

  /* ============ MODAL HELPERS ============ */
  const openAddModal = () => {
    setModalMode("add");
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "FACULTY",
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setShowModal(true);
  };

  const openPasswordModal = (user) => {
    setModalMode("password");
    setSelectedUser(user);
    setFormData({ ...formData, password: "" });
    setShowModal(true);
  };

  const openPromoteModal = (user) => {
    setModalMode("promote");
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "FACULTY",
      isActive: true,
    });
  };

  /* ============ HELPERS ============ */
  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "HOD":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "FACULTY":
        return "bg-teal-100 text-teal-700 border-teal-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                User Management
              </h1>
              <p className="text-slate-600">
                Add, edit, and manage system users
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:bg-teal-700 transition-colors"
            >
              <Plus size={20} />
              Add User
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle
              className="text-red-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Total Users</div>
            <div className="text-3xl font-bold text-slate-900">
              {users.length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Faculty</div>
            <div className="text-3xl font-bold text-teal-600">
              {users.filter((u) => u.role === "FACULTY").length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">HODs</div>
            <div className="text-3xl font-bold text-blue-600">
              {users.filter((u) => u.role === "HOD").length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">Admins</div>
            <div className="text-3xl font-bold text-purple-600">
              {users.filter((u) => u.role === "ADMIN").length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
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
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-slate-900 appearance-none"
              >
                <option value="All">All Roles</option>
                <option value="FACULTY">Faculty</option>
                <option value="HOD">HOD</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No users found
              </h3>
              <p className="text-slate-600">
                Try adjusting your filters or search
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 border border-teal-200 rounded-lg flex items-center justify-center">
                            <span className="text-teal-700 font-bold text-sm">
                              {user.name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${getRoleColor(user.role)}`}
                        >
                          <Shield size={12} />
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                            user.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          }`}
                        >
                          <Power size={12} />
                          {user.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.role === "FACULTY" && (
                            <button
                              onClick={() => openPromoteModal(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Promote to HOD"
                            >
                              <ArrowUp size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => openPasswordModal(user)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Reset password"
                          >
                            <Key size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            {/* Modal Header */}
            <div className="bg-teal-600 px-6 py-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {modalMode === "add" && "Add New User"}
                  {modalMode === "edit" && "Edit User"}
                  {modalMode === "password" && "Reset Password"}
                  {modalMode === "promote" && "Promote to HOD"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {modalMode === "promote" ? (
                <div>
                  <p className="text-sm text-slate-600 mb-4">
                    Are you sure you want to promote{" "}
                    <span className="font-bold text-slate-900">
                      {selectedUser?.name}
                    </span>{" "}
                    from Faculty to HOD?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 border border-slate-300 text-slate-700 rounded-lg py-2.5 font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePromoteToHOD}
                      className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 transition-colors"
                    >
                      Promote to HOD
                    </button>
                  </div>
                </div>
              ) : modalMode === "password" ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 mb-6"
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 border border-slate-300 text-slate-700 rounded-lg py-2.5 font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetPassword}
                      className="flex-1 bg-teal-600 text-white rounded-lg py-2.5 font-medium hover:bg-teal-700 transition-colors"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Password (Add mode only) */}
                  {modalMode === "add" && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                        placeholder="Min 6 characters"
                      />
                    </div>
                  )}

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-slate-900"
                    >
                      <option value="FACULTY">Faculty</option>
                      <option value="HOD">HOD</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  {/* Status (Edit mode only) */}
                  {modalMode === "edit" && (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                      />
                      <label
                        htmlFor="isActive"
                        className="text-sm font-medium text-slate-700"
                      >
                        Account is active
                      </label>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 border border-slate-300 text-slate-700 rounded-lg py-2.5 font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={
                        modalMode === "add" ? handleAddUser : handleEditUser
                      }
                      className="flex-1 bg-teal-600 text-white rounded-lg py-2.5 font-medium hover:bg-teal-700 transition-colors"
                    >
                      {modalMode === "add" ? "Add User" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
