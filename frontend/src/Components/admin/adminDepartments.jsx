import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, X, AlertCircle, Building2 } from "lucide-react";

const AdminDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // add | edit
    const [selectedDept, setSelectedDept] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:3000/api/departments");
            setDepartments(res.data);
            setError("");
        } catch (err) {
            setError("Failed to load departments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleCreate = async () => {
        if (!formData.name) return setError("Name is required");
        try {
            await axios.post("http://localhost:3000/api/departments", formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            fetchDepartments();
            closeModal();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create department");
        }
    };

    const handleUpdate = async () => {
        // Note: Backend might need update route implementation
        setError("Update feature coming soon or not implemented on backend yet");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`http://localhost:3000/api/departments/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            fetchDepartments();
        } catch (err) {
            setError("Failed to delete department");
        }
    };

    const openAddModal = () => {
        setModalMode("add");
        setFormData({ name: "", description: "" });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setError("");
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Departments</h1>
                <button
                    onClick={openAddModal}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={20} /> Add Department
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex items-center gap-2"><AlertCircle size={20} /> {error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => (
                    <div key={dept._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">
                                <Building2 size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleDelete(dept._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{dept.name}</h3>
                        <p className="text-slate-600 text-sm mt-2">{dept.description || "No description"}</p>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{modalMode === "add" ? "Create Department" : "Edit Department"}</h2>
                            <button onClick={closeModal}><X /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full border rounded-lg p-2"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={modalMode === "add" ? handleCreate : handleUpdate}
                                className="w-full bg-teal-600 text-white p-2 rounded-lg font-bold"
                            >
                                {modalMode === "add" ? "Create" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDepartments;
