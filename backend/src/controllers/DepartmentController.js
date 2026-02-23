const Department = require("../schemas/DepartmentSchema");

// Create a new department (Admin only)
exports.createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        const department = new Department({ name, description });
        await department.save();
        res.status(201).json({ message: "Department created successfully", department });
    } catch (error) {
        res.status(500).json({ message: "Error creating department", error: error.message });
    }
};

// Get all departments (Admin only)
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching departments", error: error.message });
    }
};

// Get single department details
exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) return res.status(404).json({ message: "Department not found" });
        res.status(200).json(department);
    } catch (error) {
        res.status(500).json({ message: "Error fetching department", error: error.message });
    }
};
