const restrictToDepartment = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    // Admins have no department restrictions
    if (req.user.role === "ADMIN") {
        return next();
    }

    // Try to get from token first, then fallback to other properties if any
    const userDepartmentId = req.user.departmentId;

    if (!userDepartmentId) {
        console.warn(`[Restrict Middleware] User ${req.user.id} (${req.user.role}) has no departmentId assigned.`);
        return res.status(403).json({
            message: "Access Denied: Your account is not assigned to a department. Please contact an administrator or try logging out and back in.",
            missingDepartment: true
        });
    }

    // Inject departmentId into the query/body for convenience in controllers
    req.departmentId = userDepartmentId;

    next();
};

module.exports = restrictToDepartment;
